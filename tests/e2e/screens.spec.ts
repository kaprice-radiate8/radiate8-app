/** Every main screen opens, with the four tabs from the brief. */
import { expect, test } from "@playwright/test";
import { returningVisitor } from "./helpers";

test("the four tabs are Today, Radiate 8, Moments and Stories", async ({ page }) => {
  await returningVisitor(page);
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main" });
  await expect(nav.getByRole("link")).toHaveText([/Today/, /Radiate 8/, /Moments/, /Stories/]);
});

for (const path of ["/", "/radiate8", "/radiate8/explore", "/intentions", "/intentions/new", "/intentions/view?id=missing", "/moments", "/stories", "/profile", "/bloom", "/activity", "/activity/rooted", "/dedications", "/dedications/where-time-disappeared", "/dimension/environment", "/dimension/spirit"]) {
  test(`${path} opens without errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await returningVisitor(page);
    await page.goto(path);
    await expect(page.locator("h1").first()).toBeVisible();
    expect(errors).toEqual([]);
  });
}
