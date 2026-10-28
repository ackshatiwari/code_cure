import type { Metadata } from "next";
import { DEMO_CASE_SLUG } from "@/content/cases";
import { ResultView } from "@/components/investigation/ResultView";

export const metadata: Metadata = { title: "Guided demo: results" };

export default function DemoVerdictPage() {
  return <ResultView slug={DEMO_CASE_SLUG} mode="demo" />;
}
