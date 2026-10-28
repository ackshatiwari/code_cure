import { CircleDashed, CircleMinus, CirclePlus, type LucideIcon } from "lucide-react";
import type { Relation } from "@/lib/schemas/case";
import { cx } from "@/components/ui/styles";

export const relationOrder: Relation[] = ["supports", "challenges", "open_question"];

export const relationMeta: Record<Relation, { label: string; short: string; Icon: LucideIcon; tone: string; soft: string }> = {
  supports: {
    label: "Supports part of the claim",
    short: "Supports",
    Icon: CirclePlus,
    tone: "text-primary",
    soft: "bg-primary-soft border-primary",
  },
  challenges: {
    label: "Challenges the claim",
    short: "Challenges",
    Icon: CircleMinus,
    tone: "text-critical",
    soft: "bg-critical-soft border-critical",
  },
  open_question: {
    label: "Leaves a question open",
    short: "Open question",
    Icon: CircleDashed,
    tone: "text-caution",
    soft: "bg-caution-soft border-caution",
  },
};

/** A relation is always shown with text and an icon, never colour alone. */
export function RelationLabel({ relation, short = false, className }: { relation: Relation; short?: boolean; className?: string }) {
  const m = relationMeta[relation];
  return (
    <span className={cx("inline-flex items-center gap-1.5 font-semibold", m.tone, className)}>
      <m.Icon size={18} strokeWidth={1.75} aria-hidden />
      <span>{short ? m.short : m.label}</span>
    </span>
  );
}
