import { describe, expect, it } from "vitest";
import { CASE_01_ABSTRACT } from "@/content/cases/case-01";
import { CASE_02_ABSTRACT } from "@/content/cases/case-02";
import { CASE_03_ABSTRACT } from "@/content/cases/case-03";
import { decoderSamples } from "@/content/samples";
import type { LiveConfig } from "@/lib/analysis/config";
import { isUrlOnly } from "@/lib/analysis/errors";
import { handleAnalyze } from "@/lib/analysis/handle-analyze";
import { ProviderError, type AnalysisProvider } from "@/lib/analysis/provider";
import { assembleAnalysis, validateModelAnalysis } from "@/lib/analysis/response-validation";
import { normalizeInput, segmentSource } from "@/lib/analysis/source-segmentation";
import { checkLiveBudget, MemoryRateLimiter, type RateLimiter } from "@/lib/rate-limit";

describe("source segmentation", () => {
  it("splits the fixtures into the sentence IDs the samples rely on", () => {
    expect(segmentSource(normalizeInput(CASE_01_ABSTRACT)).map((s) => s.text.slice(0, 22))).toEqual([
      "In a fictional randomi",
      "During five years of f",
      "These counts correspon",
      "The observed relative ",
      "Confidence intervals, ",
    ]);
    expect(segmentSource(CASE_02_ABSTRACT)).toHaveLength(5);
    expect(segmentSource(CASE_03_ABSTRACT)).toHaveLength(4);
  });

  it("does not split on decimals, abbreviations or initials", () => {
    const text =
      "Risk fell from 2.0% to 1.5% vs. controls (e.g. in adults). Smith J. et al. reported it. J. K. Lee agreed. We gave vitamin D. Next sentence here.";
    expect(segmentSource(text).map((s) => s.text)).toEqual([
      "Risk fell from 2.0% to 1.5% vs. controls (e.g. in adults).",
      "Smith J. et al. reported it.",
      "J. K. Lee agreed.",
      "We gave vitamin D.",
      "Next sentence here.",
    ]);
  });

  it("treats line breaks as boundaries and offsets map back to the normalized text", () => {
    const normalized = normalizeInput("BACKGROUND: Something.\r\n\r\nMETHODS: We did a thing. Then another.");
    const segs = segmentSource(normalized);
    expect(segs.map((s) => s.id)).toEqual(["S1", "S2", "S3"]);
    for (const s of segs) expect(normalized.slice(s.start, s.end)).toBe(s.text);
  });

  it("is deterministic", () => {
    expect(segmentSource(CASE_01_ABSTRACT)).toEqual(segmentSource(CASE_01_ABSTRACT));
  });
});

const sample = decoderSamples[0];
const sentences = segmentSource(normalizeInput(sample.text));

describe("response validation", () => {
  it("rejects unknown source sentence IDs", () => {
    const bad = { ...sample.analysis, findings: [{ ...sample.analysis.findings[0], sourceSentenceIds: ["S99"] }] };
    const r = validateModelAnalysis(bad, sentences);
    expect(r.ok).toBe(false);
    expect(!r.ok && r.problems[0]).toMatch(/S99/);
  });

  it("rejects model-written links and DOIs", () => {
    for (const ref of ["See https://example.org/paper", "doi: 10.1234/abcd.5678", "Published at journalsite.com"]) {
      const bad = { ...sample.analysis, summary: ref };
      expect(validateModelAnalysis(bad, sentences).ok, ref).toBe(false);
    }
  });

  it("rejects malformed shapes", () => {
    expect(validateModelAnalysis({ summary: 3 }, sentences).ok).toBe(false);
  });

  it("drops counts that don't appear in the cited sentences instead of calculating from them", () => {
    const tampered = {
      ...sample.analysis,
      numericResults: [
        { ...sample.analysis.numericResults[0], groupCounts: { ...sample.analysis.numericResults[0].groupCounts!, baselineEvents: 40 } },
      ],
    };
    const r = validateModelAnalysis(tampered, sentences);
    expect(r.ok && r.analysis.numericResults[0].groupCounts).toBeNull();
  });

  it("sets origin and coverage in application code even if the model tries to", () => {
    const sneaky = { ...sample.analysis, origin: "prewritten_sample", coverage: "full_paper" };
    const r = validateModelAnalysis(sneaky, sentences);
    if (!r.ok) throw new Error("expected ok");
    const a = assembleAnalysis(r.analysis, {
      origin: "ai_generated",
      provenanceNote: null,
      userTitle: null,
      sourceText: normalizeInput(sample.text),
      sentences,
    });
    expect(a.origin).toBe("ai_generated");
    expect(a.coverage).toBe("pasted_abstract");
    expect(a.sourceSentences.find((s) => s.id === "S2")!.text).toContain("20 participants in the comparison group");
  });
});

