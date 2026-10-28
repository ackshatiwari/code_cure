import { HardDrive, TriangleAlert } from "lucide-react";
import { cx } from "@/components/ui/styles";

/** Honest status of where progress lives. Space is reserved before hydration to avoid layout shift. */
export function StorageNote({ hydrated, storage, className }: { hydrated: boolean; storage: string; className?: string }) {
  if (!hydrated) return <p className={cx("h-6", className)} aria-hidden />;
  const unavailable = storage === "unavailable" || storage === "write_failed";
  return (
    <p className={cx("flex min-h-6 items-center gap-1.5 text-meta", unavailable ? "text-caution" : "text-ink-muted", className)}>
      {unavailable ? <TriangleAlert size={14} strokeWidth={1.75} aria-hidden /> : <HardDrive size={14} strokeWidth={1.75} aria-hidden />}
      {unavailable
        ? "This browser isn't letting the app save. Progress is kept only until you leave or refresh."
        : storage === "recovered"
          ? "Progress saved on this device. Some older saved progress couldn't be read and was set aside."
          : "Progress saved on this device."}
    </p>
  );
}
