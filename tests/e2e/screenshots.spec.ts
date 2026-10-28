import { test } from "@playwright/test";
import { answerQuestions, openAllClues, placeClues } from "./helpers";

/**
 * Captures representative screenshots for review into docs/screenshots.
 * Run with: SCREENSHOTS=1 npx playwright test screenshots
 */
test.skip(!process.env.SCREENSHOTS, "Set SCREENSHOTS=1 to capture review screenshots");

test("capture representative screens", async ({ page }, info) => {
  const dir = `docs/screenshots/${info.project.name}`;
  const shot = (name: string) => page.screenshot({ path: `${dir}/${name}.png`, fullPage: true });

  await page.goto("/");
  await shot("01-home");
  await page.goto("/cases");
  await shot("02-library");
  await page.goto("/demo");
  await openAllClues(page);
  await shot("03-case01-workspace");
  await placeClues(page, "missing-denominator");
  await answerQuestions(page, "missing-denominator");
  await page.getByRole("button", { name: "Submit verdict" }).click();
  await page.getByRole("heading", { name: "Verdict: Misleading" }).waitFor();
  await shot("04-case01-result");
  await page.goto("/cases/supported-conclusion/verdict");
  await page.getByRole("button", { name: "Read the explanation" }).click();
  await shot("05-case05-explanation");
  await page.goto("/cases/earlier-clock");
  await openAllClues(page);
  await page.getByRole("button", { name: "Show the screened path" }).click();
  await shot("06-case04-timeline");
  await page.goto("/decode?sample=fictional-rct-relative-risk");
  await page.getByText("Prewritten teaching example").first().waitFor();
  await shot("07-decoder-sample");
  await page.goto("/decode");
  await page.getByLabel("Abstract text").fill("We studied something new in 40 adults. It seemed to help.");
  await page.getByRole("button", { name: "Decode abstract" }).click();
  await page.locator("[role=alert]:not(#__next-route-announcer__)").waitFor();
  await shot("08-decoder-live-unavailable");
  await page.goto("/glossary");
  await shot("09-glossary");
  await page.goto("/methodology");
  await shot("10-methodology");
});
