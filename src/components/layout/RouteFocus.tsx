"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * After client-side navigation, move focus to the visible page's main heading so
 * keyboard and screen-reader users start at the new content. Hidden (Activity)
 * routes stay in the DOM, so only a rendered heading is chosen.
 */
export function RouteFocus() {
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const frame = requestAnimationFrame(() => {
      const headings = Array.from(document.querySelectorAll<HTMLElement>("#main h1"));
      const visible = headings.find((h) => h.offsetParent !== null || h.getClientRects().length > 0);
      if (!visible) return;
      if (!visible.hasAttribute("tabindex")) visible.setAttribute("tabindex", "-1");
      visible.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);
  return null;
}
