import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cases, getCase } from "@/content/cases";
import { ResultView } from "@/components/investigation/ResultView";

export function generateStaticParams() {
  return cases.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/cases/[slug]/verdict">): Promise<Metadata> {
  const { slug } = await params;
  const c = getCase(slug);
  if (!c) return { title: "Investigation not found" };
  return { title: `Results: ${c.title}`, description: c.verdictScope };
}

export default async function VerdictPage({ params }: PageProps<"/cases/[slug]/verdict">) {
  const { slug } = await params;
  if (!getCase(slug)) notFound();
  return <ResultView slug={slug} />;
}
