/**
 * The core loop from the build brief: first visit → Radiate 8 → what she
 * notices → choose dimensions → Reflect → Bloom → Become → her choice is kept.
 */
import { expect, test } from "@playwright/test";
import { alerts, breakStorage, fixStorage, returningVisitor } from "./helpers";

test("a first visit leads from the welcome into the first Radiate 8", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.goto("/");
  await page.waitForURL("**/welcome");
  await page.getByRole("button", { name: "Begin" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Your first name").fill("Kaprice");
  await page.getByRole("button", { name: "Come in" }).click();
  await page.waitForURL("**/radiate8/assess");
  await expect(page.getByRole("heading", { name: /begin with where you are/i })).toBeVisible();
});

test("the full Radiate 8 → Reflect → Bloom → Become loop", async ({ page }) => {
  await returningVisitor(page);
  await page.goto("/radiate8/assess");
  await page.getByRole("button", { name: "Begin" }).click();

  // Eight dimensions, one at a time, described in words (never numbers)
  const names = ["Health & Body", "Relationships & Love", "Career & Purpose", "Finance", "Environment", "Growth", "Joy", "Spirit"];
  for (const [i, name] of names.entries()) {
    await expect(page.getByRole("heading", { name })).toBeVisible();
    if (name === "Joy") {
      await page.getByRole("slider").fill("9");
      await expect(page.getByText("Radiant")).toBeVisible();
      await page.getByLabel("A few words, if you like").fill("Dancing in the kitchen");
    } else {
      await page.getByRole("slider").fill(String((i % 5) + 3));
    }
    await expect(page.getByText(/\d+ ?\/ ?10/)).toHaveCount(0);
    await page.getByRole("button", { name: "Continue" }).click();
  }

  await page.getByLabel("What do you notice?").fill("Joy is louder than I expected.");
  await page.getByRole("button", { name: "Save this reflection" }).click();

  // Choose where to place attention
  await page.getByRole("button", { name: /Joy/ }).click();
  await page.getByRole("button", { name: /Environment/ }).click();
  await page.getByRole("button", { name: "Begin Reflect, Bloom, Become" }).click();
  await page.waitForURL(/explore\?d=joy,environment/);

  // Reflect
  await expect(page.getByRole("heading", { name: "Reflect" })).toBeVisible();
  await page.getByLabel("Where am I now?").fill("Lighter than last month.");
  await page.getByRole("button", { name: /Save and continue to Bloom/ }).click();
  // Bloom (skipped)
  await expect(page.getByRole("heading", { name: "Bloom" })).toBeVisible();
  await page.getByRole("button", { name: "Skip for now" }).click();
  // Become
  await expect(page.getByRole("heading", { name: "Become" })).toBeVisible();
  await page.getByLabel("Your choice, in a few words").fill("Host a dinner for my oldest friends");
  await page.getByRole("button", { name: "Save my choice" }).click();
  await expect(page.getByText("Your choice is saved")).toBeVisible();

  // It all shows up on the Radiate 8 and on each dimension
  await page.goto("/radiate8");
  await expect(page.getByText("Joy is louder than I expected.")).toBeVisible();
  await expect(page.getByText("Host a dinner for my oldest friends")).toBeVisible();
  await page.goto("/dimension/joy");
  await expect(page.getByText("Radiant")).toBeVisible();
  await expect(page.getByText("Dancing in the kitchen")).toBeVisible();
  await expect(page.getByText("Lighter than last month.")).toBeVisible();
  await expect(page.getByText("Host a dinner for my oldest friends")).toBeVisible();
});

test("a second Radiate 8 can be compared with the first, in words", async ({ page }) => {
  await returningVisitor(page);
  await page.evaluate(() => {
    const places = (v: number) => ({ health: v, relationships: v, career: v, finance: v, environment: v, growth: v, joy: v, spirit: v });
    localStorage.setItem(
      "radiate:v2:assessments",
      JSON.stringify([
        { id: "a1", takenAt: "2026-09-01T10:00:00Z", places: places(3), notes: {}, noticing: "Everything felt quiet." },
        { id: "a2", takenAt: "2026-10-01T10:00:00Z", places: { ...places(3), joy: 9 }, notes: {}, noticing: "Joy came back." },
      ]),
    );
  });
  await page.goto("/radiate8");
  await page.getByRole("link", { name: /See what.s changed/ }).click();
  await expect(page.getByText("Joy came back.")).toBeVisible();
  await expect(page.getByText("Everything felt quiet.")).toBeVisible();
  await expect(page.getByText("Radiant").first()).toBeVisible();
});

test("a Become choice that doesn't save says so and keeps her words", async ({ page }) => {
  await returningVisitor(page);
  await page.goto("/radiate8/explore?d=spirit");
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.getByLabel("Your choice, in a few words").fill("Ten quiet minutes each morning");
  await breakStorage(page);
  await page.getByRole("button", { name: "Save my choice" }).click();
  expect((await alerts(page)).join(" ")).toContain("didn't save");
  await expect(page.getByLabel("Your choice, in a few words")).toHaveValue("Ten quiet minutes each morning");
  await fixStorage(page);
  await page.getByRole("button", { name: "Save my choice" }).click();
  await expect(page.getByText("Your choice is saved")).toBeVisible();
});
