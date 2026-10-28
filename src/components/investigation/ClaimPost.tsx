import { UserRound } from "lucide-react";
import type { CuratedCase } from "@/lib/schemas/case";
import { ProvenanceTag } from "@/components/evidence/ProvenanceTag";
import { cx } from "@/components/ui/styles";

/** The fictional post: a neutral invented author, a visible label, no engagement counts. */
export function ClaimPost({
  caseData,
  activeFragmentIds = [],
  compact = false,
}: {
  caseData: CuratedCase;
  activeFragmentIds?: string[];
  compact?: boolean;
}) {
  return (
    <article
      aria-label="The claim under investigation"
      className="rounded-[var(--radius-panel)] border border-control/60 bg-surface p-4 shadow-[0_1px_0_var(--border)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-ink-muted" aria-hidden>
            <UserRound size={18} strokeWidth={1.75} />
          </span>
          <span className="text-[0.9375rem] font-semibold">{caseData.postAuthor}</span>
        </div>
        <ProvenanceTag tone={caseData.materialType === "real_source_summary" ? "real" : "fictional"}>
          {caseData.fictionalPostLabel}
        </ProvenanceTag>
      </div>
      <p className={cx("mt-3 font-serif leading-snug", compact ? "text-[1.1875rem]" : "text-[1.3125rem]")}>
        {caseData.claimFragments.map((f, i) => (
          <span key={f.id}>
            <span className={cx(activeFragmentIds.includes(f.id) && "fragment-active")}>{f.text}</span>
            {i < caseData.claimFragments.length - 1 ? " " : ""}
          </span>
        ))}
      </p>
    </article>
  );
}
