import type { Page } from "@playwright/test";

/** Skip onboarding by saving a finished profile, as a returning visitor would have. */
export async function returningVisitor(page: Page, name = "Kaprice") {
  await page.goto("/profile");
  await page.evaluate((n) => {
    localStorage.clear();
    localStorage.setItem("radiate:v2:profile", JSON.stringify({ name: n, onboardedAt: "2026-09-01T00:00:00Z" }));
  }, name);
}

/** Make the browser refuse to save, like a full phone or blocked private browsing. */
export async function breakStorage(page: Page) {
  await page.evaluate(() => {
    (window as unknown as { __realSetItem: unknown }).__realSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function () {
      throw new DOMException("Storage full", "QuotaExceededError");
    };
  });
}

export async function fixStorage(page: Page) {
  await page.evaluate(() => {
    Storage.prototype.setItem = (window as unknown as { __realSetItem: typeof Storage.prototype.setItem }).__realSetItem;
  });
}

/** Messages shown with role="alert", ignoring Next.js's hidden route announcer. */
export async function alerts(page: Page) {
  const texts = await page.locator('[role="alert"]:not(#__next-route-announcer__)').allTextContents();
  return texts.filter((t) => t.trim());
}
