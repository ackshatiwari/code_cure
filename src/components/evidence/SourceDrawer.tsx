"use client";

import { Library } from "lucide-react";
import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { buttonClass } from "@/components/ui/styles";
import { SourceList } from "./SourceList";

export function SourceDrawer({ sourceIds, label = "Sources", title = "Sources for this clue" }: { sourceIds: string[]; label?: string; title?: string }) {
  const [open, setOpen] = useState(false);
  if (sourceIds.length === 0) return null;
  return (
    <>
      <button type="button" className={buttonClass("quiet", "sm", "-ml-3.5")} onClick={() => setOpen(true)} aria-haspopup="dialog">
        <Library size={16} strokeWidth={1.75} aria-hidden />
        {label} ({new Set(sourceIds).size})
      </button>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        title={title}
        description="Background citations explain concepts. They do not contain the fictional numbers used in teaching examples."
      >
        <SourceList sourceIds={sourceIds} />
      </Sheet>
    </>
  );
}
