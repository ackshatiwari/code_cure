import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { getCase } from "@/content/cases";

/** Activates a control from the keyboard only: focus it, then press a key. */
async function press(target: Locator, key: "Enter" | "Space" = "Enter") {
  await target.focus();
  await expect(target).toBeFocused();
  await target.press(key);
}

async function axe(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  const summary = results.violations.map((v) => `${v.id}: ${v.nodes.length} × ${v.nodes[0]?.target.join(" ")}`);
  expect(summary, "axe violations").toEqual([]);
}

test.describe("keyboard operation", () => {
  test.skip(({ isMobile }) => isMobile, "Keyboard flow runs on the desktop project");

  test("the skip link is the first tab stop and moves to main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("a whole case, a definition and a source drawer work from the keyboard", async ({ page }) => {
    const c = getCase("missing-denominator")!;
    await page.goto("/cases/missing-denominator");

    for (let i = 0; i < c.clues.length; i++) {
      await press(page.getByRole("button", { name: "Read this clue" }).first());
    }

    // Definition popover: opens with Enter, closes with Escape, focus returns to the term.
    const term = page.getByRole("button", { name: "Relative risk: show definition" }).first();
    await press(term);
    await expect(page.getByRole("dialog").getByText("A comparison of the risk in one group")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(term).toBeFocused();

    // Source drawer: same pattern.
    const sources = page.getByRole("button", { name: /^Sources \(/ }).first();
    await press(sources);
    await expect(page.getByRole("dialog", { name: "Sources for this clue" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(sources).toBeFocused();

    // Risk display toggle uses native radios.
    await press(page.getByRole("radio", { name: "Relative change" }), "Space");
    await expect(page.getByText(/25% lower/).first()).toBeVisible();

    const board = page.locator("section", { has: page.getByRole("heading", { name: "Evidence board" }) });
    const names = { supports: "Supports part of the claim", challenges: "Challenges the claim", open_question: "Leaves a question open" };
    for (const clue of c.clues) {
      const key = c.answerKey.clues.find((k) => k.clueId === clue.id)!;
      await press(board.getByRole("button", { name: clue.title, exact: true }));
      await press(board.getByRole("button", { name: names[key.accepted[0]], exact: true }));
    }

    await press(page.getByRole("radio", { name: /^Misleading/ }), "Space");
    await press(page.getByRole("radio", { name: c.reasonOptions[0].label }), "Space");
    await press(page.getByRole("radio", { name: c.headlineOptions[0].label }), "Space");
    await press(page.getByRole("button", { name: "Submit verdict" }));

    await expect(page).toHaveURL(/verdict$/);
    // Focus moves to the new page's heading after navigation.
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
    await expect(page.getByText("You kept the conclusion within the evidence.")).toBeVisible();
  });
});

test.describe("automated accessibility checks", () => {
  for (const path of ["/", "/cases", "/cases/missing-denominator", "/cases/earlier-clock", "/decode", "/glossary", "/methodology", "/cases/link-not-cause/verdict"]) {
    test(`axe finds no WCAG A/AA violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await axe(page);
    });
  }

  test("axe passes on an opened case, a decoded sample and a result page", async ({ page }) => {
    await page.goto("/cases/earlier-clock");
    const buttons = page.getByRole("button", { name: "Read this clue" });
    if (await page.getByRole("navigation", { name: "Investigation steps" }).isVisible()) {
      await page.getByRole("button", { name: /^Evidence/ }).click();
    }
    while ((await buttons.count()) > 0) await buttons.first().click();
    await page.getByRole("button", { name: "Show the screened path" }).click();
    await axe(page);

    await page.goto("/decode?sample=fictional-cell-study");
    await expect(page.getByText("Prewritten teaching example").first()).toBeVisible();
    await axe(page);
  });
});
