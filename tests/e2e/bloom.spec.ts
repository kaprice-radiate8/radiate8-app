/**
 * Her bloom: each reflection opens a petal, every 8 finish a flower, and
 * after 90 days her flowers are gathered into a bouquet. Nothing is lost.
 */
import { expect, test, type Page } from "@playwright/test";

const DAY = 86_400_000;

/** A returning visitor who joined `daysAgo` days ago, with `pages` reflections already written. */
async function visitor(page: Page, { daysAgo = 3, pages = 0, pagesDaysAgo = 1 } = {}) {
  await page.goto("/profile");
  await page.evaluate(
    ({ daysAgo, pages, pagesDaysAgo, DAY }) => {
      localStorage.clear();
      const joined = new Date(Date.now() - daysAgo * DAY).toISOString();
      localStorage.setItem("radiate:v2:profile", JSON.stringify({ name: "Kaprice", onboardedAt: joined }));
      const at = new Date(Date.now() - pagesDaysAgo * DAY).toISOString();
      const journal = Array.from({ length: pages }, (_, i) => ({
        id: `j${i}`, dimensionIds: [i % 2 ? "joy" : "spirit"], movement: "reflect", prompt: "Where am I now?",
        text: `Page ${i}`, createdAt: at, updatedAt: at,
      }));
      localStorage.setItem("radiate:v2:journal", JSON.stringify(journal));
    },
    { daysAgo, pages, pagesDaysAgo, DAY },
  );
}

test("a reflection opens the first petal on Today", async ({ page }) => {
  await visitor(page);
  await page.goto("/");
  await expect(page.getByText("Your first petal is waiting")).toBeVisible();

  await page.goto("/radiate8/explore?d=joy");
  await page.getByLabel("Where am I now?").fill("Lighter than last month.");
  await page.getByRole("button", { name: /Save and continue to Bloom/ }).click();
  await page.goto("/");
  await expect(page.getByText("1 of 8 petals")).toBeVisible();
});

test("the eighth petal finishes a flower, once, and a new one begins", async ({ page }) => {
  await visitor(page, { pages: 7 });
  await page.goto("/");
  await expect(page.getByText("7 of 8 petals")).toBeVisible();

  await page.goto("/radiate8/explore?d=growth");
  await page.getByLabel("Where am I now?").fill("Eight.");
  await page.getByRole("button", { name: /Save and continue to Bloom/ }).click();
  await page.goto("/");
  await expect(page.getByText("A flower is finished.")).toBeVisible();
  await expect(page.getByText("1 flower finished this season")).toBeVisible();

  // The moment happens once; next time she sees the new flower.
  await page.reload();
  await expect(page.getByText("A new flower begins")).toBeVisible();
});

test("living a Become choice opens a gold-edged petal", async ({ page }) => {
  await visitor(page);
  await page.evaluate(() => {
    const now = new Date().toISOString();
    localStorage.setItem(
      "radiate:v2:become-choices",
      JSON.stringify([{ id: "c1", dimensionIds: ["relationships"], text: "Host a dinner for my oldest friends", createdAt: now, updatedAt: now }]),
    );
  });
  await page.goto("/dimension/relationships");
  await page.getByRole("button", { name: /Host a dinner/ }).click();
  await page.getByRole("button", { name: "I lived this" }).click();
  await expect(page.getByText("Lived today")).toBeVisible();

  await page.goto("/bloom");
  await expect(page.getByText("1 of 8 petals").first()).toBeVisible();
  await expect(page.locator('svg[aria-label^="The flower you"] path[stroke="var(--r8-gold)"]')).toHaveCount(1);
});

test("after 90 days her flowers are gathered into a bouquet, shown once", async ({ page }) => {
  await visitor(page, { daysAgo: 100, pages: 11, pagesDaysAgo: 95 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Your bouquet is ready" })).toBeVisible();

  await page.getByRole("link", { name: /Your bouquet is ready/ }).click();
  await page.waitForURL("**/bloom");
  await expect(page.getByRole("heading", { name: "Everything you grew" })).toBeVisible();
  await expect(page.getByText("2 flowers")).toBeVisible();
  // The new season starts fresh, and nothing is counted as missed.
  await expect(page.getByText("Your first petal is waiting")).toBeVisible();
  await expect(page.getByText(/missed|streak/i)).toHaveCount(0);

  // Seen once: Today goes back to her flower; the bouquet stays kept on /bloom.
  await page.goto("/");
  await expect(page.getByText("Your bouquet is ready")).toHaveCount(0);
  await page.goto("/bloom");
  await expect(page.getByText("Your bouquets")).toBeVisible();
});
