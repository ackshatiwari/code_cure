"use client";

import { AlertDialog } from "radix-ui";
import { useLayoutEffect, useState } from "react";
import { cases } from "@/content/cases";
import { resetAllProgress, useProgressStore } from "@/lib/progress-store";
import { StorageNote } from "@/components/investigation/StorageNote";
import { announce } from "@/components/ui/Announcer";
import { buttonClass } from "@/components/ui/styles";

/** Deliberate, confirmed reset of every saved case attempt on this device. */
export function ProgressControls() {
  const store = useProgressStore();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  useLayoutEffect(() => () => setOpen(false), []);
  const saved = Object.keys(store.entries).length;
  const completed = cases.filter((c) => store.entries[c.id]?.firstSubmission).length;

  return (
    <div className="space-y-3">
      <StorageNote hydrated={store.hydrated} storage={store.storage} />
      <p className="min-h-6 text-[0.9375rem]">
        {store.hydrated && `${completed} of ${cases.length} investigations completed, ${saved} saved ${saved === 1 ? "attempt" : "attempts"} (including the guided demo).`}
      </p>
      <AlertDialog.Root open={open} onOpenChange={setOpen}>
        <AlertDialog.Trigger className={buttonClass("danger", "sm")} disabled={!store.hydrated || saved === 0}>
          Reset all progress…
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-ink/30" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(28rem,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-panel)] bg-surface p-6 shadow-[var(--shadow-overlay)]">
            <AlertDialog.Title className="font-serif text-[1.5rem] font-semibold">Reset all progress?</AlertDialog.Title>
            <AlertDialog.Description className="mt-2">
              This removes every saved attempt and score on this device, including first-attempt scores. It can&apos;t be undone.
            </AlertDialog.Description>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <AlertDialog.Cancel className={buttonClass("secondary", "sm")}>Keep my progress</AlertDialog.Cancel>
              <AlertDialog.Action
                className={buttonClass("danger", "sm")}
                onClick={() => {
                  resetAllProgress();
                  setDone(true);
                  announce("All progress was reset.");
                }}
              >
                Reset progress
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
      {done && saved === 0 && <p className="text-[0.9375rem] text-primary">Progress reset. You can start any case fresh.</p>}
    </div>
  );
}
