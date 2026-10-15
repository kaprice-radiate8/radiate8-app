/**
 * 90-day intentions: a Become choice grows into an intention with milestones
 * and weekly actions, Today offers one meaningful action, and living it opens
 * a petal. Only what she lived is counted; nothing is ever "missed".
 */
import { expect, test, type Page } from "@playwright/test";
import { alerts, breakStorage, fixStorage, returningVisitor } from "./helpers";

/** Save an intention directly, planted `daysAgo` days ago, with optional actions `weeksAgo` weeks back. */
async function seedIntention(page: Page, { daysAgo = 0, actions = [] as { title: string; weeksAgo: number }[], milestones = [] as string[] } = {}) {
  await page.evaluate(
    ({ daysAgo, actions, milestones }) => {
      const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const day = (offset: number) => {
        const d = new Date();
        d.setDate(d.getDate() + offset);
        return d;
      };
      const monday = (d: Date) => {
        const m = new Date(d);
        m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
        return key(m);
      };
      const now = new Date().toISOString();
      const start = day(-daysAgo);
      localStorage.setItem(
        "radiate:v2:intentions",
        JSON.stringify([
          {
            id: "i1", title: "Host a dinner for my oldest friends", vision: "Because they are my people.", dimensionIds: ["relationships", "joy"],
            becomeChoiceId: null, startsOn: key(start), endsOn: key(day(90 - daysAgo)), status: "growing", reachedAt: null, createdAt: now, updatedAt: now,
          },
        ]),
      );
      localStorage.setItem(
        "radiate:v2:weekly-actions",
        JSON.stringify(actions.map((a, i) => ({ id: `a${i}`, intentionId: "i1", title: a.title, weekOf: monday(day(-7 * a.weeksAgo)), livedAt: null, createdAt: now, updatedAt: now }))),
      );
      localStorage.setItem("radiate:v2:milestones", JSON.stringify(milestones.map((title, i) => ({ id: `m${i}`, intentionId: "i1", title, reachedAt: null, createdAt: now }))));
    },
    { daysAgo, actions, milestones },
  );
}

