import { NextResponse, type NextRequest } from "next/server";
import { cases } from "@/content/cases";

const knownSlugs = new Set(cases.map((c) => c.slug));

/**
 * Unknown case slugs would otherwise stream the not-found UI with a 200 status,
 * because the page shell is prerendered. Rewriting them to an unmatched path makes
 * Next serve the real not-found page with a 404.
 */
export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/")[2];
  if (slug && !knownSlugs.has(slug)) {
    return NextResponse.rewrite(new URL("/__unknown-case", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/cases/:slug", "/cases/:slug/verdict"],
};
