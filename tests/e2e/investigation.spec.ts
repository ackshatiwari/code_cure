import { expect, test } from "@playwright/test";
import { answerQuestions, expectNoHorizontalOverflow, openAllClues, placeClues, showTask } from "./helpers";

test.describe("investigation flow", () => {
  test("a new visitor completes Case 01 and sees the explanation and score", async ({ page }) => {
    await page.goto("/cases/missing-denominator");
    await expect(page.getByRole("heading", { level: 1, name: "The missing denominator" })).toBeVisible();
    await expect(page.getByText("Fictional teaching example — not a real study").first()).toBeVisible();

    await openAllClues(page);
    await expect(page.getByText("3 of 3 clues opened")).toBeVisible();
    await placeClues(page, "missing-denominator");
    await answerQuestions(page, "missing-denominator");
    await expectNoHorizontalOverflow(page);
    await page.getByRole("button", { name: "Submit verdict" }).click();

    await expect(page).toHaveURL(/\/cases\/missing-denominator\/verdict$/);
    await expect(page.getByRole("heading", { level: 2, name: "Verdict: Misleading" })).toBeVisible();
    await expect(page.getByText("You kept the conclusion within the evidence.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "What it does not establish" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Learning score" })).toBeVisible();
    await expect(page.getByRole("complementary", { name: "Score and next steps" }).getByText(/^100/).first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("submission is blocked with visible reasons until every clue is opened and placed", async ({ page }) => {
    await page.goto("/cases/link-not-cause");
    await showTask(page, "Verdict");
    // The button is aria-disabled (still focusable and clickable) so pressing it can explain what is missing.
    await page.getByRole("button", { name: "Submit verdict" }).click({ force: true });
    await expect(page.getByText("Open 3 more clues.")).toBeVisible();
    await expect(page).toHaveURL(/\/cases\/link-not-cause$/);
  });

  test("refresh restores progress", async ({ page }) => {
    await page.goto("/cases/dish-to-person");
    await openAllClues(page);
    await page.reload();
    await showTask(page, "Evidence");
    await expect(page.getByText("3 of 3 clues opened")).toBeVisible();
    await expect(page.getByText("Progress saved on this device.")).toBeVisible();
  });

  test("practice again keeps the first-attempt score and does not duplicate completion", async ({ page }) => {
    await page.goto("/cases/supported-conclusion");
    await openAllClues(page);
    await placeClues(page, "supported-conclusion");
    await answerQuestions(page, "supported-conclusion");
    await page.getByRole("button", { name: "Submit verdict" }).click();
    await expect(page.getByRole("heading", { name: "Verdict: Supported" })).toBeVisible();

    await page.getByRole("button", { name: "Practice again" }).click();
    await expect(page).toHaveURL(/\/cases\/supported-conclusion$/);
    await openAllClues(page);
    await placeClues(page, "supported-conclusion", (accepted) => (accepted.includes("challenges") ? "supports" : "challenges"));
    await answerQuestions(page, "supported-conclusion", false);
    await page.getByRole("button", { name: "Submit verdict" }).click();

    await expect(page.getByText(/First attempt: 100 · This practice \(attempt 2\): 0/)).toBeVisible();
    await page.goto("/cases");
    await expect(page.getByText("1 of 5 completed on this device")).toBeVisible();
  });

  test("an accepted alternative relation earns full board credit", async ({ page }) => {
    await page.goto("/cases/earlier-clock");
    await openAllClues(page);
    await placeClues(page, "earlier-clock", (accepted) => accepted[accepted.length - 1]);
    await answerQuestions(page, "earlier-clock");
    await page.getByRole("button", { name: "Submit verdict" }).click();
    await expect(page.getByText("Board (3 of 3 accepted)")).toBeVisible();
  });

  test("direct verdict navigation without an attempt does not invent a score", async ({ page }) => {
    await page.goto("/cases/link-not-cause/verdict");
    await expect(page.getByText(/no submitted attempt for this investigation/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Learning score" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Start this investigation/ })).toBeVisible();
    await page.getByRole("button", { name: "Read the explanation" }).click();
    await expect(page.getByText("Explanation only · no attempt recorded")).toBeVisible();
    await expect(page.getByRole("heading", { name: "No score recorded" })).toBeVisible();
  });

  test("unknown case slugs return a real not-found page", async ({ page }) => {
    const res = await page.goto("/cases/not-a-real-case");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "We couldn't find that page" })).toBeVisible();
  });

  test("the guided demo keeps its own attempt separate from Case 01", async ({ page }) => {
    await page.goto("/demo");
    await expect(page.getByRole("complementary", { name: "Guided demo" })).toBeVisible();
    await openAllClues(page);
    await page.goto("/cases/missing-denominator");
    await showTask(page, "Evidence");
    await expect(page.getByText("0 of 3 clues opened")).toBeVisible();
  });
});
