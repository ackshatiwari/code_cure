import { expect, type Page } from "@playwright/test";
import { getCase } from "@/content/cases";
import type { Relation } from "@/lib/schemas/case";

const relationNames: Record<Relation, RegExp> = {
  supports: /^Supports part of the claim$/,
  challenges: /^Challenges the claim$/,
  open_question: /^Leaves a question open$/,
};

export async function isMobile(page: Page) {
  return (page.viewportSize()?.width ?? 1440) < 768;
}

/** Switches the phone task view; on wider screens every task is already visible. */
export async function showTask(page: Page, task: "Claim" | "Evidence" | "Board" | "Verdict") {
  if (!(await isMobile(page))) return;
  await page.getByRole("navigation", { name: "Investigation steps" }).getByRole("button", { name: new RegExp(`^${task}`) }).click();
}

export async function openAllClues(page: Page) {
  await showTask(page, "Evidence");
  const buttons = page.getByRole("button", { name: "Read this clue" });
  while ((await buttons.count()) > 0) {
    await buttons.first().click();
  }
}

/** Places every clue using the board's select-then-choose interaction. */
export async function placeClues(page: Page, slug: string, pick: (accepted: Relation[]) => Relation = (a) => a[0]) {
  const c = getCase(slug)!;
  await showTask(page, "Board");
  for (const clue of c.clues) {
    const key = c.answerKey.clues.find((k) => k.clueId === clue.id)!;
    const board = page.locator("section", { has: page.getByRole("heading", { name: "Evidence board" }) });
    await board.getByRole("button", { name: clue.title, exact: true }).click();
    await board.getByRole("button", { name: relationNames[pick(key.accepted)] }).click();
  }
}

export async function answerQuestions(page: Page, slug: string, correct = true) {
  const c = getCase(slug)!;
  await showTask(page, "Verdict");
  const choose = <T extends { id: string; label: string }>(options: T[], id: string) =>
    (correct ? options.find((o) => o.id === id) : options.find((o) => o.id !== id))!.label;
  await page.getByRole("radio", { name: new RegExp(`^${escape(choose(c.verdictOptions, c.answerKey.verdictId))}`) }).check();
  await page.getByRole("radio", { name: choose(c.reasonOptions, c.answerKey.reasonId), exact: true }).check();
  await page.getByRole("radio", { name: choose(c.headlineOptions, c.answerKey.headlineId), exact: true }).check();
}

function escape(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, "horizontal overflow in px").toBeLessThanOrEqual(0);
}
