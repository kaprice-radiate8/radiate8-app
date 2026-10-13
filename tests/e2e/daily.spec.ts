/**
 * Daily Activity and Dedications: two separate, light invitations from Today.
 */
import { expect, test } from "@playwright/test";
import { alerts, breakStorage, fixStorage, returningVisitor } from "./helpers";

test("Today offers both paths and Today's Dedication, with no streaks", async ({ page }) => {
  await returningVisitor(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "How do you want to feel?" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Rev Up/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Calm \/ Reset/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Have ten minutes\?/ })).toBeVisible();
  await expect(page.getByText(/streak|missed/i)).toHaveCount(0);
});

test("a Daily Activity: song, steps, and a light question at the end", async ({ page }) => {
  await returningVisitor(page);
  await page.goto("/");
  await page.getByRole("link", { name: /Calm \/ Reset/ }).click();
  await page.waitForURL(/\/activity\/.+/);

  // The song opens in her own music service; nothing is played from the app.
  await expect(page.getByText("Your song")).toBeVisible();
  const spotify = page.getByRole("link", { name: /Spotify/ });
  await expect(spotify).toHaveAttribute("href", /open\.spotify\.com/);
  await expect(spotify).toHaveAttribute("target", "_blank");
  await expect(page.locator("audio")).toHaveCount(0);

  await page.getByRole("button", { name: /I.m done/ }).click();
  // No writing required: a question and optional one-tap answers.
  await expect(page.getByRole("textbox")).toHaveCount(0);
  await page.getByRole("button", { name: "Steadier" }).click();
  await expect(page.getByText("Carry that with you.")).toBeVisible();
  const log = await page.evaluate(() => JSON.parse(localStorage.getItem("radiate:v2:activity-log") ?? "[]"));
  expect(log).toHaveLength(1);
  expect(log[0].felt).toBe("Steadier");
});

test("each path lists its own activities, and another can be chosen", async ({ page }) => {
  await returningVisitor(page);
  await page.goto("/activity/hand-on-heart");
  await expect(page.getByRole("heading", { name: "Hand on Heart" })).toBeVisible();
  await page.getByRole("link", { name: /Try a different one/ }).click();
  await expect(page.getByRole("heading", { name: "Rooted" })).toBeVisible();

  await page.goto("/activity");
  await expect(page.getByRole("heading", { name: "How do you want to feel?" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Kitchen Floor Dance/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Desk Unfold/ })).toBeVisible();
});

test("a Dedication: read, practice, and write only if she likes", async ({ page }) => {
  await returningVisitor(page);
  await page.goto("/dedications");
  await expect(page.getByRole("heading", { name: /Ten minutes for the life you.re becoming/ })).toBeVisible();
  await expect(page.getByText("Something to discover")).toBeVisible();

  await page.goto("/dedications/the-room-around-you");
  await expect(page.getByRole("heading", { name: "The Room Around You" })).toBeVisible();
  await expect(page.getByText("A slow walk through your space")).toBeVisible();
  await expect(page.getByText("Thank you for this time.")).toBeVisible();
  // Writing is offered, not required.
  await expect(page.getByRole("textbox")).toHaveCount(0);
  await page.getByRole("button", { name: "Write, if you like" }).click();
  const page1 = page.getByLabel(/One small change/);
  await page1.fill("Fresh flowers by the window");

  await breakStorage(page);
  await page.getByRole("button", { name: "Keep these words" }).click();
  expect((await alerts(page)).join(" ")).toContain("didn't save");
  await expect(page1).toHaveValue("Fresh flowers by the window");
  await fixStorage(page);
  await page.getByRole("button", { name: "Keep these words" }).click();
  await expect(page.getByText("Fresh flowers by the window")).toBeVisible();
});

test("Today's Dedication is sometimes chosen for what she's focusing on", async ({ page }) => {
  await returningVisitor(page);
  await page.evaluate(() => {
    const now = new Date().toISOString();
    localStorage.setItem(
      "radiate:v2:become-choices",
      JSON.stringify([{ id: "c1", dimensionIds: ["environment"], text: "Make the bedroom a sanctuary", createdAt: now, updatedAt: now }]),
    );
  });
  await page.goto("/dedications");
  const evenDay = await page.evaluate(() => {
    const d = new Date();
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000) % 2 === 0;
  });
  if (evenDay) {
    await expect(page.getByText("For your Environment")).toBeVisible();
    await expect(page.getByRole("heading", { name: "The Room Around You" })).toBeVisible();
  } else {
    await expect(page.getByText(/For your/)).toHaveCount(0);
  }
});
