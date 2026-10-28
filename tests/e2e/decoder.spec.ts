import { expect, test, type Page } from "@playwright/test";
import { decoderSamples } from "@/content/samples";
import { assembleAnalysis } from "@/lib/analysis/response-validation";
import { normalizeInput, segmentSource } from "@/lib/analysis/source-segmentation";

/** Our error message; Next.js also renders an empty role="alert" route announcer. */
const ALERT = "[role=alert]:not(#__next-route-announcer__)";

const sample = decoderSamples[0];
const customText = `${sample.text} A second fictional sentence was added so this is no longer the sample.`;

function liveAnalysisFor(text: string) {
  const sourceText = normalizeInput(text);
  return assembleAnalysis(sample.analysis, {
    origin: "ai_generated",
    provenanceNote: null,
    userTitle: null,
    sourceText,
    sentences: segmentSource(sourceText),
  });
}

async function enableMockedLive(page: Page, handler: (text: string) => Promise<{ status: number; body: unknown }>) {
  await page.route("**/api/capabilities", (route) => route.fulfill({ json: { liveAnalysis: true, reason: null } }));
  await page.route("**/api/analyze", async (route) => {
    const { text } = route.request().postDataJSON() as { text: string };
    const { status, body } = await handler(text);
    try {
      await route.fulfill({ status, json: body });
    } catch {
      // The page aborted the request first; nothing to fulfil.
    }
  });
}

