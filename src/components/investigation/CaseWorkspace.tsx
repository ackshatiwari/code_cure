"use client";

import { ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useId, useRef, useState } from "react";
import { formatCaseNumber, getCase, topicLabels } from "@/content/cases";
import type { Relation } from "@/lib/schemas/case";
import { isLocked } from "@/lib/investigation";
import { useCaseProgress, type ProgressMode } from "@/lib/progress-store";
import { ProvenanceTag } from "@/components/evidence/ProvenanceTag";
import { relationMeta } from "@/components/evidence/relations";
import { SourceDrawer } from "@/components/evidence/SourceDrawer";
import { StudyDetails } from "@/components/evidence/StudyDetails";
import { announce } from "@/components/ui/Announcer";
import { Sheet } from "@/components/ui/Sheet";
import { buttonClass, cx, linkClass } from "@/components/ui/styles";
import { ClaimPost } from "./ClaimPost";
import { ClueCard } from "./ClueCard";
import { DemoGuide, type DemoStep } from "./DemoGuide";
import { EvidenceBoard } from "./EvidenceBoard";
import { StorageNote } from "./StorageNote";
import { VerdictForm } from "./VerdictForm";

type Task = "claim" | "evidence" | "board" | "verdict";
const tasks: Array<{ id: Task; label: string }> = [
  { id: "claim", label: "Claim" },
  { id: "evidence", label: "Evidence" },
  { id: "board", label: "Board" },
  { id: "verdict", label: "Verdict" },
];