test("a Become choice grows into a 90-day intention, and Today offers one meaningful action", async ({ page }) => {
  await returningVisitor(page);

  // Become: her choice, in her words
  await page.goto("/radiate8/explore?d=joy");
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.getByLabel("Your choice, in a few words").fill("Host a dinner for my oldest friends");
  await page.getByRole("button", { name: "Save my choice" }).click();
  await page.getByRole("link", { name: "Shape it into 90 days" }).click();

  // Planting: her words and dimension are already there
  await expect(page.getByLabel("Your intention")).toHaveValue("Host a dinner for my oldest friends");
  await expect(page.getByRole("button", { name: /Joy/ })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Why does it matter to you?").fill("Because they are my people.");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Milestone 1").fill("A date on the calendar");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("This week's action 1").fill("Text Maya and Jo");
  await page.getByLabel("This week's action 2").fill("Choose a menu");
  await page.getByRole("button", { name: "Plant this intention" }).click();

  await page.waitForURL(/\/intentions\/view\?id=/);
  await expect(page.getByRole("heading", { name: "Host a dinner for my oldest friends" })).toBeVisible();
  await expect(page.getByText("Because they are my people.")).toBeVisible();
  await expect(page.getByText(/Week 1 of 13/)).toBeVisible();
  await expect(page.getByText("Beautifully planted.")).toBeVisible();
  await expect(page.getByText("A date on the calendar")).toBeVisible();

  // Today: this week's actions are offered as the one meaningful action
  await page.goto("/");
  const card = page.getByRole("region", { name: "One meaningful action" });
  await card.getByRole("button", { name: /Text Maya and Jo/ }).click();
  await expect(card.getByText(/Toward .Host a dinner/)).toBeVisible();
  await card.getByRole("button", { name: "I lived this" }).click();
  await expect(card.getByText("Lived today. Beautifully done.")).toBeVisible();

  // Living it opens a petal
  await page.reload();
  await expect(page.getByText("1 of 8 petals")).toBeVisible();

  // ...and the intention remembers it, counting only what she lived
  await page.goto("/intentions");
  await page.getByRole("link", { name: /Host a dinner/ }).click();
  await expect(page.getByRole("button", { name: /^Text Maya and Jo/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("One action lived toward this.")).toBeVisible();
  await expect(page.getByText(/of 2|missed|overdue|behind/i)).toHaveCount(0);

  // It shows on the Radiate 8 tab's pages too
  await page.goto("/dimension/joy");
  await expect(page.getByText("Growing in Joy")).toBeVisible();
});

test("one meaningful action can be in her own words, with no intention at all", async ({ page }) => {
  await returningVisitor(page);
  await page.goto("/");
  const card = page.getByRole("region", { name: "One meaningful action" });
  await expect(card.getByRole("link", { name: "Plant a 90-day intention" })).toBeVisible();
  await card.getByLabel("Today's action, in your own words").fill("Walk to the water");
  await card.getByRole("button", { name: "Choose" }).click();
  await card.getByRole("button", { name: "I lived this" }).click();
  await page.reload();
  await expect(card.getByText("Walk to the water")).toBeVisible();
  await expect(card.getByText("Lived today. Beautifully done.")).toBeVisible();
  await expect(page.getByText("1 of 8 petals")).toBeVisible();

  // She can change her mind
  await card.getByRole("button", { name: "Not yet" }).click();
  await card.getByRole("button", { name: "Choose another" }).click();
  await expect(card.getByLabel("Today's action, in your own words")).toBeVisible();
});

test("actions from earlier weeks are offered, never shown as missed", async ({ page }) => {
  await returningVisitor(page);
  await seedIntention(page, { daysAgo: 15, actions: [{ title: "Book the table", weeksAgo: 1 }] });
  await page.goto("/intentions/view?id=i1");
  await expect(page.getByText(/Week 3 of 13/)).toBeVisible();
  await expect(page.getByText("From earlier weeks")).toBeVisible();
  await page.getByRole("button", { name: 'Bring "Book the table" into this week' }).click();
  await expect(page.getByText("From earlier weeks")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Book the table", exact: true })).toHaveAttribute("aria-pressed", "false");

  // Adding a new one for this week
  await page.getByLabel("Add an action for this week").fill("Buy candles");
  await page.getByRole("button", { name: "Add action" }).click();
  await expect(page.getByRole("button", { name: "Buy candles", exact: true })).toBeVisible();
});

test("a milestone reached opens a gold-edged petal", async ({ page }) => {
  await returningVisitor(page);
  await seedIntention(page, { milestones: ["A date on the calendar"] });
  await page.goto("/intentions/view?id=i1");
  await page.getByRole("button", { name: 'I reached "A date on the calendar"' }).click();
  await expect(page.getByText(/Reached today/)).toBeVisible();
  await page.goto("/bloom");
  await expect(page.getByText("Reaching a milestone or an intention: a gold-edged petal")).toBeVisible();
  await page.goto("/");
  await expect(page.getByText("1 of 8 petals")).toBeVisible();
});

test("after 90 days she says how it went, and reached intentions are kept", async ({ page }) => {
  await returningVisitor(page);
  await seedIntention(page, { daysAgo: 91 });
  await page.goto("/intentions/view?id=i1");
  await expect(page.getByRole("heading", { name: "This intention has come full circle" })).toBeVisible();
  await page.getByRole("button", { name: "I reached this" }).click();
  await expect(page.getByText(/You reached this on/)).toBeVisible();
  await page.goto("/intentions");
  await expect(page.getByText("Reached", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Nothing planted yet")).toBeVisible();
});

test("resting and letting go are hers to choose", async ({ page }) => {
  await returningVisitor(page);
  await seedIntention(page);
  await page.goto("/intentions/view?id=i1");
  await page.getByRole("button", { name: "Let it rest" }).click();
  await expect(page.getByText("Resting for now")).toBeVisible();
  await page.getByRole("button", { name: "Pick it back up" }).click();
  await expect(page.getByText(/Week 1 of 13/)).toBeVisible();

  await page.getByRole("button", { name: "Let it go" }).click();
  await page.getByRole("button", { name: "Keep it" }).click();
  await page.getByRole("button", { name: "Let it go" }).click();
  await page.getByRole("button", { name: "Let it go" }).last().click();
  await page.waitForURL(/\/intentions$/);
  await expect(page.getByText("Nothing planted yet")).toBeVisible();
});

test("an intention that doesn't save says so and keeps her words", async ({ page }) => {
  await returningVisitor(page);
  await page.goto("/intentions/new?d=finance");
  await page.getByLabel("Your intention").fill("Build a three-month cushion");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("This week's action 1").fill("Open the savings account");

  await breakStorage(page);
  await page.getByRole("button", { name: "Plant this intention" }).click();
  expect((await alerts(page)).join(" ")).toContain("didn't save");
  await expect(page.getByLabel("This week's action 1")).toHaveValue("Open the savings account");

  await fixStorage(page);
  await page.getByRole("button", { name: "Plant this intention" }).click();
  await page.waitForURL(/\/intentions\/view\?id=/);
  await expect(page.getByRole("button", { name: "Open the savings account", exact: true })).toBeVisible();
});
