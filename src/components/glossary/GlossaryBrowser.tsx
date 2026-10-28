"use client";

import { Search } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { getGlossaryEntry, glossary, searchGlossary } from "@/content/glossary";
import { buttonClass, cx, linkClass } from "@/components/ui/styles";

export function GlossaryBrowser() {
  const uid = useId();
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState<string | null>(null);
  const results = searchGlossary(query);

  // Deep links such as /glossary#confounder highlight the entry once it is rendered.
  useEffect(() => {
    const sync = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id && getGlossaryEntry(id)) {
        setQuery("");
        setTarget(id);
        requestAnimationFrame(() => document.getElementById(id)?.focus());
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return (
    <div>
      <div className="max-w-xl">
        <label htmlFor={`${uid}-q`} className="font-semibold">
          Search terms
        </label>
        <div className="relative mt-2">
          <Search size={18} strokeWidth={1.75} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden />
          <input
            id={`${uid}-q`}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-describedby={`${uid}-n`}
            placeholder="Try “RCT”, “p-value” or “link”"
            className="block min-h-12 w-full rounded-[var(--radius-control)] border border-control bg-surface pl-10 pr-3.5"
          />
        </div>
        <p id={`${uid}-n`} className="mt-2 text-meta text-ink-muted" aria-live="polite">
          {query ? `${results.length} ${results.length === 1 ? "term" : "terms"} found` : `${glossary.length} terms`}
        </p>
      </div>

      {results.length === 0 ? (
        <div className="mt-6 max-w-xl rounded-[var(--radius-panel)] border border-dashed border-control p-6">
          <p className="font-semibold">No terms match “{query}”.</p>
          <p className="mt-1 text-ink-muted">Try a shorter word, or a related idea such as “risk”, “trial” or “survival”.</p>
          <button type="button" className={buttonClass("quiet", "sm", "mt-2 -ml-3.5")} onClick={() => setQuery("")}>
            Clear search
          </button>
        </div>
      ) : (
        <dl className="mt-6 grid gap-x-10 md:grid-cols-2">
          {results.map((e) => (
            <div
              key={e.id}
              id={e.id}
              tabIndex={-1}
              className={cx(
                "scroll-mt-24 border-t border-rule py-5 transition-colors duration-[var(--duration-base)]",
                target === e.id && "rounded-[var(--radius-control)] bg-caution-soft px-4",
              )}
            >
              <dt className="font-serif text-[1.375rem] font-semibold">{e.term}</dt>
              <dd className="mt-1 space-y-2">
                <p>{e.definition}</p>
                <p className="text-[0.9375rem] text-ink-muted">
                  <span className="font-semibold text-ink">Example: </span>
                  {e.example}
                </p>
                <p className="margin-note">
                  <span className="font-semibold text-ink">Why this matters when reading a claim: </span>
                  {e.whyItMatters}
                </p>
                {e.synonyms.length > 0 && <p className="text-meta text-ink-muted">Also searched as: {e.synonyms.join(", ")}</p>}
                {e.related.length > 0 && (
                  <p className="text-meta">
                    Related:{" "}
                    {e.related.map((r, i) => (
                      <span key={r}>
                        <a href={`#${r}`} className={linkClass}>
                          {getGlossaryEntry(r)?.term}
                        </a>
                        {i < e.related.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </p>
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
