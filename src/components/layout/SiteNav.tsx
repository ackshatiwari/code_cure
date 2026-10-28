"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { cx } from "@/components/ui/styles";

const primaryLinks = [
  { href: "/cases", label: "Investigate" },
  { href: "/decode", label: "Decode a paper" },
  { href: "/glossary", label: "Glossary" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`) || (href === "/cases" && pathname.startsWith("/demo"));
}

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close the mobile menu whenever the route changes (including back/forward).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }
  useLayoutEffect(() => () => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const linkClasses = (href: string) =>
    cx(
      "inline-flex min-h-11 items-center rounded-[var(--radius-control)] px-3 text-[0.9375rem] font-semibold transition-colors duration-[var(--duration-fast)]",
      isActive(pathname, href) ? "text-primary underline decoration-2 underline-offset-[6px]" : "text-ink hover:bg-primary-soft",
    );

  return (
    <>
      <nav aria-label="Main" className="hidden md:block">
        <ul className="flex items-center gap-1">
          {primaryLinks.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={linkClasses(l.href)} aria-current={isActive(pathname, l.href) ? "page" : undefined}>
                {l.label}
              </Link>
            </li>
          ))}
          <li className="ml-2 border-l border-rule pl-3">
            <Link
              href="/methodology"
              className={cx(linkClasses("/methodology"), "font-normal text-ink-muted")}
              aria-current={isActive(pathname, "/methodology") ? "page" : undefined}
            >
              How it works
            </Link>
          </li>
        </ul>
      </nav>

      <div className="md:hidden">
        <button
          ref={buttonRef}
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-control bg-surface px-3 font-semibold"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={18} strokeWidth={1.75} aria-hidden /> : <Menu size={18} strokeWidth={1.75} aria-hidden />}
          Menu
        </button>
        <nav
          id={menuId}
          aria-label="Main"
          hidden={!open}
          className="absolute inset-x-0 top-full z-40 border-b border-rule bg-surface shadow-[var(--shadow-overlay)]"
        >
          <ul className="container-page flex flex-col py-2">
            {[...primaryLinks, { href: "/methodology", label: "How it works" }].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={cx(linkClasses(l.href), "w-full")}
                  aria-current={isActive(pathname, l.href) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
