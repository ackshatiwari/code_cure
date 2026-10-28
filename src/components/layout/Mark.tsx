/** Page edge with a folded corner, joined by an annotation bracket. */
export function Mark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      <path d="M7 4.5h12.5L25 10v17.5H7z" fill="#FFFEFA" stroke="#182D2A" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M19.5 4.5V10H25" stroke="#182D2A" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M11 14h8M11 18h6M11 22h8" stroke="#52615C" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 12.5h-1v11h1" stroke="#1F5C50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
