/**
 * Voice to text on the writing pages. The test browser has no microphone,
 * so a stand-in speech recognizer plays the part: the test "speaks" by
 * calling window.__say(...).
 */
import { expect, test, type Page } from "@playwright/test";
import { returningVisitor } from "./helpers";

async function fakeSpeech(page: Page, { allowed = true } = {}) {
  await page.addInitScript((allowed) => {
    class FakeRecognition {
      lang = "";
      continuous = false;
      interimResults = false;
      onresult: ((e: unknown) => void) | null = null;
      onerror: ((e: unknown) => void) | null = null;
      onend: (() => void) | null = null;
      results: { 0: { transcript: string }; isFinal: boolean }[] = [];
      start() {
        if (!allowed) {
          setTimeout(() => {
            this.onerror?.({ error: "not-allowed" });
            this.onend?.();
          });
          return;
        }
        const w = window as unknown as { __say: (words: string, final?: boolean) => void };
        w.__say = (words, final = true) => {
          const last = this.results.at(-1);
          if (last && !last.isFinal) this.results.pop();
          this.results.push({ 0: { transcript: words }, isFinal: final });
          this.onresult?.({ resultIndex: 0, results: this.results });
        };
      }
      stop() {
        this.onend?.();
      }
      abort() {
        this.onend?.();
      }
    }
    const w = window as unknown as Record<string, unknown>;
    w.SpeechRecognition = FakeRecognition;
    w.webkitSpeechRecognition = FakeRecognition;
  }, allowed);
}

test("she can speak her reflection instead of typing it", async ({ page }) => {
  await fakeSpeech(page);
  await returningVisitor(page);
  await page.goto("/radiate8/explore?d=joy");
  const writing = page.getByLabel("Where am I now?");
  await writing.fill("Today felt full.");

  await page.getByRole("button", { name: "Speak instead of typing" }).click();
  await expect(page.getByText("Listening")).toBeVisible();
  // Words appear while she is still speaking, then settle when she pauses.
  await page.evaluate(() => (window as unknown as { __say: (w: string, f?: boolean) => void }).__say("i danced in the", false));
  await expect(writing).toHaveValue("Today felt full. I danced in the");
  await page.evaluate(() => (window as unknown as { __say: (w: string) => void }).__say("i danced in the kitchen"));
  await page.evaluate(() => (window as unknown as { __say: (w: string) => void }).__say("and laughed"));
  await expect(writing).toHaveValue("Today felt full. I danced in the kitchen and laughed");

  await page.getByRole("button", { name: "Stop speaking" }).click();
  await expect(page.getByText("Listening")).toHaveCount(0);
  await page.getByRole("button", { name: /Save and continue to Bloom/ }).click();
  const pages = await page.evaluate(() => JSON.parse(localStorage.getItem("radiate:v2:journal") ?? "[]"));
  expect(pages[0].text).toBe("Today felt full. I danced in the kitchen and laughed");
});

test("if the microphone is blocked, she's told plainly and can keep typing", async ({ page }) => {
  await fakeSpeech(page, { allowed: false });
  await returningVisitor(page);
  await page.goto("/dedications/the-room-around-you");
  await page.getByRole("button", { name: "Write, if you like" }).click();
  await page.getByRole("button", { name: "Speak instead of typing" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "microphone is turned off" })).toBeVisible();
  await page.getByLabel(/One small change/).fill("Still writing by hand");
  await expect(page.getByLabel(/One small change/)).toHaveValue("Still writing by hand");
});

test("browsers without voice recognition (like Firefox) show no microphone", async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as Record<string, unknown>;
    delete w.webkitSpeechRecognition;
    delete w.SpeechRecognition;
  });
  await returningVisitor(page);
  await page.goto("/radiate8/explore?d=joy");
  await expect(page.getByLabel("Where am I now?")).toBeVisible();
  await expect(page.getByRole("button", { name: "Speak instead of typing" })).toHaveCount(0);
});
