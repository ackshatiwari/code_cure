import { expect, test } from "@playwright/test";
import { answerQuestions, expectNoHorizontalOverflow, openAllClues, placeClues } from "./helpers";

const widths = [360, 390, 768, 1024, 1440];
const paths = ["/", "/cases", "/cases/missing-denominator", "/cases/earlier-clock", "/decode?sample=fictional-rct-relative-risk", "/glossary", "/methodology"];

test.describe("responsive layout", () => {
  test.skip(({ isMobile }) => isMobile, "Widths are set explicitly in this suite");

  for (const width of widths) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of paths) {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        await expectNoHorizontalOverflow(page);
      }
    });
  }

  test("a phone-width visitor completes a case using the task navigation", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/cases/dish-to-person");
    await expect(page.getByRole("navigation", { name: "Investigation steps" })).toBeVisible();
    await openAllClues(page);
    await placeClues(page, "dish-to-person");
    await answerQuestions(page, "dish-to-person");
    const submit = page.getByRole("button", { name: "Submit verdict" });
    await submit.scrollIntoViewIfNeeded();
    // Nothing sticky covers the submit button.
    const box = (await submit.boundingBox())!;
    const topElement = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest("button")?.textContent, {
      x: box.x + box.width / 2,
      y: box.y + box.height / 2,
    });
    expect(topElement).toContain("Submit verdict");
    await expectNoHorizontalOverflow(page);
    await submit.click();
    await expect(page.getByRole("heading", { name: "Verdict: Unsupported" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("text can be enlarged to 200% without breaking the case layout", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/cases/missing-denominator");
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("button", { name: "Read this clue" }).first()).toBeVisible();
  });
});
