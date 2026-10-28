"use client";

import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { cases, formatCaseNumber, topicLabels } from "@/content/cases";
import type { CuratedCase, Topic } from "@/lib/schemas/case";
import type { CaseProgress } from "@/lib/investigation";
import { useProgressStore } from "@/lib/progress-store";
import { buttonClass, cx } from "@/components/ui/styles";

function describe(c: CuratedCase, p: CaseProgress | undefined) {
  if (!p || (p.status === "not_started" && !p.firstSubmission)) {
    return { status: "Not started", action: "Start", href: `/cases/${c.slug}`, done: false };
  }
  const submittedNow = p.status === "submitted" || p.status === "reviewing";
  if (p.firstSubmission && submittedNow) {
    return { status: `Completed · first score ${p.firstSubmission.score.total}`, action: "Review", href: `/cases/${c.slug}/verdict`, done: true };
  }
  if (p.firstSubmission) {
    return { status: `Completed · practicing again`, action: "Continue", href: `/cases/${c.slug}`, done: true };
  }
  return {
    status: `In progress · ${p.openedClueIds.length} of ${c.clues.length} clues read`,
    action: "Continue",
    href: `/cases/${c.slug}`,
    done: false,
  };
}

function CaseRow({ c, p, hydrated, featured = false }: { c: CuratedCase; p: CaseProgress | undefined; hydrated: boolean; featured?: boolean }) {
  const d = describe(c, p);
  return (
    <li
      className={cx(
        "grid gap-x-6 gap-y-3 border-t border-rule py-5 sm:grid-cols-[6.5rem_minmax(0,1fr)_auto] sm:items-center",
        featured && "rounded-[var(--radius-panel)] border border-rule bg-surface px-5 sm:grid-cols-[minmax(0,1fr)_auto]",
      )}
    >
      {!featured && <span className="case-id">{formatCaseNumber(c.number)}</span>}
      <div className="min-w-0">
        {featured && <span className="case-id">{formatCaseNumber(c.number)} · Featured</span>}
        <h3 className={cx("font-serif font-semibold leading-snug", featured ? "mt-1 text-[1.625rem]" : "text-[1.3125rem]")}>
          <Link href={`/cases/${c.slug}`} className="hover:text-primary hover:underline hover:underline-offset-4">
            {c.title}
          </Link>
        </h3>
        {featured && <p className="mt-1 text-ink-muted">“{c.claimText}”</p>}
        <p className="mt-1 text-meta text-ink-muted">
          {topicLabels[c.topic]} · {c.skill} · about {c.estimatedMinutes} min
        </p>
        <p className={cx("mt-1 min-h-5 text-meta font-semibold", d.done ? "text-primary" : "text-ink-muted")}>
          {hydrated ? (
            <span className="inline-flex items-center gap-1">
              {d.done && <Check size={14} strokeWidth={2} aria-hidden />}
              {d.status}
            </span>
          ) : (
            <span aria-hidden>&nbsp;</span>
          )}
        </p>
      </div>
      <Link
        href={hydrated ? d.href : `/cases/${c.slug}`}
        className={buttonClass(featured ? "primary" : "secondary", "sm", "justify-self-start sm:justify-self-end")}
        aria-label={`${hydrated ? d.action : "Open"}: ${formatCaseNumber(c.number)}, ${c.title}`}
      >
        {hydrated ? d.action : "Open"} <ArrowRight size={16} strokeWidth={1.75} aria-hidden />
      </Link>
    </li>
  );
}

export function CaseList({ withFilters = false, featureFirst = false }: { withFilters?: boolean; featureFirst?: boolean }) {
  const store = useProgressStore();
  const [topic, setTopic] = useState<Topic | "all">("all");
  const name = useId();
  const filtered = topic === "all" ? cases : cases.filter((c) => c.topic === topic);
  const featured = featureFirst && topic === "all" ? cases[0] : null;
  const rest = featured ? filtered.filter((c) => c !== featured) : filtered;
  const completed = cases.filter((c) => store.entries[c.id]?.firstSubmission).length;

  return (
    <div>
      {withFilters && (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <fieldset>
            <legend className="text-meta font-semibold">Filter by topic</legend>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {(["all", "prevention", "screening", "research"] as const).map((t) => (
                <label
                  key={t}
                  className={cx(
                    "inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-[0.9375rem] font-semibold has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-primary",
                    topic === t ? "border-primary bg-primary text-surface" : "border-control bg-surface hover:bg-primary-soft",
                  )}
                >
                  <input type="radio" name={name} className="sr-only" checked={topic === t} onChange={() => setTopic(t)} />
                  {t === "all" ? "All topics" : topicLabels[t]}
                </label>
              ))}
            </div>
          </fieldset>
          <p className="min-h-6 text-meta text-ink-muted" aria-live="polite">
            {store.hydrated ? `${completed} of ${cases.length} completed on this device` : ""}
          </p>
        </div>
      )}

      {featured && (
        <ul className="mb-4">
          <CaseRow c={featured} p={store.entries[featured.id]} hydrated={store.hydrated} featured />
        </ul>
      )}

      {rest.length === 0 ? (
        <div className="rounded-[var(--radius-panel)] border border-dashed border-control p-6">
          <p className="font-semibold">No investigations match this topic.</p>
          <button type="button" className={buttonClass("quiet", "sm", "mt-2 -ml-3.5")} onClick={() => setTopic("all")}>
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="border-b border-rule">
          {rest.map((c) => (
            <CaseRow key={c.id} c={c} p={store.entries[c.id]} hydrated={store.hydrated} />
          ))}
        </ul>
      )}
      {withFilters && topic !== "all" && rest.length > 0 && (
        <button type="button" className={buttonClass("quiet", "sm", "mt-3 -ml-3.5")} onClick={() => setTopic("all")}>
          Clear filters
        </button>
      )}
    </div>
  );
}
