"use client";

import { useCallback, useSyncExternalStore } from "react";
import { cases, DEMO_CASE_SLUG } from "@/content/cases";
import type { CuratedCase } from "@/lib/schemas/case";
import {
  initialProgress,
  investigationReducer,
  type CaseProgress,
  type InvestigationAction,
} from "@/lib/investigation";
import {
  clearProgress,
  getBrowserStorage,
  loadProgress,
  saveProgress,
  STORAGE_KEY,
  type LoadStatus,
} from "@/lib/progress-storage";

export type ProgressMode = "standard" | "demo";

/** The guided demo keeps its own attempt so rehearsals never touch real Case 01 progress. */
export function progressKey(c: CuratedCase, mode: ProgressMode) {
  return mode === "demo" ? `${c.id}:demo` : c.id;
}

const currentVersions: Record<string, number> = {};
for (const c of cases) {
  currentVersions[c.id] = c.version;
  if (c.slug === DEMO_CASE_SLUG) currentVersions[`${c.id}:demo`] = c.version;
}

interface StoreState {
  hydrated: boolean;
  /** "unavailable" means progress lives in memory only for this visit. */
  storage: LoadStatus | "write_failed";
  discarded: number;
  entries: Record<string, CaseProgress>;
}

const SERVER_STATE: StoreState = { hydrated: false, storage: "empty", discarded: 0, entries: {} };
let state: StoreState = SERVER_STATE;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function load() {
  const result = loadProgress(getBrowserStorage(), currentVersions);
  state = { hydrated: true, storage: result.status, discarded: result.discarded, entries: result.entries };
}

function ensureLoaded() {
  if (!state.hydrated && typeof window !== "undefined") load();
}

function onStorageEvent(e: StorageEvent) {
  if (e.key === STORAGE_KEY || e.key === null) {
    load();
    emit();
  }
}

function subscribe(listener: () => void) {
  ensureLoaded();
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorageEvent);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorageEvent);
  };
}

function getSnapshot() {
  ensureLoaded();
  return state;
}

function getServerSnapshot() {
  return SERVER_STATE;
}

function persist(entries: Record<string, CaseProgress>) {
  const storage = getBrowserStorage();
  if (!storage) return state.storage === "unavailable" ? "unavailable" : "write_failed";
  return saveProgress(storage, entries) ? (state.storage === "write_failed" ? "ok" : state.storage) : "write_failed";
}

export function dispatchProgress(c: CuratedCase, mode: ProgressMode, action: InvestigationAction) {
  ensureLoaded();
  const key = progressKey(c, mode);
  const current = state.entries[key] ?? initialProgress(c);
  const next = investigationReducer(c, current, action);
  if (next === current && state.entries[key]) return;
  const entries = { ...state.entries, [key]: next };
  state = { ...state, entries, storage: persist(entries) };
  emit();
}

/** Removes every saved case attempt. Requires explicit confirmation in the UI. */
export function resetAllProgress() {
  clearProgress(getBrowserStorage());
  state = { ...state, entries: {}, discarded: 0, storage: state.storage === "unavailable" ? "unavailable" : "empty" };
  emit();
}

export function useProgressStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useCaseProgress(c: CuratedCase, mode: ProgressMode = "standard") {
  const store = useProgressStore();
  const progress = store.entries[progressKey(c, mode)] ?? null;
  const dispatch = useCallback((action: InvestigationAction) => dispatchProgress(c, mode, action), [c, mode]);
  return { hydrated: store.hydrated, storage: store.storage, progress: progress ?? initialProgress(c), saved: progress, dispatch };
}
