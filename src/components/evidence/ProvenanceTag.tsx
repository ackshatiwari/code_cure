import { FileText, Sparkles } from "lucide-react";
import { cx } from "@/components/ui/styles";

type Tone = "fictional" | "real" | "ai";

/** Visible provenance next to the content it describes. */
export function ProvenanceTag({ children, tone = "fictional", className }: { children: React.ReactNode; tone?: Tone; className?: string }) {
  const Icon = tone === "ai" ? Sparkles : FileText;
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-meta font-semibold",
        tone === "fictional" && "border-caution/50 bg-caution-soft text-caution",
        tone === "real" && "border-primary/40 bg-primary-soft text-primary",
        tone === "ai" && "border-control bg-surface-muted text-ink",
        className,
      )}
    >
      <Icon size={14} strokeWidth={1.75} aria-hidden />
      {children}
    </span>
  );
}
