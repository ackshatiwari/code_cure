import Link from "next/link";
import { linkClass } from "@/components/ui/styles";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-rule">
      <div className="container-page grid gap-6 py-10 text-meta text-ink-muted md:grid-cols-[1fr_auto]">
        <div className="reading space-y-2">
          <p>
            <strong className="font-semibold text-ink">Paper2People</strong> teaches how to read research claims. It is
            not medical advice and can&apos;t tell you anything about your own health, risk, screening or treatment.
          </p>
          <p>Educational prototype; expert content review pending.</p>
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 md:flex-col md:items-end">
          <li>
            <Link className={linkClass} href="/methodology">
              Sources, scoring and privacy
            </Link>
          </li>
          <li>
            <Link className={linkClass} href="/methodology#report">
              Report a content issue
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
