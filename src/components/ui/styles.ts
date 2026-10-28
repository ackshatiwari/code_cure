export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type Variant = "primary" | "secondary" | "quiet" | "danger";
type Size = "md" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] font-semibold text-control " +
  "transition-[background-color,border-color,color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease)] " +
  "disabled:cursor-not-allowed aria-disabled:cursor-not-allowed select-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-surface hover:bg-primary-hover active:translate-y-px disabled:bg-[#9aaba5] disabled:text-surface aria-disabled:bg-[#9aaba5]",
  secondary:
    "border border-control bg-surface text-ink hover:border-primary hover:bg-primary-soft active:bg-[#d6e5dc] disabled:text-ink-muted disabled:border-rule disabled:bg-surface-muted",
  quiet:
    "text-primary underline-offset-4 hover:underline hover:bg-primary-soft active:bg-[#d6e5dc] disabled:text-ink-muted",
  danger:
    "border border-critical bg-surface text-critical hover:bg-critical-soft active:bg-[#f2d8cf]",
};

const sizes: Record<Size, string> = {
  md: "min-h-12 px-5 py-2.5",
  sm: "min-h-11 px-3.5 py-2 text-[0.9375rem]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return cx(base, variants[variant], sizes[size], extra);
}

export const panelClass = "rounded-[var(--radius-panel)] border border-rule bg-surface";

export const linkClass = "text-primary underline decoration-1 underline-offset-[3px] hover:decoration-2";

export const visuallyHidden = "sr-only";
