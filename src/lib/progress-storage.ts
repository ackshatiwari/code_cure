import { z } from "zod";
import { caseProgressSchema, type CaseProgress } from "@/lib/investigation";

/**
 * Versioned, validated progress in browser storage. Only low-sensitivity game
 * state lives here. Pasted abstracts and analyses are never written by this module.
 * Nothing here touches `window` at import time, so it is safe to import on the server.
 */
export const STORAGE_KEY = "paper2people.progress";
export const STORAGE_SCHEMA_VERSION = 1;

const storedSchema = z.object({
  schemaVersion: z.literal(STORAGE_SCHEMA_VERSION),
  entries: z.record(z.string(), z.unknown()),
});

export type LoadStatus = "ok" | "empty" | "recovered" | "unavailable";

export interface LoadResult {
  entries: Record<string, CaseProgress>;
  status: LoadStatus;
  /** Number of entries discarded because they were corrupt or from an older case version. */
  discarded: number;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Returns usable browser storage, or null when blocked (private mode, disabled, quota). */
export function getBrowserStorage(): StorageLike | null {
  try {
    if (typeof window === "undefined") return null;
    const s = window.localStorage;
    const probe = "paper2people.probe";
    s.setItem(probe, "1");
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

/**
 * @param currentVersions map of progress key → current case version. Entries for
 * unknown keys or outdated versions are dropped rather than mis-scored.
 */
export function loadProgress(storage: StorageLike | null, currentVersions: Record<string, number>): LoadResult {
  if (!storage) return { entries: {}, status: "unavailable", discarded: 0 };
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { entries: {}, status: "unavailable", discarded: 0 };
  }
  if (raw === null) return { entries: {}, status: "empty", discarded: 0 };

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return { entries: {}, status: "recovered", discarded: 1 };
  }
  const outer = storedSchema.safeParse(parsedJson);
  if (!outer.success) return { entries: {}, status: "recovered", discarded: 1 };

  const entries: Record<string, CaseProgress> = {};
  let discarded = 0;
  for (const [key, value] of Object.entries(outer.data.entries)) {
    const parsed = caseProgressSchema.safeParse(value);
    if (!parsed.success || currentVersions[key] === undefined || parsed.data.caseVersion !== currentVersions[key]) {
      discarded++;
      continue;
    }
    entries[key] = parsed.data;
  }
  return { entries, status: discarded > 0 ? "recovered" : "ok", discarded };
}

export function saveProgress(storage: StorageLike | null, entries: Record<string, CaseProgress>): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: STORAGE_SCHEMA_VERSION, entries }));
    return true;
  } catch {
    return false;
  }
}

export function clearProgress(storage: StorageLike | null): boolean {
  if (!storage) return false;
  try {
    storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
