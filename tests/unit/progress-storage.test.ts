import { describe, expect, it } from "vitest";
import { getCase } from "@/content/cases";
import { initialProgress } from "@/lib/investigation";
import { loadProgress, saveProgress, STORAGE_KEY, type StorageLike } from "@/lib/progress-storage";

function memoryStorage(initial: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = v;
    },
    removeItem: (k) => {
      delete data[k];
    },
  };
}

const c = getCase("missing-denominator")!;
const versions = { [c.id]: c.version };

describe("progress storage", () => {
  it("round-trips valid progress", () => {
    const s = memoryStorage();
    const p = { ...initialProgress(c), openedClueIds: ["the-counts"], status: "investigating" as const };
    expect(saveProgress(s, { [c.id]: p })).toBe(true);
    const loaded = loadProgress(s, versions);
    expect(loaded.status).toBe("ok");
    expect(loaded.entries[c.id].openedClueIds).toEqual(["the-counts"]);
  });

  it("recovers from corrupt JSON", () => {
    const loaded = loadProgress(memoryStorage({ [STORAGE_KEY]: "{not json" }), versions);
    expect(loaded).toMatchObject({ status: "recovered", entries: {} });
  });

  it("recovers from an unknown storage schema version", () => {
    const loaded = loadProgress(memoryStorage({ [STORAGE_KEY]: JSON.stringify({ schemaVersion: 99, entries: {} }) }), versions);
    expect(loaded.status).toBe("recovered");
  });

  it("drops entries from an incompatible case version and keeps valid ones", () => {
    const s = memoryStorage();
    const old = { ...initialProgress(c), caseVersion: c.version + 1 };
    saveProgress(s, { [c.id]: old, "case-02": initialProgress(getCase("link-not-cause")!) });
    const loaded = loadProgress(s, { ...versions, "case-02": 1 });
    expect(loaded.entries[c.id]).toBeUndefined();
    expect(loaded.entries["case-02"]).toBeDefined();
    expect(loaded.discarded).toBe(1);
  });

  it("drops a malformed entry without throwing", () => {
    const s = memoryStorage({
      [STORAGE_KEY]: JSON.stringify({ schemaVersion: 1, entries: { [c.id]: { caseId: c.id, status: "bogus" } } }),
    });
    expect(loadProgress(s, versions)).toMatchObject({ status: "recovered", discarded: 1, entries: {} });
  });

  it("reports unavailable storage and failed writes", () => {
    expect(loadProgress(null, versions).status).toBe("unavailable");
    const throwing: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota");
      },
      removeItem: () => {},
    };
    expect(saveProgress(throwing, {})).toBe(false);
  });
});
