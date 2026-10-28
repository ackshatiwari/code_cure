import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cases, formatCaseNumber, getCase } from "@/content/cases";
import { CaseWorkspace } from "@/components/investigation/CaseWorkspace";

export function generateStaticParams() {
  return cases.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/cases/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = getCase(slug);
  if (!c) return { title: "Investigation not found" };
  return { title: `${formatCaseNumber(c.number)}: ${c.title}`, description: c.learningObjective };
}

export default async function CasePage({ params }: PageProps<"/cases/[slug]">) {
  const { slug } = await params;
  if (!getCase(slug)) notFound();
  return <CaseWorkspace slug={slug} />;
}
