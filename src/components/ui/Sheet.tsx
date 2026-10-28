"use client";

import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import { useLayoutEffect, useRef } from "react";
import { cx } from "./styles";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

/**
 * Side sheet on wide screens, bottom sheet on phones. Radix handles focus trapping,
 * Escape and returning focus to the trigger.
 */
export function Sheet({ open, onOpenChange, title, description, children }: SheetProps) {
  // Close when Activity hides this route so returning never shows a stale overlay.
  const latest = useRef(onOpenChange);
  useLayoutEffect(() => {
    latest.current = onOpenChange;
  });
  useLayoutEffect(() => () => latest.current(false), []);
  // Triggers are ordinary buttons, so remember what had focus and return to it on close.
  const returnFocus = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (open && document.activeElement instanceof HTMLElement) returnFocus.current = document.activeElement;
  }, [open]);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/30 data-[state=open]:animate-[fade_var(--duration-base)_var(--ease)]" />
        <Dialog.Content
          onCloseAutoFocus={(e) => {
            const target = returnFocus.current;
            if (target?.isConnected) {
              e.preventDefault();
              target.focus();
            }
          }}
          className={cx(
            "fixed z-50 flex flex-col bg-surface shadow-[var(--shadow-overlay)] focus:outline-none",
            "inset-x-0 bottom-0 max-h-[88dvh] rounded-t-[var(--radius-panel)]",
            "md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[min(32rem,100vw)] md:rounded-none md:rounded-l-[var(--radius-panel)]",
          )}
          {...(description ? {} : { "aria-describedby": undefined })}
        >
          <div className="flex items-start justify-between gap-4 border-b border-rule px-5 py-4">
            <div>
              <Dialog.Title className="font-serif text-2xl font-semibold">{title}</Dialog.Title>
              {description && <Dialog.Description className="mt-1 text-meta text-ink-muted">{description}</Dialog.Description>}
            </div>
            <Dialog.Close
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-control)] border border-control hover:bg-primary-soft"
              aria-label="Close"
            >
              <X size={18} strokeWidth={1.75} aria-hidden />
            </Dialog.Close>
          </div>
          <div className="overflow-y-auto overscroll-contain px-5 py-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
