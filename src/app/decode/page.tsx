import type { Metadata } from "next";
import { Suspense } from "react";
import { DecoderWorkspace } from "@/components/decoder/DecoderWorkspace";

export const metadata: Metadata = {
  title: "Decode a paper",
  description: "Paste an abstract to understand its findings, its limits, and the questions it leaves open.",
};

function DecoderFallback() {
  return (
    <div className="max-w-3xl space-y-3" aria-hidden>
      <div className="skeleton h-6 w-40" />
      <div className="skeleton h-64 w-full" />
      <div className="skeleton h-12 w-full" />
    </div>
  );
}

export default function DecodePage() {
  return (
    <div className="container-page py-10">
      <header className="max-w-3xl">
        <p className="eyebrow">Decode a paper</p>
        <h1 className="mt-2 text-[2rem] lg:text-[2.5rem]">Read the study behind the headline.</h1>
        <p className="reading mt-3 text-[1.125rem] text-ink-muted">
          Paste an abstract to understand its findings, its limits, and the questions it leaves open.
        </p>
      </header>
      <div className="mt-8">
        <Suspense fallback={<DecoderFallback />}>
          <DecoderWorkspace />
        </Suspense>
      </div>
    </div>
  );
}