test.describe("decoder", () => {
  test("a sample works without a key and keeps labels and working anchors", async ({ page }) => {
    await page.goto("/decode");
    await page.getByRole("button", { name: "Relative risk sample" }).click();
    await page.getByRole("button", { name: "Decode abstract" }).click();
    const output = page.getByRole("region", { name: "Decoded abstract" }).or(page.locator("[aria-label='Decoded abstract']"));
    await expect(output.getByText("Prewritten teaching example").first()).toBeVisible();
    await expect(output.getByText("Fictional teaching example — not a real study").first()).toBeVisible();
    await expect(output.getByText("Based on the pasted abstract").first()).toBeVisible();

    await output.getByRole("button", { name: "Show source sentence S2 in the original text" }).first().click();
    const highlighted = page.locator(".sentence-highlight");
    await expect(highlighted).toContainText("20 participants in the comparison group and 15 in the intervention group");
    await page.getByRole("button", { name: "Back to the explanation" }).click();
    await expect(output.getByRole("button", { name: "Show source sentence S2 in the original text" }).first()).toBeFocused();
    // The decoder never puts pasted text in the address bar.
    expect(page.url()).not.toContain("comparison");
  });

  test("arbitrary text without live mode gets honest feedback and stays intact", async ({ page }) => {
    await page.goto("/decode");
    const box = page.getByLabel("Abstract text");
    await box.fill(customText);
    await page.getByRole("button", { name: "Decode abstract" }).click();
    await expect(page.locator(ALERT)).toContainText("Analysis of your own abstract isn't enabled in this installation");
    await expect(box).toHaveValue(customText);
    await expect(page.getByText("Prewritten teaching example")).toHaveCount(0);
  });

  test("a link on its own is turned away with guidance", async ({ page }) => {
    await page.goto("/decode");
    await page.getByLabel("Abstract text").fill("https://doi.org/10.1000/example");
    await page.getByRole("button", { name: "Decode abstract" }).click();
    await expect(page.locator(ALERT)).toContainText("Paste the abstract text itself");
  });

  test("a mocked live response populates the analysis, anchors and copy", async ({ page, context, browserName }) => {
    test.skip(browserName !== "chromium");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await enableMockedLive(page, async (text) => ({ status: 200, body: { ok: true, analysis: liveAnalysisFor(text) } }));
    await page.goto("/decode");
    await expect(page.getByText(/sent to the AI provider configured/)).toBeVisible();
    await page.getByLabel("Abstract text").fill(customText);
    await page.getByRole("button", { name: "Decode abstract" }).click();

    await expect(page.getByText("AI-generated explanation — check against the original text")).toBeVisible();
    await expect(page.getByText("Prewritten teaching example")).toHaveCount(0);
    await page.getByRole("button", { name: "Show source sentence S4 in the original text" }).first().click();
    await expect(page.locator(".sentence-highlight")).toContainText("The observed relative reduction was 25%");
    await expect(page.getByText(/S6\s*A second fictional sentence/)).toBeVisible();

    await page.getByRole("button", { name: "Copy explanation" }).click();
    await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain("Origin: AI-generated explanation");
    expect(copied).toContain("Coverage: Based on the pasted abstract only");
  });

  test("cancelling a pending request never applies its late result", async ({ page }) => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    await enableMockedLive(page, async (text) => {
      await gate;
      return { status: 200, body: { ok: true, analysis: liveAnalysisFor(text) } };
    });
    await page.goto("/decode");
    await page.getByLabel("Abstract text").fill(customText);
    await page.getByRole("button", { name: "Decode abstract" }).click();
    await expect(page.getByText("Reading the supplied text", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.locator(ALERT)).toContainText("Analysis cancelled");
    release();
    await page.waitForTimeout(500);
    await expect(page.getByText("AI-generated explanation — check against the original text")).toHaveCount(0);
    await expect(page.getByLabel("Abstract text")).toHaveValue(customText);
  });

  test("a replaced request cannot overwrite newer work", async ({ page }) => {
    const firstText = `${customText} First version.`;
    const secondText = `${customText} Second version.`;
    let releaseFirst!: () => void;
    const firstGate = new Promise<void>((r) => (releaseFirst = r));
    await enableMockedLive(page, async (text) => {
      if (text.endsWith("First version.")) await firstGate;
      return { status: 200, body: { ok: true, analysis: liveAnalysisFor(text) } };
    });
    await page.goto("/decode");
    const box = page.getByLabel("Abstract text");
    await box.fill(firstText);
    await page.getByRole("button", { name: "Decode abstract" }).click();
    await expect(page.getByText("Reading the supplied text", { exact: true })).toBeVisible();
    // A sample replaces the pending request.
    await page.getByRole("button", { name: "Relative risk sample" }).click();
    await box.fill(secondText);
    await page.getByRole("button", { name: "Decode abstract" }).click();
    const aiLabel = page.getByText("AI-generated explanation — check against the original text");
    const staleBanner = page.getByText(/edited the text since this explanation was made/);
    await expect(aiLabel).toBeVisible();
    await expect(staleBanner).toHaveCount(0);
    releaseFirst();
    await page.waitForTimeout(500);
    // The late first response would describe different text and trigger the stale banner.
    await expect(aiLabel).toBeVisible();
    await expect(staleBanner).toHaveCount(0);
    await expect(box).toHaveValue(secondText);
  });

  test("a malformed live response is not shown", async ({ page }) => {
    await enableMockedLive(page, async () => ({ status: 200, body: { ok: true, analysis: { nonsense: true } } }));
    await page.goto("/decode");
    await page.getByLabel("Abstract text").fill(customText);
    await page.getByRole("button", { name: "Decode abstract" }).click();
    await expect(page.locator(ALERT)).toContainText("couldn't be checked against your text");
    await expect(page.getByRole("button", { name: "Explore a sample" })).toBeVisible();
  });

  test("rate limiting and timeouts are explained without losing input", async ({ page }) => {
    let call = 0;
    await enableMockedLive(page, async () => {
      call++;
      return call === 1
        ? { status: 429, body: { ok: false, error: { code: "rate_limited", message: "x" } } }
        : { status: 504, body: { ok: false, error: { code: "timeout", message: "x" } } };
    });
    await page.goto("/decode");
    await page.getByLabel("Abstract text").fill(customText);
    await page.getByRole("button", { name: "Decode abstract" }).click();
    await expect(page.locator(ALERT)).toContainText("reached the limit");
    await page.getByRole("button", { name: "Try again" }).click();
    await expect(page.locator(ALERT)).toContainText("took too long");
    await expect(page.getByLabel("Abstract text")).toHaveValue(customText);
  });
});
