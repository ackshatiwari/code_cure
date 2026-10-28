"use client";

import { CircleAlert, Info, LoaderCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { buildSampleAnalysis, decoderSamples, findSampleForText, getDecoderSample } from "@/content/samples";
import {
  analyzeErrorMessages,
  isUrlOnly,
  MAX_INPUT_CHARS,
  MAX_TITLE_CHARS,
  type AnalyzeErrorCode,
} from "@/lib/analysis/errors";
import { normalizeInput } from "@/lib/analysis/source-segmentation";
import { decoderAnalysisSchema, type DecoderAnalysis } from "@/lib/schemas/analysis";
import { useHydrated } from "@/lib/use-hydrated";
import { announce } from "@/components/ui/Announcer";
import { buttonClass, cx } from "@/components/ui/styles";
import { DecoderOutput } from "./DecoderOutput";

type Capability = "checking" | "available" | "unavailable";
type Status = "idle" | "submitting" | "success" | "error";

const RETRYABLE: AnalyzeErrorCode[] = ["timeout", "cancelled", "provider_unavailable", "invalid_response", "rate_limited"];

/**
 * Pasted text and analyses stay in this component's memory only: never in the URL,
 * browser storage or analytics. Samples are matched by exact text, so edited or
 * unrelated input never receives a prewritten analysis.
 */
export function DecoderWorkspace() {
  const uid = useId();
  const params = useSearchParams();
  const hydrated = useHydrated();
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [capability, setCapability] = useState<Capability>("checking");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<{ code: AnalyzeErrorCode; message: string } | null>(null);
  const [analysis, setAnalysis] = useState<DecoderAnalysis | null>(null);
  const [analyzedText, setAnalyzedText] = useState<string | null>(null);
  const [resultKey, setResultKey] = useState(0);
  const seq = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const appliedSample = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/capabilities", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { liveAnalysis?: boolean }) => !cancelled && setCapability(d.liveAnalysis ? "available" : "unavailable"))
      .catch(() => !cancelled && setCapability("unavailable"));
    return () => {
      cancelled = true;
    };
  }, []);

  // A curated sample may be named in the URL (?sample=id). Arbitrary text never is.
  const sampleParam = params.get("sample");
  useEffect(() => {
    if (!sampleParam || appliedSample.current === sampleParam) return;
    const s = getDecoderSample(sampleParam);
    if (!s) return;
    appliedSample.current = sampleParam;
    loadSample(s.id, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sampleParam]);

  // Abort any in-flight request when the decoder unmounts or is hidden.
  useEffect(() => () => controller.current?.abort(), []);

  function showResult(a: DecoderAnalysis, source: string) {
    setResultKey((k) => k + 1);
    setAnalysis(a);
    setAnalyzedText(source);
    setStatus("success");
    setError(null);
    requestAnimationFrame(() => resultRef.current?.focus());
  }

  function showError(code: AnalyzeErrorCode, message?: string) {
    setStatus("error");
    setError({ code, message: message ?? analyzeErrorMessages[code] });
    requestAnimationFrame(() => errorRef.current?.focus());
  }

  function loadSample(id: string, analyze: boolean) {
    const s = getDecoderSample(id);
    if (!s) return;
    controller.current?.abort();
    seq.current++;
    setText(s.text);
    setTitle(s.title);
    setError(null);
    if (analyze) showResult(buildSampleAnalysis(s), normalizeInput(s.text));
    else {
      setStatus("idle");
      announce(`${s.label} loaded. Select Decode abstract to read it.`);
    }
  }

  async function decode() {
    const normalized = normalizeInput(text);
    if (!normalized) return showError("empty_input");
    if (normalized.length > MAX_INPUT_CHARS) return showError("too_long");
    if (isUrlOnly(normalized)) return showError("url_only");

    const sample = findSampleForText(normalized);
    if (sample) {
      controller.current?.abort();
      seq.current++;
      return showResult(buildSampleAnalysis(sample), normalized);
    }
    if (capability === "unavailable") return showError("live_unavailable");

    controller.current?.abort();
    const ac = new AbortController();
    controller.current = ac;
    const mine = ++seq.current;
    setStatus("submitting");
    setError(null);
    announce("Reading the supplied text.");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: normalized, title: title.trim() || null }),
        signal: ac.signal,
        cache: "no-store",
      });
      const body = await res.json().catch(() => null);
      if (mine !== seq.current) return; // A newer request or a cancel replaced this one.
      if (!res.ok || !body?.ok) {
        const code = (body?.error?.code as AnalyzeErrorCode) ?? "provider_unavailable";
        if (code === "live_unavailable") setCapability("unavailable");
        return showError(code, analyzeErrorMessages[code] ?? analyzeErrorMessages.provider_unavailable);
      }
      const parsed = decoderAnalysisSchema.safeParse(body.analysis);
      if (!parsed.success || parsed.data.sourceText !== normalized) return showError("invalid_response");
      showResult(parsed.data, normalized);
      announce("Explanation ready.");
    } catch {
      if (mine !== seq.current) return;
      showError(ac.signal.aborted ? "cancelled" : "provider_unavailable");
    }
  }

  function cancel() {
    seq.current++;
    controller.current?.abort();
    controller.current = null;
    showError("cancelled");
  }

  const count = text.length;
  const over = count > MAX_INPUT_CHARS;
  const stale = analysis !== null && analyzedText !== null && normalizeInput(text) !== analyzedText;
  const textIsSample = !!findSampleForText(text);

  return (
    <div>
      <form
        className="max-w-3xl space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (status !== "submitting") void decode();
        }}
        aria-describedby={`${uid}-scope`}
      >
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <label htmlFor={`${uid}-text`} className="text-[1.0625rem] font-semibold">
              Abstract text
            </label>
            <span id={`${uid}-count`} className={cx("text-meta tabular", over ? "font-semibold text-critical" : "text-ink-muted")}>
              {count.toLocaleString("en-US")} / {MAX_INPUT_CHARS.toLocaleString("en-US")} characters
            </span>
          </div>
          <p id={`${uid}-hint`} className="text-[0.9375rem] text-ink-muted">
            Paste public research text, not personal medical records.
          </p>
          <textarea
            id={`${uid}-text`}
            rows={11}
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-describedby={`${uid}-hint ${uid}-count${error && ["empty_input", "too_long", "url_only"].includes(error.code) ? ` ${uid}-err` : ""}`}
            aria-invalid={over || (error !== null && ["empty_input", "too_long", "url_only"].includes(error.code))}
            className={cx(
              "mt-2 block w-full resize-y rounded-[var(--radius-control)] border bg-surface p-3.5 text-[1rem] leading-relaxed",
              over ? "border-critical" : "border-control",
            )}
            placeholder="Paste the abstract of a research paper here…"
          />
        </div>

        <div>
          <label htmlFor={`${uid}-title`} className="font-semibold">
            Title <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <p id={`${uid}-title-hint`} className="text-[0.9375rem] text-ink-muted">
            Only used as a label. A title doesn&apos;t tell us whether a paper was published or peer reviewed.
          </p>
          <input
            id={`${uid}-title`}
            type="text"
            value={title}
            maxLength={MAX_TITLE_CHARS}
            onChange={(e) => setTitle(e.target.value)}
            aria-describedby={`${uid}-title-hint`}
            className="mt-2 block min-h-12 w-full rounded-[var(--radius-control)] border border-control bg-surface px-3.5"
          />
        </div>

        <fieldset>
          <legend className="font-semibold">Or use a sample</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {decoderSamples.map((s) => (
              <button key={s.id} type="button" className={buttonClass("secondary", "sm")} onClick={() => loadSample(s.id, false)}>
                {s.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-meta text-ink-muted">Samples are fictional teaching abstracts with prewritten explanations.</p>
        </fieldset>

        <div className="space-y-3 border-t border-rule pt-5">
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className={buttonClass("primary")} disabled={!hydrated || status === "submitting"}>
              {status === "submitting" ? (
                <>
                  <LoaderCircle size={18} strokeWidth={1.75} className="motion-safe:animate-spin" aria-hidden /> Reading…
                </>
              ) : (
                "Decode abstract"
              )}
            </button>
            {status === "submitting" && (
              <button type="button" className={buttonClass("secondary")} onClick={cancel}>
                Cancel
              </button>
            )}
          </div>
          <p className="flex min-h-6 items-start gap-1.5 text-[0.9375rem] text-ink-muted">
            <Info size={16} strokeWidth={1.75} className="mt-1 shrink-0" aria-hidden />
            {textIsSample
              ? "This is a sample, so its prewritten explanation is shown. Nothing is sent anywhere."
              : capability === "available"
                ? "When you decode your own text, it is sent to the AI provider configured for this installation. It isn't saved by Paper2People."
                : capability === "unavailable"
                  ? "Analysis of your own abstract isn't enabled in this installation. The samples work without it."
                  : "Checking what this installation supports…"}
          </p>
          <p id={`${uid}-scope`} className="text-meta text-ink-muted">
            Explanations cover only the text you supply, not the full paper or current scientific consensus. Educational use only.
          </p>
        </div>
      </form>

      <div className="mt-10" aria-live="off">
        {status === "submitting" && (
          <div aria-busy="true" className="max-w-3xl">
            <p className="flex items-center gap-2 font-semibold" role="status">
              <LoaderCircle size={18} strokeWidth={1.75} className="motion-safe:animate-spin" aria-hidden /> Reading the supplied text
            </p>
            <div className="mt-4 space-y-3" aria-hidden>
              <div className="skeleton h-7 w-2/3" />
              <div className="skeleton h-5 w-full" />
              <div className="skeleton h-5 w-11/12" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="skeleton h-32" />
                <div className="skeleton h-32" />
              </div>
            </div>
          </div>
        )}

        {status === "error" && error && (
          <div
            id={`${uid}-err`}
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            className={cx(
              "max-w-3xl rounded-[var(--radius-panel)] p-4",
              error.code === "cancelled" ? "border border-rule bg-surface" : "bg-critical-soft text-critical",
            )}
          >
            <p className="flex items-start gap-2 font-semibold">
              <CircleAlert size={18} strokeWidth={1.75} className="mt-0.5 shrink-0" aria-hidden />
              {error.message}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {RETRYABLE.includes(error.code) && capability !== "unavailable" && (
                <button type="button" className={buttonClass("secondary", "sm")} onClick={() => void decode()}>
                  Try again
                </button>
              )}
              <button type="button" className={buttonClass("secondary", "sm")} onClick={() => loadSample(decoderSamples[0].id, true)}>
                Explore a sample
              </button>
            </div>
          </div>
        )}

        {analysis && status !== "submitting" && (
          <div ref={resultRef} tabIndex={-1} aria-label="Decoded abstract" className={cx(status === "error" && "mt-8 opacity-90")}>
            {status === "error" && <p className="mb-3 text-meta text-ink-muted">Your previous explanation is still shown below.</p>}
            {/* A fresh key per result resets highlights and copy state. */}
            <DecoderOutput key={resultKey} analysis={analysis} stale={stale} />
          </div>
        )}

        {!analysis && status === "idle" && (
          <div className="max-w-3xl rounded-[var(--radius-panel)] border border-dashed border-control p-6 text-ink-muted">
            <p className="font-semibold text-ink">Your explanation will appear here.</p>
            <p className="mt-1">
              It starts with a quick summary, then what the evidence supports, what it doesn&apos;t prove, and the details behind
              each point.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