const baseConfig: LiveConfig = {
  enabled: true,
  reason: null,
  apiKey: "test",
  model: "test-model",
  effort: "medium",
  timeoutMs: 5000,
  perClientLimit: 5,
  deploymentLimit: 100,
  windowMs: 600_000,
  trustedClientHeader: null,
};

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function fakeProvider(outputs: Array<string | Error>): AnalysisProvider & { calls: number } {
  const p = {
    calls: 0,
    async generate() {
      const next = outputs[Math.min(p.calls, outputs.length - 1)];
      p.calls++;
      if (next instanceof Error) throw next;
      return { kind: "ok" as const, text: next };
    },
  };
  return p;
}

const validOutput = JSON.stringify(sample.analysis);

describe("POST /api/analyze handler", () => {
  const deps = (overrides: Partial<Parameters<typeof handleAnalyze>[1]> = {}, provider = fakeProvider([validOutput])) => ({
    config: baseConfig,
    limiter: new MemoryRateLimiter(),
    createProvider: () => provider,
    ...overrides,
  });

  it("rejects empty, malformed, too-long and URL-only input", async () => {
    const cases: Array<[unknown, string]> = [
      [{ text: "   " }, "empty_input"],
      ["{oops", "invalid_request"],
      [{ nope: 1 }, "invalid_request"],
      [{ text: "a".repeat(15_001) }, "too_long"],
      [{ text: "https://example.org/paper/123" }, "url_only"],
    ];
    for (const [body, code] of cases) {
      const res = await handleAnalyze(request(body), deps());
      expect((await res.json()).error.code, code).toBe(code);
      expect(res.headers.get("cache-control")).toBe("no-store");
    }
  });

  it("enforces the byte limit", async () => {
    const res = await handleAnalyze(request({ text: "é".repeat(31_000) }), deps());
    expect(res.status).toBe(413);
    expect((await res.json()).error.code).toBe("request_too_large");
  });

  it("returns live_unavailable when the provider is disabled, without calling it", async () => {
    const provider = fakeProvider([validOutput]);
    const res = await handleAnalyze(
      request({ text: sample.text }),
      deps({ config: { ...baseConfig, enabled: false, reason: "disabled" } }, provider),
    );
    expect(res.status).toBe(503);
    expect(provider.calls).toBe(0);
  });

  it("returns an AI-labeled analysis with anchors from the input", async () => {
    const res = await handleAnalyze(request({ text: sample.text }), deps());
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.analysis.origin).toBe("ai_generated");
    expect(body.analysis.provenanceNote).toBeNull();
    expect(body.analysis.sourceSentences).toHaveLength(5);
  });

  it("makes at most one repair attempt for invalid output", async () => {
    const provider = fakeProvider(["not json", "still not json", validOutput]);
    const res = await handleAnalyze(request({ text: sample.text }), deps({}, provider));
    expect((await res.json()).error.code).toBe("invalid_response");
    expect(provider.calls).toBe(2);

    const fixed = fakeProvider(["{}", validOutput]);
    const ok = await handleAnalyze(request({ text: sample.text }), deps({}, fixed));
    expect(ok.status).toBe(200);
    expect(fixed.calls).toBe(2);
  });

  it("maps provider timeouts and outages to sanitized codes", async () => {
    const timeout = await handleAnalyze(request({ text: sample.text }), deps({}, fakeProvider([new ProviderError("timeout")])));
    expect((await timeout.json()).error).toEqual({ code: "timeout", message: expect.not.stringMatching(/ProviderError/) });
    const outage = await handleAnalyze(request({ text: sample.text }), deps({}, fakeProvider([new Error("secret stack")])));
    const body = await outage.json();
    expect(body.error.code).toBe("provider_unavailable");
    expect(JSON.stringify(body)).not.toContain("secret stack");
  });

  it("rate limits through an injected limiter and sets Retry-After", async () => {
    const denyAll: RateLimiter = { consume: () => ({ allowed: false, retryAfterSeconds: 42 }) };
    const res = await handleAnalyze(request({ text: sample.text }), deps({ limiter: denyAll }));
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBe("42");
  });
});

describe("rate limiter", () => {
  it("limits per client and per deployment within a window", () => {
    const l = new MemoryRateLimiter();
    const opts = { perClientLimit: 2, deploymentLimit: 3, windowMs: 1000 };
    expect(checkLiveBudget(l, "a", opts, 0).allowed).toBe(true);
    expect(checkLiveBudget(l, "a", opts, 1).allowed).toBe(true);
    expect(checkLiveBudget(l, "a", opts, 2).allowed).toBe(false);
    expect(checkLiveBudget(l, "b", opts, 3).allowed).toBe(true);
    expect(checkLiveBudget(l, "c", opts, 4).allowed).toBe(false);
    expect(checkLiveBudget(l, "a", opts, 1001).allowed).toBe(true);
  });
});

describe("url-only detection", () => {
  it("flags bare links and DOIs but not abstracts that mention one", () => {
    expect(isUrlOnly("https://doi.org/10.1000/xyz")).toBe(true);
    expect(isUrlOnly("10.1000/xyz123")).toBe(true);
    expect(isUrlOnly("We studied 40 adults. Data at https://example.org.")).toBe(false);
  });
});
