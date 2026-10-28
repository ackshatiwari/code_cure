import { ArrowRight, CircleDashed, CircleMinus, CirclePlus, Library, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { DEMO_CASE_SLUG, formatCaseNumber, getCase } from "@/content/cases";
import { getDecoderSample } from "@/content/samples";
import { ProvenanceTag } from "@/components/evidence/ProvenanceTag";
import { CaseList } from "@/components/investigation/CaseList";
import { ClaimPost } from "@/components/investigation/ClaimPost";
import { buttonClass, cx, linkClass } from "@/components/ui/styles";

export default function HomePage() {
  const featured = getCase(DEMO_CASE_SLUG)!;
  const sample = getDecoderSample("fictional-rct-relative-risk")!;
  const countsClue = featured.clues.find((c) => c.kind === "numbers_outcome")!;

  return (
    <>
      <section className="container-page grid gap-10 pb-14 pt-10 md:pt-14 lg:grid-cols-12 lg:gap-12 lg:pt-20">
        <div className="lg:col-span-5 lg:pt-4">
          <p className="eyebrow">Cancer claims, in context.</p>
          <h1 className="mt-3 text-[2.125rem] leading-[1.08] sm:text-[2.625rem] lg:text-[3.5rem]">A headline is only the beginning.</h1>
          <p className="reading mt-5 text-[1.1875rem] text-ink-muted">
            Investigate cancer claims, understand the research behind them, and see where the evidence stops.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/demo" className={buttonClass("primary")}>
              Try a 60-second case <ArrowRight size={18} strokeWidth={1.75} aria-hidden />
            </Link>
            <Link href="/decode" className={buttonClass("secondary")}>
              Decode an abstract
            </Link>
          </div>
          <p className="mt-5 text-meta text-ink-muted">No account needed. Progress stays on this device.</p>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-[var(--radius-panel)] border border-rule bg-surface-muted/60 p-4 sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="case-id">
                {formatCaseNumber(featured.number)} / {featured.title.toUpperCase()}
              </p>
              <span className="text-meta text-ink-muted">Preview of the real case</span>
            </div>
            <div className="mt-3">
              <ClaimPost caseData={featured} activeFragmentIds={["absolute-reading"]} />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-stretch">
              <div className="bracket rounded-[var(--radius-panel)] border border-rule bg-surface p-4 text-ink">
                <p className="text-meta font-semibold text-ink-muted">Clue 2 · Numbers and outcome</p>
                <p className="mt-1 font-semibold">{countsClue.title}</p>
                <p className="mt-1 font-serif text-[1.125rem] italic">20 of 1,000 versus 15 of 1,000, over five years.</p>
              </div>
              <div className="flex flex-col justify-center gap-1.5 rounded-[var(--radius-panel)] border border-dashed border-control bg-surface p-4 text-[0.9375rem]">
                <p className="font-semibold">How does it relate?</p>
                <span className="inline-flex items-center gap-1.5 text-primary">
                  <CirclePlus size={16} strokeWidth={1.75} aria-hidden /> Supports part
                </span>
                <span className="inline-flex items-center gap-1.5 text-critical">
                  <CircleMinus size={16} strokeWidth={1.75} aria-hidden /> Challenges
                </span>
                <span className="inline-flex items-center gap-1.5 text-caution">
                  <CircleDashed size={16} strokeWidth={1.75} aria-hidden /> Leaves a question open
                </span>
              </div>
            </div>
            <Link href={`/cases/${featured.slug}`} className={cx(linkClass, "mt-4 inline-flex items-center gap-1.5 font-semibold")}>
              Open this investigation <ArrowRight size={16} strokeWidth={1.75} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="how-heading" className="border-y border-rule bg-surface">
        <div className="container-page py-12">
          <h2 id="how-heading" className="text-[1.75rem]">
            How an investigation works
          </h2>
          <ol className="mt-6 grid gap-8 md:grid-cols-3">
            {[
              ["Read the claim", "Start with a short fictional post. Note its exact wording; that's what you're testing."],
              ["Inspect the evidence", "Open three clues: the study details, the numbers, and what's missing. Place each on the board."],
              ["Explain your verdict", "Pick a verdict, the main reasoning and a better headline. Then see what the evidence supports, and where it stops."],
            ].map(([title, body], i) => (
              <li key={title} className="border-t-2 border-ink pt-4">
                <span className="case-id">STEP {i + 1}</span>
                <h3 className="mt-1 text-[1.3125rem]">{title}</h3>
                <p className="mt-2 text-ink-muted">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="decoder-heading" className="container-page grid gap-10 py-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow">The decoder</p>
          <h2 id="decoder-heading" className="mt-2 text-[1.75rem]">
            Paste an abstract. See what it found, and what it doesn&apos;t prove.
          </h2>
          <p className="reading mt-3 text-ink-muted">
            The decoder explains the question, who or what was studied, the design, the findings and their limits, with every
            point linked back to the sentence it came from. Samples work with no setup.
          </p>
          <Link href={`/decode?sample=${sample.id}`} className={buttonClass("secondary", "md", "mt-5")}>
            Open this sample in the decoder
          </Link>
        </div>
        <div className="lg:col-span-7">
          <div className="rounded-[var(--radius-panel)] border border-rule bg-surface p-5">
            <div className="flex flex-wrap gap-2">
              <ProvenanceTag>Prewritten teaching example</ProvenanceTag>
              <ProvenanceTag>{sample.provenanceNote}</ProvenanceTag>
            </div>
            <p className="mt-3 text-meta font-semibold text-ink-muted">What researchers asked</p>
            <p className="font-serif text-[1.1875rem] leading-snug">{sample.analysis.plainLanguageQuestion}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[var(--radius-control)] bg-primary-soft/70 p-3.5">
                <p className="text-meta font-semibold text-primary">What the evidence does support</p>
                <p className="mt-1 text-[0.9375rem]">{sample.analysis.supportedConclusions[0].text}</p>
              </div>
              <div className="annotation-caution p-3.5">
                <p className="flex items-center gap-1.5 text-meta font-semibold text-caution">
                  <TriangleAlert size={14} strokeWidth={1.75} aria-hidden /> What this study doesn&apos;t prove
                </p>
                <p className="mt-1 text-[0.9375rem]">{sample.analysis.doesNotEstablish[0].text}</p>
              </div>
            </div>
            <p className="mt-3 text-meta text-ink-muted">Based on the pasted abstract · anchored to sentences S2 and S4</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="cases-heading" className="container-page py-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="cases-heading" className="text-[1.75rem]">
            Investigations
          </h2>
          <Link href="/cases" className={linkClass}>
            Browse by topic
          </Link>
        </div>
        <div className="mt-4">
          <CaseList />
        </div>
      </section>

      <section aria-labelledby="trust-heading" className="container-page py-14">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 id="trust-heading" className="flex items-center gap-2 text-[1.5rem]">
              <Library size={22} strokeWidth={1.75} className="text-primary" aria-hidden />
              Traceable sources
            </h2>
            <p className="reading mt-3 text-ink-muted">
              Every case says plainly what is fictional, hypothetical or real. Background sources from NCI, NCCIH and Cancer
              Research UK explain the methods, and each one says what it does and doesn&apos;t contain. Paper2People isn&apos;t
              affiliated with any of them.
            </p>
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-[1.5rem]">
              <TriangleAlert size={22} strokeWidth={1.75} className="text-caution" aria-hidden />
              Limits beside findings
            </h2>
            <p className="reading mt-3 text-ink-muted">
              “What this study doesn&apos;t prove” always sits next to “What the evidence does support.” The goal is proportionate
              trust: some claims hold up, and recognising that is a good result too.{" "}
              <Link href="/methodology" className={linkClass}>
                How it works
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
