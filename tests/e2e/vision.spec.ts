/**
 * The vision board: photos and words, each perhaps tagged with a dimension,
 * and any image can become (or link to) a 90-day intention.
 */
import { expect, test } from "@playwright/test";
import { breakStorage, fixStorage, returningVisitor } from "./helpers";

/** A small 8x6 PNG, standing in for a photo from her library. */
const PHOTO = {
  name: "sea.png",
  mimeType: "image/png",
  buffer: Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAALElEQVR4nGMImLYPK2JImbYPK2KomLYPK2LombYPK2JYMG0fVsSwZdo+rAgAtq5YIXFLnU8AAAAASUVORK5CYII=",
    "base64",
  ),
};

test("a photo grows into a 90-day intention, and the intention shows it", async ({ page }) => {
  await returningVisitor(page);
  await page.goto("/vision");
  await expect(page.getByText("Your board is waiting")).toBeVisible();

  // Add a photo with a few words and a dimension
  await page.getByLabel("Choose a photo").setInputFiles(PHOTO);
  await expect(page.getByAltText("The photo you chose")).toBeVisible();
  await page.getByLabel("A few words, if you like").fill("Mornings by the sea");
  await page.getByRole("button", { name: "Health & Body" }).click();
  await page.getByRole("button", { name: "Add to my board" }).click();
  await expect(page.getByRole("link", { name: "Mornings by the sea" })).toBeVisible();

  // Open it and make it a 90-day intention
  await page.getByRole("link", { name: "Mornings by the sea" }).click();
  await page.getByRole("link", { name: "Make this a 90-day intention" }).click();
  await expect(page.getByLabel("Your intention")).toHaveValue("Mornings by the sea");
  await expect(page.getByRole("button", { name: /Health & Body/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByAltText("Mornings by the sea")).toBeVisible();
  await page.getByLabel("Your intention").fill("Walk by the water three mornings a week");
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("This week's action 1").fill("Find my walking shoes");
  await page.getByRole("button", { name: "Plant this intention" }).click();

  // The intention shows the image it grew from
  await page.waitForURL(/\/intentions\/view\?id=/);
  await expect(page.getByRole("list", { name: "From your vision board" }).getByRole("link")).toHaveCount(1);

  // ...and the board shows the image is linked
  await page.goto("/vision");
  await expect(page.getByRole("list", { name: "Your vision board" }).getByText("90-day intention")).toBeVisible();
  await page.getByRole("link", { name: "Mornings by the sea" }).click();
  await expect(page.getByRole("link", { name: /Walk by the water/ })).toBeVisible();
});

test("words on the board can link to an intention she's growing, and be unlinked", async ({ page }) => {
  await returningVisitor(page);
  await page.evaluate(() => {
    const now = new Date().toISOString();
    const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const end = new Date();
    end.setDate(end.getDate() + 90);
    localStorage.setItem(
      "radiate:v2:intentions",
      JSON.stringify([{ id: "i1", title: "Host a dinner for my oldest friends", vision: "", dimensionIds: ["relationships"], becomeChoiceId: null, startsOn: key(new Date()), endsOn: key(end), status: "growing", reachedAt: null, createdAt: now, updatedAt: now }]),
    );
  });
  await page.goto("/vision");
  await page.getByRole("button", { name: "Add words" }).click();
  await page.getByLabel("Your words").fill("A table full of laughter");
  await page.getByRole("button", { name: "Add to my board" }).click();
  await page.getByRole("link", { name: "A table full of laughter" }).click();

  await page.getByRole("button", { name: "Host a dinner for my oldest friends" }).click();
  await expect(page.getByRole("link", { name: /Host a dinner/ })).toBeVisible();
  await page.goto("/intentions/view?id=i1");
  await expect(page.getByRole("link", { name: "A table full of laughter" })).toBeVisible();

  await page.getByRole("link", { name: "A table full of laughter" }).click();
  await page.getByRole("button", { name: "Unlink from this intention" }).click();
  await expect(page.getByRole("link", { name: "Make this a 90-day intention" })).toBeVisible();
});

test("items can be reordered, edited and removed", async ({ page }) => {
  await returningVisitor(page);
  await page.goto("/vision");
  for (const words of ["First light", "Second wind"]) {
    await page.getByRole("button", { name: "Add words" }).click();
    await page.getByLabel("Your words").fill(words);
    await page.getByRole("button", { name: "Add to my board" }).click();
    await expect(page.getByRole("link", { name: words })).toBeVisible();
  }
  const board = page.getByRole("list", { name: "Your vision board" }).getByRole("link");
  await expect(board).toHaveText([/First light/, /Second wind/]);

  await page.getByRole("link", { name: "Second wind" }).click();
  await page.getByRole("button", { name: "Move earlier" }).click();
  await expect(page.getByRole("button", { name: "Move earlier" })).toBeDisabled();
  await page.getByRole("button", { name: "Edit words" }).click();
  await page.getByLabel("Your words").fill("A second wind");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("heading", { name: "A second wind" })).toBeVisible();

  await page.goto("/vision");
  await expect(board).toHaveText([/A second wind/, /First light/]);

  await page.getByRole("link", { name: "First light" }).click();
  await page.getByRole("button", { name: "Remove from my board" }).click();
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await page.waitForURL(/\/vision$/);
  await expect(board).toHaveText([/A second wind/]);
});

test("a photo that doesn't save says so and stays on screen", async ({ page }) => {
  await returningVisitor(page);
  await page.goto("/vision");
  await page.getByLabel("Choose a photo").setInputFiles(PHOTO);
  await page.getByLabel("A few words, if you like").fill("Kept safe");
  await breakStorage(page);
  await page.getByRole("button", { name: "Add to my board" }).click();
  // Preparing the photo takes a moment, so wait for the notice.
  await expect(page.getByRole("alert").filter({ hasText: "didn't save" })).toBeVisible();
  await expect(page.getByLabel("A few words, if you like")).toHaveValue("Kept safe");
  await fixStorage(page);
  await page.getByRole("button", { name: "Add to my board" }).click();
  await expect(page.getByRole("link", { name: "Kept safe" })).toBeVisible();
});