export function CaseWorkspace({ slug, mode = "standard" }: { slug: string; mode?: ProgressMode }) {
  const caseData = getCase(slug)!;
  const router = useRouter();
  const uid = useId();
  const { hydrated, storage, progress, dispatch } = useCaseProgress(caseData, mode);
  const [task, setTask] = useState<Task>("claim");
  const [rawSelectedClueId, setSelectedClueId] = useState<string | null>(null);
  const [studyOpen, setStudyOpen] = useState(false);
  const [riskToggled, setRiskToggled] = useState(false);
  const [studyViewed, setStudyViewed] = useState(false);
  const headingRefs = useRef<Partial<Record<Task, HTMLHeadingElement | null>>>({});
  const locked = isLocked(progress);
  const verdictHref = mode === "demo" ? "/demo/verdict" : `/cases/${caseData.slug}/verdict`;
  const openedCount = progress.openedClueIds.length;
  const clueCount = caseData.clues.length;

  const goTo = useCallback((t: Task) => {
    setTask(t);
    // On phones only the active task is shown; move focus to its heading.
    requestAnimationFrame(() => {
      const h = headingRefs.current[t];
      if (h && h.getClientRects().length > 0) {
        h.focus({ preventScroll: true });
        h.scrollIntoView({ block: "start" });
      }
    });
  }, []);

  // A selection only counts while its clue is open (a demo restart closes every clue).
  const selectedClueId = rawSelectedClueId && progress.openedClueIds.includes(rawSelectedClueId) ? rawSelectedClueId : null;

  const openClue = (clueId: string) => {
    dispatch({ type: "open_clue", clueId });
    const count = progress.openedClueIds.includes(clueId) ? openedCount : openedCount + 1;
    announce(`Clue opened. ${count} of ${clueCount} clues read.`);
  };

  const place = (clueId: string) => {
    setSelectedClueId(clueId);
    goTo("board");
  };

  const assign = (clueId: string, relation: Relation) => {
    dispatch({ type: "assign", clueId, relation });
    const clue = caseData.clues.find((c) => c.id === clueId)!;
    announce(`Placed “${clue.title}” under ${relationMeta[relation].label}.`);
    const nextUnplaced = caseData.clues.find(
      (c) => c.id !== clueId && progress.openedClueIds.includes(c.id) && progress.relations[c.id] === undefined,
    );
    setSelectedClueId(nextUnplaced?.id ?? null);
  };

  const unassign = (clueId: string) => {
    dispatch({ type: "unassign", clueId });
    const clue = caseData.clues.find((c) => c.id === clueId)!;
    announce(`Removed “${clue.title}” from the board.`);
  };

  const submit = () => {
    dispatch({ type: "submit", submittedAt: new Date().toISOString() });
    router.push(verdictHref);
  };

  const activeFragments = selectedClueId ? (caseData.clues.find((c) => c.id === selectedClueId)?.claimFragmentIds ?? []) : [];
  const numbersClue = caseData.clues.find((c) => c.kind === "numbers_outcome");
  const demoSteps: DemoStep[] =
    mode === "demo"
      ? [
          { id: "claim", label: "Read the claim", hint: "Read the post: it says “25% lower” means 25 fewer per 100.", done: openedCount > 0 },
          {
            id: "counts",
            label: "Reveal the counts",
            hint: "Open the Numbers clue to see 20 versus 15 per 1,000.",
            done: !!numbersClue && progress.openedClueIds.includes(numbersClue.id),
          },
          {
            id: "toggle",
            label: "Compare relative and absolute",
            hint: "Switch the risk display between Relative change and Absolute change.",
            done: riskToggled || locked,
          },
          {
            id: "board",
            label: "Connect clues and check limits",
            hint: "Read the other clues, place all three on the board, and open the study details.",
            done: (Object.keys(progress.relations).length === clueCount && studyViewed) || locked,
          },
          { id: "verdict", label: "Choose and submit", hint: "Choose a verdict, reasoning and headline, then submit.", done: locked },
        ]
      : [];

  return (
    <div className="container-page py-8 md:py-10">
      <header className="max-w-3xl">
        <p className="case-id">
          {formatCaseNumber(caseData.number)} / {caseData.title.toUpperCase()}
        </p>
        <h1 className="mt-2 text-[1.75rem] sm:text-[2rem] lg:text-[2.375rem]">{caseData.title}</h1>
        <p className="reading mt-3 text-ink-muted">
          <span className="font-semibold text-ink">Goal: </span>
          {caseData.learningObjective}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-meta text-ink-muted">
          <ProvenanceTag tone={caseData.materialType === "real_source_summary" ? "real" : "fictional"}>{caseData.provenanceLabel}</ProvenanceTag>
          <span>
            {topicLabels[caseData.topic]} · {caseData.skill} · about {caseData.estimatedMinutes} min
          </span>
        </div>
        <StorageNote hydrated={hydrated} storage={storage} className="mt-3" />
      </header>

      {mode === "demo" && (
        <div className="mt-6">
          <DemoGuide
            steps={demoSteps}
            onRestart={() => {
              dispatch({ type: "reset" });
              setRiskToggled(false);
              setStudyViewed(false);
              setSelectedClueId(null);
              goTo("claim");
              announce("Demo restarted.");
            }}
          />
        </div>
      )}

      {locked && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-panel)] border border-primary/40 bg-primary-soft p-4">
          <p className="font-semibold">This attempt is submitted and frozen.</p>
          <Link href={verdictHref} className={buttonClass("primary", "sm")}>
            See your results <ArrowRight size={16} strokeWidth={1.75} aria-hidden />
          </Link>
        </div>
      )}

      <nav aria-label="Investigation steps" className="mt-6 md:hidden">
        <ol className="grid grid-cols-4 gap-1 rounded-[var(--radius-control)] border border-control bg-surface p-1">
          {tasks.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => goTo(t.id)}
                aria-current={task === t.id ? "step" : undefined}
                className={cx(
                  "flex min-h-11 w-full flex-col items-center justify-center rounded-[6px] px-1 text-[0.9375rem] font-semibold",
                  task === t.id ? "bg-primary text-surface" : "text-ink hover:bg-primary-soft",
                )}
              >
                {t.label}
                {t.id === "evidence" && <span className="text-[0.75rem] font-normal tabular">{openedCount}/{clueCount}</span>}
                {t.id === "board" && (
                  <span className="text-[0.75rem] font-normal tabular">
                    {Object.keys(progress.relations).length}/{clueCount}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(280px,320px)] xl:grid-cols-[272px_minmax(0,1fr)_304px] xl:gap-8">
        {/* Claim dossier */}
        <section
          aria-labelledby={`${uid}-claim`}
          className={cx("min-w-0 md:col-start-1 xl:col-start-1 xl:row-span-2 xl:row-start-1", task !== "claim" && "max-md:hidden")}
        >
          <div className="space-y-4 xl:sticky xl:top-4">
            <h2 id={`${uid}-claim`} ref={(el) => void (headingRefs.current.claim = el)} tabIndex={-1} className="text-[1.375rem]">
              The claim
            </h2>
            <ClaimPost caseData={caseData} activeFragmentIds={activeFragments} compact />
            <p className="text-[0.9375rem] text-ink-muted">
              Keep this exact wording in mind. Each clue is judged against what the post actually says.
            </p>
            <div className="space-y-1 border-t border-rule pt-3">
              <button
                type="button"
                className={buttonClass("secondary", "sm", "w-full justify-start")}
                aria-haspopup="dialog"
                onClick={() => {
                  setStudyOpen(true);
                  setStudyViewed(true);
                }}
              >
                <FileText size={16} strokeWidth={1.75} aria-hidden />
                {caseData.studyView.kind === "study" ? "Study details and reported limits" : "About these public sources"}
              </button>
              <SourceDrawer sourceIds={caseData.sourceIds} label="All case sources" title="Sources for this case" />
            </div>
            <button type="button" className={buttonClass("primary", "md", "w-full md:hidden")} onClick={() => goTo("evidence")}>
              Next: read the evidence <ArrowRight size={18} strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        </section>

        {/* Evidence reading area */}
        <section
          aria-labelledby={`${uid}-evidence`}
          className={cx("min-w-0 md:col-start-1 xl:col-start-2 xl:row-start-1", task !== "evidence" && "max-md:hidden")}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id={`${uid}-evidence`} ref={(el) => void (headingRefs.current.evidence = el)} tabIndex={-1} className="text-[1.375rem]">
              Evidence
            </h2>
            <p className="text-meta font-semibold tabular">
              {openedCount} of {clueCount} clues opened
            </p>
          </div>
          <p className="mt-1 text-ink-muted">Read each clue, then decide how it changes the claim.</p>
          <ol className="mt-4 space-y-4">
            {caseData.clues.map((clue, i) => (
              <ClueCard
                key={clue.id}
                caseData={caseData}
                clue={clue}
                index={i}
                opened={progress.openedClueIds.includes(clue.id)}
                relation={progress.relations[clue.id]}
                locked={locked}
                highlighted={selectedClueId === clue.id}
                onOpen={() => openClue(clue.id)}
                onPlace={() => place(clue.id)}
                onRiskViewChange={() => setRiskToggled(true)}
              />
            ))}
          </ol>
          <button type="button" className={buttonClass("primary", "md", "mt-5 w-full md:hidden")} onClick={() => goTo("board")}>
            Next: the evidence board <ArrowRight size={18} strokeWidth={1.75} aria-hidden />
          </button>
        </section>

        {/* Evidence board */}
        <section
          aria-labelledby={`${uid}-board`}
          className={cx("min-w-0 md:col-start-2 md:row-span-2 md:row-start-1 xl:col-start-3 xl:row-span-1 xl:row-start-1", task !== "board" && "max-md:hidden")}
        >
          <h2 id={`${uid}-board`} ref={(el) => void (headingRefs.current.board = el)} tabIndex={-1} className="mb-3 text-[1.375rem]">
            Evidence board
          </h2>
          <EvidenceBoard
            caseData={caseData}
            progress={progress}
            selectedClueId={selectedClueId}
            onSelect={setSelectedClueId}
            onAssign={assign}
            onUnassign={unassign}
            locked={locked}
          />
          <button type="button" className={buttonClass("primary", "md", "mt-5 w-full md:hidden")} onClick={() => goTo("verdict")}>
            Next: your verdict <ArrowRight size={18} strokeWidth={1.75} aria-hidden />
          </button>
        </section>

        {/* Verdict */}
        <section
          aria-labelledby={`${uid}-verdict`}
          className={cx(
            "min-w-0 border-t border-rule pt-6 md:col-span-2 md:col-start-1 xl:col-span-2 xl:col-start-2 xl:row-start-2",
            task !== "verdict" && "max-md:hidden",
          )}
        >
          <h2 id={`${uid}-verdict`} ref={(el) => void (headingRefs.current.verdict = el)} tabIndex={-1} className="text-[1.375rem] md:text-[1.75rem]">
            Your verdict
          </h2>
          <p className="reading mt-1 text-ink-muted">
            Choose the verdict, the main reasoning and the headline that best fit this exact claim. Scoring is explained with your
            results; opening definitions or sources never costs points.
          </p>
          <div className="mt-5 max-w-3xl">
            <VerdictForm
              caseData={caseData}
              progress={progress}
              locked={locked}
              onSelect={(field, optionId) => dispatch({ type: "select", field, optionId })}
              onSubmit={submit}
            />
          </div>
          {locked && (
            <p className="mt-4">
              <Link href={verdictHref} className={linkClass}>
                See your results and explanations
              </Link>
            </p>
          )}
        </section>
      </div>

      <Sheet
        open={studyOpen}
        onOpenChange={setStudyOpen}
        title={caseData.studyView.heading}
        description={caseData.studyView.kind === "study" ? caseData.provenanceLabel : "Real public-health sources, summarized"}
      >
        <div className="space-y-5">
          {caseData.studyView.kind === "study" && (
            <div>
              <ProvenanceTag>{caseData.provenanceLabel}</ProvenanceTag>
              <p className="mt-3 rounded-[var(--radius-control)] bg-surface-muted p-4 font-serif text-[1.0625rem] leading-relaxed">
                {caseData.studyView.text}
              </p>
            </div>
          )}
          <StudyDetails view={caseData.studyView} />
          {caseData.decoderSampleId && (
            <p className="text-[0.9375rem]">
              <Link href={`/decode?sample=${caseData.decoderSampleId}`} className={linkClass}>
                Read this text in the decoder
              </Link>
            </p>
          )}
        </div>
      </Sheet>
    </div>
  );
}
