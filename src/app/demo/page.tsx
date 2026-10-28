import type { Metadata } from "next";
import { DEMO_CASE_SLUG } from "@/content/cases";
import { CaseWorkspace } from "@/components/investigation/CaseWorkspace";

export const metadata: Metadata = {
  title: "Guided demo: The missing denominator",
  description: "A guided run through Case 01, kept separate from your regular progress.",
};

export default function DemoPage() {
  return <CaseWorkspace slug={DEMO_CASE_SLUG} mode="demo" />;
}
