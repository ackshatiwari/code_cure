import Link from "next/link";
import { Mark } from "./Mark";
import { SiteNav } from "./SiteNav";

export function SiteHeader() {
  return (
    <header className="relative border-b border-rule bg-canvas/95">
      <div className="container-page flex min-h-16 items-center justify-between gap-4 py-2">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2.5 rounded-md" aria-label="Paper2People home">
          <Mark />
          <span className="font-serif text-[1.375rem] font-semibold tracking-tight text-ink">
            Paper<span className="text-primary">2</span>People
          </span>
        </Link>
        <SiteNav />
      </div>
    </header>
  );
}
