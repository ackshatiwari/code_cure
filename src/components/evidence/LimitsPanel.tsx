import { CircleCheck, TriangleAlert } from "lucide-react";
import { cx } from "@/components/ui/styles";

export interface LimitItem {
  text: string;
  justification?: string | null;
  /** Optional trailing content, such as source-sentence anchors in the decoder. */
  extra?: React.ReactNode;
}

/**
 * The signature pairing: what the evidence does support, beside what it doesn't
 * prove. Used by case results and decoded abstracts alike.
 */
export function LimitsPanel({
  supported,
  notEstablished,
  supportedHeading = "What the evidence does support",
  limitsHeading = "What this study doesn't prove",
  headingLevel = 2,
  className,
  idPrefix = "limits",
}: {
  supported: LimitItem[];
  notEstablished: LimitItem[];
  supportedHeading?: string;
  limitsHeading?: string;
  headingLevel?: 2 | 3;
  className?: string;
  idPrefix?: string;
}) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className={cx("grid gap-4 lg:grid-cols-2", className)}>
      <section aria-labelledby={`${idPrefix}-supports`} className="rounded-[var(--radius-panel)] border border-primary/30 bg-primary-soft/60 p-5">
        <H id={`${idPrefix}-supports`} className="flex items-center gap-2 text-[1.375rem]">
          <CircleCheck size={22} strokeWidth={1.75} className="shrink-0 text-primary" aria-hidden />
          {supportedHeading}
        </H>
        <ItemList items={supported} />
      </section>
      <section aria-labelledby={`${idPrefix}-limits`} className="annotation-caution p-5">
        <H id={`${idPrefix}-limits`} className="flex items-center gap-2 text-[1.375rem]">
          <TriangleAlert size={22} strokeWidth={1.75} className="shrink-0 text-caution" aria-hidden />
          {limitsHeading}
        </H>
        <ItemList items={notEstablished} />
      </section>
    </div>
  );
}

function ItemList({ items }: { items: LimitItem[] }) {
  if (items.length === 0) return <p className="mt-3 text-ink-muted">Nothing listed for this text.</p>;
  return (
    <ul className="mt-3 space-y-3">
      {items.map((item, i) => (
        <li key={i}>
          <p className="font-semibold leading-snug">{item.text}</p>
          {item.justification && <p className="mt-0.5 text-[0.9375rem] text-ink-muted">{item.justification}</p>}
          {item.extra}
        </li>
      ))}
    </ul>
  );
}
