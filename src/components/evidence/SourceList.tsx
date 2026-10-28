import { ExternalLink } from "lucide-react";
import { getSource, sourceRoleLabels } from "@/content/sources";
import { cx, linkClass } from "@/components/ui/styles";

function formatChecked(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/** Full source records: title, organization, role, scope, dates and a real link. */
export function SourceList({ sourceIds, headingLevel = 3 }: { sourceIds: string[]; headingLevel?: 3 | 4 }) {
  const items = [...new Set(sourceIds)].map((id) => getSource(id)).filter((s) => s !== undefined);
  const H = headingLevel === 3 ? "h3" : "h4";
  return (
    <ul className="space-y-5">
      {items.map((s) => (
        <li key={s.id} className="border-l-2 border-rule pl-4">
          <p className="text-meta font-semibold uppercase tracking-wide text-ink-muted">{sourceRoleLabels[s.role]}</p>
          <H className="mt-1 font-sans text-[1.0625rem] font-semibold leading-snug">{s.title}</H>
          <p className="text-meta text-ink-muted">{s.organization}</p>
          <dl className="mt-2 grid gap-x-3 gap-y-0.5 text-meta sm:grid-cols-[auto_1fr]">
            <dt className="text-ink-muted">Date on source</dt>
            <dd>{s.publicationDate ? `${s.publicationDateLabel} ${s.publicationDate}` : "No date shown on the page"}</dd>
            <dt className="text-ink-muted">Reference checked</dt>
            <dd>{s.checkedAt ? formatChecked(s.checkedAt) : "Not applicable (written for this app)"}</dd>
          </dl>
          <p className="mt-2 text-[0.9375rem]">
            <span className="font-semibold">Used for: </span>
            {s.supports}
          </p>
          {s.scopeLimitations.length > 0 && (
            <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-[0.9375rem] text-ink-muted">
              {s.scopeLimitations.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          )}
          {s.url && (
            <a href={s.url} target="_blank" rel="noopener noreferrer" className={cx(linkClass, "mt-2 inline-flex items-center gap-1.5 text-[0.9375rem]")}>
              Open source <span className="sr-only">(opens in a new tab)</span>
              <ExternalLink size={14} strokeWidth={1.75} aria-hidden />
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
