import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { RouteFocus } from "@/components/layout/RouteFocus";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Announcer } from "@/components/ui/Announcer";
import "./globals.css";

// Self-hosted, OFL-licensed fonts (see ./fonts/LICENSE-*.txt). Fallbacks keep the page
// readable if a font fails to load.
const newsreader = localFont({
  src: "./fonts/newsreader-latin-wght-normal.woff2",
  variable: "--font-newsreader",
  weight: "200 800",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const sourceSans = localFont({
  src: [
    { path: "./fonts/source-sans-3-latin-wght-normal.woff2", style: "normal", weight: "200 900" },
    { path: "./fonts/source-sans-3-latin-wght-italic.woff2", style: "italic", weight: "200 900" },
  ],
  variable: "--font-source-sans",
  display: "swap",
  fallback: ["Segoe UI", "Roboto", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: "Paper2People — Understand the research. Follow the evidence.",
    template: "%s · Paper2People",
  },
  description:
    "Investigate cancer claims, understand the research behind them, and see where the evidence stops. An educational research-literacy app.",
  applicationName: "Paper2People",
};

export const viewport: Viewport = {
  themeColor: "#f6f4ee",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${newsreader.variable} ${sourceSans.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-[var(--radius-control)] bg-primary px-4 py-3 font-semibold text-surface focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <Announcer />
        <RouteFocus />
      </body>
    </html>
  );
}
