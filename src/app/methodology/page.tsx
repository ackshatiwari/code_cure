import type { Metadata } from "next";
import Link from "next/link";
import { cases, formatCaseNumber } from "@/content/cases";
import { sources } from "@/content/sources";
import { SourceList } from "@/components/evidence/SourceList";
import { IssueReport } from "@/components/layout/IssueReport";
import { ProgressControls } from "@/components/layout/ProgressControls";
import { linkClass } from "@/components/ui/styles";

export const metadata: Metadata = {
  title: "How it works",
  description: "Source policy, fictional examples, scoring, privacy, AI limits and review status for Paper2People.",
};

const sections = [
  ["fictional", "What's fictional, and what's real"],
  ["sources", "How sources are used"],
  ["scoring", "How answers and scores work"],
  ["decoder", "The decoder and AI limits"],
  ["privacy", "What stays on your device"],
  ["review", "Review status"],
  ["report", "Report a content issue"],
] as const;

export default function MethodologyPage() {
  return (
    <div className="container-page py-10">
      <header className="max-w-3xl">
        <p className="eyebrow">How it works</p>
        <h1 className="mt-2 text-[2rem] lg:text-[2.5rem]">Methods, sources and limits</h1>
        <p className="reading mt-3 text-ink-muted">
          Paper2People is for research education. It helps you judge whether a conclusion matches its evidence. It does not give
          individual medical guidance, and nothing here can tell you about your own risk, screening or treatment.
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="On this page" className="lg:sticky lg:top-4 lg:self-start">
          <ul className="space-y-1.5 text-[0.9375rem]">
            {sections.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className={linkClass}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="reading min-w-0 space-y-12">
          <section id="fictional" aria-labelledby="fictional-h" className="scroll-mt-6 space-y-3">
            <h2 id="fictional-h" className="text-[1.75rem]">
              What&apos;s fictional, and what&apos;s real
            </h2>
            <p>Every post in every case is fictional, written by an invented author. No real patient, organization or influencer is depicted.</p>
            <ul className="space-y-2">
              {cases.map((c) => (
                <li key={c.id}>
                  <span className="case-id mr-2">{formatCaseNumber(c.number)}</span>
                  <Link href={`/cases/${c.slug}`} className={linkClass}>
                    {c.title}
                  </Link>
                  : {c.provenanceLabel}.
                </li>
              ))}
            </ul>
            <p>
              The abstracts, counts and diagrams in Cases 01–04 were written for teaching. No journal, researcher, university, DOI,
              trial registration or publication date exists for them, and their numbers say nothing about any real intervention,
              beverage, compound or screening test. Case 05 summarizes real statements from the National Cancer Institute.
            </p>
          </section>

          <section id="sources" aria-labelledby="sources-h" className="scroll-mt-6 space-y-3">
            <h2 id="sources-h" className="text-[1.75rem]">
              How sources are used
            </h2>
            <p>
              Background citations explain the methods concept behind a case. They are not the source of the fictional numbers, and
              each one says so. Each external source was opened and checked against the statement it supports; the check date is
              shown. A checked reference is not the same as an expert review of a whole case.
            </p>
            <p>Paper2People is not affiliated with or endorsed by NCI, NIH, NCCIH or Cancer Research UK, and uses no logos.</p>
            <details className="rounded-[var(--radius-panel)] border border-rule bg-surface p-4">
              <summary className="cursor-pointer font-semibold">All {sources.length} sources</summary>
              <div className="mt-4">
                <SourceList sourceIds={sources.map((s) => s.id)} />
              </div>
            </details>
          </section>

          <section id="scoring" aria-labelledby="scoring-h" className="scroll-mt-6 space-y-3">
            <h2 id="scoring-h" className="text-[1.75rem]">
              How answers and scores work
            </h2>
            <p>
              Each case has a fixed answer key written in advance. There is no AI grading and no free-text marking. Scores add up to
              100:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Verdict: 40 points.</li>
              <li>Main reasoning: 30 points.</li>
              <li>Evidence board: 20 × accepted placements ÷ 3, rounded once (0, 7, 13 or 20).</li>
              <li>Rewritten headline: 10 points.</li>
            </ul>
            <p>
              Some clues accept more than one relation, and every accepted alternative gets full credit. Opening definitions or
              sources never costs points, and there is no speed bonus. Your first submitted score is kept; practicing again records
              a separate latest score and never counts the case twice.
            </p>
            <p>
              A score reflects this exercise only. It is not a measure of medical knowledge or intelligence, and it says nothing
              about how certain cancer research is.
            </p>
          </section>

          <section id="decoder" aria-labelledby="decoder-h" className="scroll-mt-6 space-y-3">
            <h2 id="decoder-h" className="text-[1.75rem]">
              The decoder and AI limits
            </h2>
            <p>
              The decoder explains only the text you paste, not the full paper or the current state of research. Samples are
              prewritten teaching examples and need no AI. When an installation enables live analysis, your own text is sent to the
              configured AI provider and the result is labelled “AI-generated explanation — check against the original text.”
            </p>
            <p>
              Before you see an AI explanation, the app checks its structure, removes any links or references the model wrote, and
              checks that every cited sentence number exists in your text. The source panel always shows your own text, never a
              model-written quotation. A matching sentence number shows where a point came from; it does not prove the
              interpretation is correct.
            </p>
            <p>
              Arithmetic such as percentage points is calculated by the app from counts that appear in the cited sentences. Hazard
              ratios and odds ratios are never converted into absolute risks.
            </p>
          </section>

          <section id="privacy" aria-labelledby="privacy-h" className="scroll-mt-6 space-y-3">
            <h2 id="privacy-h" className="text-[1.75rem]">
              What stays on your device
            </h2>
            <p>
              Case progress (which clues you opened, your answers and scores) is saved in this browser&apos;s local storage. There are
              no accounts. Pasted abstracts and their explanations are kept only on the open page: they are not saved, not put in
              the address bar, and not logged by the app. If live analysis is on, the text does go to the AI provider to be analyzed.
            </p>
            <div className="rounded-[var(--radius-panel)] border border-rule bg-surface p-5">
              <h3 className="text-[1.25rem]">Your saved progress</h3>
              <div className="mt-3">
                <ProgressControls />
              </div>
            </div>
          </section>

          <section id="review" aria-labelledby="review-h" className="scroll-mt-6 space-y-3">
            <h2 id="review-h" className="text-[1.75rem]">
              Review status
            </h2>
            <p className="font-semibold">Educational prototype; expert content review pending.</p>
            <p>
              The sources have been checked against the statements they support, but no clinician, epidemiologist or other expert
              has yet reviewed the cases as a whole. Treat the content as a learning tool, not as authoritative guidance.
            </p>
          </section>

          <section id="report" aria-labelledby="report-h" className="scroll-mt-6 space-y-3">
            <h2 id="report-h" className="text-[1.75rem]">
              Report a content issue
            </h2>
            <p>
              This installation doesn&apos;t have a feedback inbox. Describe the issue below and copy the details to share with
              whoever maintains it.
            </p>
            <IssueReport />
          </section>
        </div>
      </div>
    </div>
  );
}
