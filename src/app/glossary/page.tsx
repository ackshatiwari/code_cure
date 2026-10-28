import type { Metadata } from "next";
import { GlossaryBrowser } from "@/components/glossary/GlossaryBrowser";

export const metadata: Metadata = {
  title: "Glossary",
  description: "Plain-language definitions of research terms, with examples and why each matters when reading a claim.",
};

export default function GlossaryPage() {
  return (
    <div className="container-page py-10">
      <header className="max-w-3xl">
        <p className="eyebrow">Glossary</p>
        <h1 className="mt-2 text-[2rem] lg:text-[2.5rem]">Research terms, in plain language</h1>
        <p className="reading mt-3 text-ink-muted">
          Each term has a short definition, an example, and why it matters when you read a health claim. Definitions are also
          available inside cases and the decoder; you never need them to finish.
        </p>
      </header>
      <div className="mt-8">
        <GlossaryBrowser />
      </div>
    </div>
  );
}
