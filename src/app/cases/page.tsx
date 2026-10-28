import type { Metadata } from "next";
import Link from "next/link";
import { CaseList } from "@/components/investigation/CaseList";
import { linkClass } from "@/components/ui/styles";

export const metadata: Metadata = {
  title: "Investigations",
  description: "Five short investigations into cancer claims about prevention, screening and research.",
};

export default function CasesPage() {
  return (
    <div className="container-page py-10">
      <header className="max-w-3xl">
        <p className="eyebrow">Investigations</p>
        <h1 className="mt-2 text-[2rem] lg:text-[2.5rem]">Follow a claim back to its evidence</h1>
        <p className="reading mt-3 text-ink-muted">
          Each case starts with a short post. Read three clues, decide how each one bears on the claim, then give your verdict.
          All cases are open; take them in any order. Want a walkthrough first? Try the{" "}
          <Link href="/demo" className={linkClass}>
            guided demo of Case 01
          </Link>
          .
        </p>
      </header>
      <div className="mt-8">
        <CaseList withFilters featureFirst />
      </div>
    </div>
  );
}
