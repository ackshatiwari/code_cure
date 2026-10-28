import { describe, expect, it } from "vitest";
import { cases } from "@/content/cases";
import { getGlossaryEntry, glossary, searchGlossary } from "@/content/glossary";
import { buildSampleAnalysis, decoderSamples, findSampleForText, getDecoderSample } from "@/content/samples";
import { getSource, sources } from "@/content/sources";
import { curatedCaseSchema } from "@/lib/schemas/case";

describe("case fixtures", () => {
  it("has five valid cases with unique slugs and exactly three clues each", () => {
    expect(cases).toHaveLength(5);
    expect(new Set(cases.map((c) => c.slug)).size).toBe(5);
    for (const c of cases) {
      expect(curatedCaseSchema.safeParse(c).success).toBe(true);
      expect(c.clues).toHaveLength(3);
    }
  });

  it("has no dangling source, glossary, related-case or decoder-sample IDs", () => {
    const slugs = new Set(cases.map((c) => c.slug));
    for (const c of cases) {
      const sourceIds = [
        ...c.sourceIds,
        ...c.clues.flatMap((cl) => cl.sourceIds),
        ...(c.studyView.kind === "source_summary" ? c.studyView.statements.map((s) => s.sourceId) : []),
      ];
      for (const id of sourceIds) expect(getSource(id), `${c.slug} source ${id}`).toBeDefined();
      for (const id of [...c.glossaryTermIds, ...c.clues.flatMap((cl) => cl.glossaryTermIds)]) {
        expect(getGlossaryEntry(id), `${c.slug} term ${id}`).toBeDefined();
      }
      if (c.relatedCaseSlug) expect(slugs.has(c.relatedCaseSlug)).toBe(true);
      if (c.decoderSampleId) expect(getDecoderSample(c.decoderSampleId)).toBeDefined();
    }
  });

  it("labels provenance as the content policy requires", () => {
    const labels = Object.fromEntries(cases.map((c) => [c.number, c.provenanceLabel]));
    expect(labels[1]).toBe("Fictional teaching example — not a real study");
    expect(labels[2]).toBe("Fictional teaching example — not a real study");
    expect(labels[3]).toBe("Fictional teaching example — not a real study");
    expect(labels[4]).toBe("Hypothetical illustration of a real research-methods concept");
    expect(labels[5]).toBe("Fictional post summarizing real public-health evidence");
    for (const c of cases.slice(0, 3)) expect(c.studyView.kind === "study" && c.studyView.text).toMatch(/fictional/i);
  });

  it("keeps verdict distribution honest rather than forced", () => {
    expect(cases.map((c) => c.answerKey.verdictId)).toEqual(["misleading", "misleading", "unsupported", "misleading", "supported"]);
  });

  it("represents missing data as missing, never as zero", () => {
    for (const c of cases) {
      for (const f of c.studyView.fields) {
        if (f.value.status === "reported") expect(f.value.value).not.toMatch(/^(0|none|no harms)$/i);
      }
    }
    const c1 = cases[0];
    const harms = c1.studyView.fields.find((f) => f.label.startsWith("Adverse"))!;
    expect(harms.value.status).toBe("not_reported");
  });
});

describe("sources", () => {
  it("uses real URLs for everything except the app's own fictional material", () => {
    for (const s of sources) {
      if (s.role === "fictional_teaching_material") expect(s.url).toBeNull();
      else {
        expect(s.url).toMatch(/^https:\/\/(www\.)?(cancer\.gov|dceg\.cancer\.gov|nccih\.nih\.gov|news\.cancerresearchuk\.org)\//);
        expect(s.checkedAt).not.toBeNull();
      }
    }
  });

  it("marks background sources that don't contain the fictional datasets", () => {
    expect(getSource("cruk-absolute-relative-risk")!.scopeLimitations.join(" ")).toMatch(/Does not contain the fictional/);
  });
});

describe("glossary", () => {
  const required = [
    "abstract", "absolute-risk", "relative-risk", "percentage-point", "association", "causation", "confounder",
    "observational-study", "randomized-controlled-trial", "sample-size", "confidence-interval",
    "statistical-significance", "preclinical-research", "cell-culture", "screening", "mortality", "survival",
    "lead-time-bias", "overdiagnosis", "surrogate-outcome", "peer-review", "preprint", "systematic-review",
  ];

  it("seeds every required term with a definition, example and why-it-matters", () => {
    for (const id of required) {
      const e = getGlossaryEntry(id);
      expect(e, id).toBeDefined();
      expect(e!.definition.length).toBeGreaterThan(20);
      expect(e!.example.length).toBeGreaterThan(10);
      expect(e!.whyItMatters.length).toBeGreaterThan(10);
    }
    for (const e of glossary) for (const r of e.related) expect(getGlossaryEntry(r), `${e.id} → ${r}`).toBeDefined();
  });

  it("avoids the common misdefinitions", () => {
    const sig = getGlossaryEntry("statistical-significance")!;
    expect(sig.definition).not.toMatch(/proves?|not due to chance/i);
    expect(sig.whyItMatters).toMatch(/not the probability that a hypothesis is true/);
    expect(getGlossaryEntry("peer-review")!.whyItMatters).toMatch(/does not guarantee/);
  });

  it("searches case-insensitively with synonyms", () => {
    expect(searchGlossary("RCT")[0].id).toBe("randomized-controlled-trial");
    expect(searchGlossary("p-value")[0].id).toBe("statistical-significance");
    expect(searchGlossary("CORRELATION")[0].id).toBe("association");
    expect(searchGlossary("five-year survival")[0].id).toBe("survival");
    expect(searchGlossary("zzzz")).toEqual([]);
  });
});

describe("decoder samples", () => {
  it("validate against the schema with anchors that exist in the input", () => {
    for (const s of decoderSamples) {
      const a = buildSampleAnalysis(s);
      expect(a.origin).toBe("prewritten_sample");
      expect(a.coverage).toBe("pasted_abstract");
      expect(a.provenanceNote).toMatch(/Fictional teaching example/);
      expect(a.canThisAnswer.map((x) => x.id).sort()).toEqual(
        ["applies_to_everyone", "association", "causal", "human_outcomes", "longer_life"],
      );
    }
  });

  it("calculates Case 01 values in application code from grounded counts", () => {
    const a = buildSampleAnalysis(getDecoderSample("fictional-rct-relative-risk")!);
    expect(a.calculations).toHaveLength(1);
    expect(a.calculations[0]).toMatchObject({
      baselineRiskPercent: 2,
      comparisonRiskPercent: 1.5,
      percentagePoints: 0.5,
      perThousand: 5,
      relativeReductionPercent: 25,
    });
  });

  it("only matches a sample for its exact text", () => {
    const s = decoderSamples[0];
    expect(findSampleForText(s.text)?.id).toBe(s.id);
    expect(findSampleForText(`  ${s.text.replace(/ /g, " ")}\r\n`)?.id).toBe(s.id);
    expect(findSampleForText(s.text.replace("2,000", "3,000"))).toBeUndefined();
    expect(findSampleForText("An unrelated abstract about something else.")).toBeUndefined();
  });
});
