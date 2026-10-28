import Link from "next/link";
import { cases, formatCaseNumber } from "@/content/cases";
import { buttonClass, linkClass } from "@/components/ui/styles";

export default function NotFound() {
  return (
    <div className="container-page py-16">
      <p className="case-id">404</p>
      <h1 className="mt-2 text-[2rem] lg:text-[2.5rem]">We couldn&apos;t find that page</h1>
      <p className="reading mt-3 text-ink-muted">
        The link may be mistyped, or the investigation may have moved. Pasted abstracts never get their own address, so an old
        analysis link won&apos;t work either.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/cases" className={buttonClass("primary")}>
          Browse investigations
        </Link>
        <Link href="/" className={buttonClass("secondary")}>
          Go to the home page
        </Link>
      </div>
      <h2 className="mt-12 text-[1.25rem]">All investigations</h2>
      <ul className="mt-3 space-y-1.5">
        {cases.map((c) => (
          <li key={c.slug}>
            <span className="case-id mr-2">{formatCaseNumber(c.number)}</span>
            <Link href={`/cases/${c.slug}`} className={linkClass}>
              {c.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
