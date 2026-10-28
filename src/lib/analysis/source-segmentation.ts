/**
 * Deterministic segmentation of pasted text into numbered source sentences (S1, S2…).
 *
 * The same normalized input always yields the same IDs, so a prewritten sample, a
 * model response and the source drawer all refer to identical text. Boundaries are
 * line breaks plus sentence-ending punctuation followed by whitespace and a likely
 * sentence start, skipping common abbreviations, initials and numeric text.
 */

export interface SourceSentence {
  id: string;
  text: string;
  /** Offsets into the normalized text. */
  start: number;
  end: number;
}

export const MAX_SEGMENTS = 400;

/** Unicode line and paragraph separators (U+2028, U+2029), built without literal characters. */
const LINE_SEPARATORS = new RegExp(`[${String.fromCharCode(0x2028)}${String.fromCharCode(0x2029)}]`, "g");
const CR = String.fromCharCode(13);
const NEWLINE = String.fromCharCode(10);
const CRLF_OR_CR = new RegExp(`${CR}${NEWLINE}?`, "g");

/** Normalizes newline conventions and trims the outer whitespace. Nothing else changes. */
export function normalizeInput(text: string): string {
  return text.replace(CRLF_OR_CR, NEWLINE).replace(LINE_SEPARATORS, NEWLINE).trim();
}

const ABBREVIATIONS = new Set(
  [
    "e.g", "i.e", "et al", "al", "vs", "etc", "fig", "figs", "dr", "mr", "mrs", "ms", "prof", "no", "nos", "approx",
    "ca", "cf", "inc", "ltd", "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "sept", "oct", "nov", "dec",
    "vol", "p", "pp", "n", "min", "max", "sd", "se", "st", "eq", "ref", "refs", "suppl", "resp", "incl", "est",
  ].map((a) => a.toLowerCase()),
);

function endsWithAbbreviation(before: string, next: string): boolean {
  const m = before.match(/([A-Za-z][A-Za-z.]*)\.$/);
  if (!m) return false;
  const word = m[1].toLowerCase().replace(/\.$/, "");
  if (ABBREVIATIONS.has(word)) return true;
  // Dotted abbreviations such as "U.S." or "e.g."
  if (/^([a-z]\.)+[a-z]$/i.test(m[1])) return true;
  // A single capital is treated as an initial only in a chain ("J. K. Smith"), because
  // abstracts often end sentences with names like "Compound X." or "vitamin D."
  if (/^[A-Z]$/.test(m[1]) && (/^[A-Z]\.\s/.test(next) || /(?:^|\s)[A-Z]\.\s[A-Z]\.$/.test(before))) return true;
  return false;
}

function splitLine(line: string, lineStart: number, out: Array<{ start: number; end: number }>) {
  let segStart = 0;
  const re = /[.?!](?:["'”’)\]]*)\s+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    const boundary = m.index + m[0].length;
    const next = line.slice(boundary);
    const punctEnd = m.index + 1;
    const before = line.slice(segStart, punctEnd);
    // The next sentence should start with a capital, digit, quote or bracket.
    if (!/^[A-Z0-9"“'‘(\[]/.test(next)) continue;
    if (line[m.index] === "." && endsWithAbbreviation(before, next)) continue;
    const trimmedEnd = m.index + m[0].trimEnd().length;
    out.push({ start: lineStart + segStart, end: lineStart + trimmedEnd });
    segStart = boundary;
  }
  if (segStart < line.length) out.push({ start: lineStart + segStart, end: lineStart + line.length });
}

export function segmentSource(normalized: string): SourceSentence[] {
  const ranges: Array<{ start: number; end: number }> = [];
  let offset = 0;
  for (const rawLine of normalized.split("\n")) {
    const leading = rawLine.length - rawLine.trimStart().length;
    const line = rawLine.trim();
    if (line.length > 0) splitLine(line, offset + leading, ranges);
    offset += rawLine.length + 1;
  }
  const limited = ranges.slice(0, MAX_SEGMENTS);
  return limited.map((r, i) => ({
    id: `S${i + 1}`,
    text: normalized.slice(r.start, r.end),
    start: r.start,
    end: r.end,
  }));
}
