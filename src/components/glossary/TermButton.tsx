"use client";

import { BookOpen, X } from "lucide-react";
import Link from "next/link";
import { Popover } from "radix-ui";
import { useLayoutEffect, useState } from "react";
import { getGlossaryEntry } from "@/content/glossary";
import { cx, linkClass } from "@/components/ui/styles";

/**
 * Inline definition, opened by click, tap, Enter or Space. Escape closes it and
 * focus returns to the term. Definitions are optional help, never a gate.
 */
export function TermButton({ termId, children, className }: { termId: string; children?: React.ReactNode; className?: string }) {
  const entry = getGlossaryEntry(termId);
  const [open, setOpen] = useState(false);
  useLayoutEffect(() => () => setOpen(false), []);
  if (!entry) return <>{children}</>;
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        className={cx(
          "inline cursor-help rounded-sm text-left underline decoration-dotted decoration-[1.5px] underline-offset-[3px] hover:decoration-solid hover:text-primary",
          className,
        )}
        aria-label={`${typeof children === "string" ? children : entry.term}: show definition`}
      >
        {children ?? entry.term}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={6}
          collisionPadding={12}
          className="z-50 w-[min(22rem,calc(100vw-24px))] rounded-[var(--radius-panel)] border border-rule bg-surface p-4 text-[0.9375rem] leading-relaxed shadow-[var(--shadow-overlay)]"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="font-serif text-lg font-semibold">{entry.term}</p>
            <Popover.Close
              className="-mr-1 -mt-1 inline-flex min-h-9 min-w-9 items-center justify-center rounded-[var(--radius-control)] hover:bg-primary-soft"
              aria-label="Close definition"
            >
              <X size={16} strokeWidth={1.75} aria-hidden />
            </Popover.Close>
          </div>
          <p className="mt-1">{entry.definition}</p>
          <p className="mt-2 text-ink-muted">
            <span className="font-semibold text-ink">Why this matters: </span>
            {entry.whyItMatters}
          </p>
          <Link href={`/glossary#${entry.id}`} className={cx(linkClass, "mt-3 inline-flex items-center gap-1.5 text-meta")}>
            <BookOpen size={14} strokeWidth={1.75} aria-hidden /> Example and related terms
          </Link>
          <Popover.Arrow className="fill-surface" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** A compact row of term buttons for a clue or section. */
export function TermList({ termIds, label = "Terms" }: { termIds: string[]; label?: string }) {
  const entries = termIds.map((id) => getGlossaryEntry(id)).filter((e) => e !== undefined);
  if (entries.length === 0) return null;
  return (
    <p className="text-meta text-ink-muted">
      <span className="mr-1.5">{label}:</span>
      {entries.map((e, i) => (
        <span key={e.id}>
          <TermButton termId={e.id} className="text-ink">
            {e.term}
          </TermButton>
          {i < entries.length - 1 && <span aria-hidden>{" · "}</span>}
        </span>
      ))}
    </p>
  );
}
