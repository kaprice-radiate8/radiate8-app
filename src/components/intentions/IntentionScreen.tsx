"use client";

/**
 * ONE 90-DAY INTENTION (web address: /intentions/view?id=...)
 *
 * Her intention and why it matters, this week's small actions, the
 * milestones along the way, and everything she has lived toward it.
 * Only what she lived is counted. Actions from earlier weeks are never
 * "missed": if one still calls to her, she can bring it into this week.
 * She decides how it ends: reached, resting, another 90 days, or let go.
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronLeft, Plus, X } from "lucide-react";
import { store, useStoreData, type Intention, type Milestone, type VisionItem, type WeeklyAction } from "@/lib/data";
import { dayKey, dayLabel, longDate, shortDay, weekOf } from "@/lib/dates";
import { WEEKS_IN_INTENTION, cameFullCircle, lived, stillWaiting, thisWeek, weekNumber } from "@/lib/intentions";
import { AutoGrowTextarea } from "../journal/AutoGrowTextarea";
import { DimensionChips } from "../DimensionChips";
import { SaveNotice } from "../SaveNotice";

const quietButton = "rounded-full border border-line bg-linen/70 px-4 py-2 text-sm text-plum transition-colors hover:border-taupe";
const TRY_AGAIN = "That didn't save. Please try again in a moment.";

export function IntentionScreen() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const justPlanted = params.get("planted") === "1";
  const { data, ready } = useStoreData(async (s) => {
    const [all, milestones, actions, visionItems] = await Promise.all([s.listIntentions(), s.listMilestones(id), s.listWeeklyActions(id), s.listVisionItems()]);
    return { intention: all.find((i) => i.id === id), milestones, actions, vision: visionItems.filter((v) => v.intentionId === id) };
  });
  const [problem, setProblem] = useState<string | null>(null);

  if (!ready || !data) return null;
  const { intention, milestones, actions, vision } = data;

  if (!intention) {
    return (
      <div>
        <Back />
        <h1 className="mt-4 font-serif text-4xl text-plum">This intention isn&rsquo;t here</h1>
        <p className="mt-3 text-plum-soft">It may have been let go. Everything you&rsquo;re growing now is in your intentions.</p>
      </div>
    );
  }

  /** Run a save, and say so plainly if it didn't work. */
  const attempt = (save: () => Promise<unknown>, message = TRY_AGAIN) =>
    save().then(
      () => setProblem(null),
      () => setProblem(message),
    );

  const growing = intention.status === "growing";
  const livedActions = lived(actions);

  return (
    <div className="space-y-8">
      <div>
        <Back />
        <Header intention={intention} attempt={attempt} />
        {vision.length > 0 && <FromYourBoard items={vision} />}
        {justPlanted && growing && (
          <p className="rise mt-4 text-center font-script text-4xl text-plum">Beautifully planted.</p>
        )}
      </div>

      <SaveNotice message={problem} />

      {cameFullCircle(intention) && <FullCircle intention={intention} attempt={attempt} />}

      {intention.status === "reached" && (
        <section className="card border border-gold/60 p-5 text-center">
          <p className="label">Reached</p>
          <p className="mt-2 font-serif text-2xl text-plum">You reached this on {longDate(intention.reachedAt!)}</p>
          <p className="mt-2 text-sm text-plum-soft">A gold-edged petal opened in your bloom.</p>
        </section>
      )}

      {growing && <ThisWeek intention={intention} actions={actions} attempt={attempt} />}

      <Milestones intention={intention} milestones={milestones} attempt={attempt} />

      {livedActions.length > 0 && (
        <section>
          <p className="label">What you&rsquo;ve lived</p>
          <p className="mt-2 font-serif text-xl text-plum italic">
            {livedActions.length === 1 ? "One action lived toward this." : `${livedActions.length} actions lived toward this.`}
          </p>
          <ul className="card mt-3 divide-y divide-line/70 px-5 py-1">
            {livedActions.map((a) => (
              <li key={a.id} className="flex items-baseline justify-between gap-3 py-3">
                <span className="font-serif text-lg leading-snug text-plum">{a.title}</span>
                <span className="shrink-0 text-xs text-plum-soft">{dayLabel(a.livedAt!)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Choices intention={intention} attempt={attempt} />
    </div>
  );
}

/** The images (and words) from her vision board that this intention grows toward. */
function FromYourBoard({ items }: { items: VisionItem[] }) {
  return (
    <ul className="mt-4 flex gap-3 overflow-x-auto pb-1" aria-label="From your vision board">
      {items.map((v) => (
        <li key={v.id} className="shrink-0">
          <Link href={`/vision/item?id=${v.id}`} aria-label={v.words || "An image from your vision board"} className="block">
            {v.kind === "image" && v.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- private, short-lived links; not suited to the image optimizer
              <img src={v.imageUrl} alt="" className="h-28 w-auto rounded-2xl object-cover shadow-[0_10px_24px_-16px_rgb(75_48_74/0.5)]" />
            ) : (
              <span className="flex h-28 w-36 items-center justify-center rounded-2xl bg-blush/60 p-3 text-center font-serif text-base leading-snug text-plum italic">{v.words}</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

type Attempt = (save: () => Promise<unknown>, message?: string) => Promise<void>;

function Back() {
  return (
    <Link href="/intentions" className="-ml-1 inline-flex items-center gap-1 py-2 text-sm text-plum-soft">
      <ChevronLeft size={18} strokeWidth={1.4} /> Your intentions
    </Link>
  );
}

/** Her intention in her words, where it lives, and where she is in its 90 days. Tap Edit to change the words. */
function Header({ intention, attempt }: { intention: Intention; attempt: Attempt }) {
  const [editing, setEditing] = useState<{ title: string; vision: string } | null>(null);

  const when =
    intention.status === "growing"
      ? cameFullCircle(intention)
        ? `Planted ${shortDay(intention.startsOn)}`
        : `Week ${weekNumber(intention)} of ${WEEKS_IN_INTENTION} · planted ${shortDay(intention.startsOn)}`
      : intention.status === "resting"
        ? "Resting for now"
        : `Planted ${shortDay(intention.startsOn)}`;

  async function save() {
    if (!editing || !editing.title.trim()) return;
    const title = editing.title.trim();
    const vision = editing.vision.trim();
    await attempt(async () => {
      await store.updateIntention(intention.id, { title, vision });
      setEditing(null);
    }, "Your changes didn't save. They're still here, so please try again in a moment.");
  }

  return (
    <header className="mt-4 overflow-hidden rounded-[2rem] bg-linen/80 p-6 shadow-[inset_0_0_0_1px_rgb(193_141_74/0.25)]">
      <DimensionChips ids={intention.dimensionIds} />
      <p className="label mt-4">{when}</p>
      {editing ? (
        <div className="mt-3 space-y-4">
          <input
            aria-label="Your intention"
            value={editing.title}
            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            className="w-full border-b border-line bg-transparent pb-2 font-serif text-3xl text-plum outline-none focus:border-plum"
          />
          <div className="overflow-hidden rounded-2xl">
            <AutoGrowTextarea
              aria-label="Why it matters to you"
              value={editing.vision}
              onChange={(e) => setEditing({ ...editing, vision: e.target.value })}
              minRows={3}
              placeholder="It matters because..."
              className="px-4 pt-2 pb-4 pl-10 font-serif text-lg leading-8 text-plum outline-none placeholder:text-plum-soft/40"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(null)} className="rounded-full px-4 py-2 text-sm text-plum-soft">
              Cancel
            </button>
            <button type="button" onClick={save} disabled={!editing.title.trim()} className="rounded-full bg-plum px-5 py-2 text-sm font-medium text-ivory disabled:opacity-40">
              Save changes
            </button>
          </div>
        </div>
      ) : (
        <>
          <h1 className="mt-2 font-serif text-4xl leading-tight text-plum">{intention.title}</h1>
          {intention.vision && <p className="mt-3 font-serif text-xl leading-snug whitespace-pre-wrap text-plum-soft italic">{intention.vision}</p>}
          <button type="button" onClick={() => setEditing({ title: intention.title, vision: intention.vision })} className="mt-3 -ml-1 px-1 py-1 text-sm text-plum-soft">
            Edit
          </button>
        </>
      )}
    </header>
  );
}

/** Its 90 days are complete: she says how it went. Nothing happens until she does. */
function FullCircle({ intention, attempt }: { intention: Intention; attempt: Attempt }) {
  return (
    <section className="card p-5 text-center">
      <p className="label">Ninety days</p>
      <h2 className="mt-2 font-serif text-3xl text-plum">This intention has come full circle</h2>
      <p className="mt-2 text-plum-soft">How does it feel now? There is no wrong answer.</p>
      <div className="mt-5 flex flex-col gap-2">
        <button type="button" onClick={() => attempt(() => store.updateIntention(intention.id, { status: "reached" }))} className="rounded-full bg-plum px-5 py-3 text-sm font-medium text-ivory">
          I reached this
        </button>
        <button type="button" onClick={() => attempt(() => store.renewIntention(intention.id, dayKey()))} className={quietButton}>
          Begin another 90 days
        </button>
        <button type="button" onClick={() => attempt(() => store.updateIntention(intention.id, { status: "resting" }))} className="py-2 text-sm text-plum-soft">
          Let it rest
        </button>
      </div>
    </section>
  );
}

/** This week's small actions, a way to add one, and earlier ones she may bring forward. */
function ThisWeek({ intention, actions, attempt }: { intention: Intention; actions: WeeklyAction[]; attempt: Attempt }) {
  const today = dayKey();
  const week = thisWeek(actions, today);
  const waiting = stillWaiting(actions, today).slice(-5);
  const [adding, setAdding] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const title = adding.trim();
    if (!title) return;
    await attempt(async () => {
      await store.addWeeklyAction({ intentionId: intention.id, title, weekOf: weekOf(today) });
      setAdding("");
    }, "That action didn't save. It's still here, so please try again in a moment.");
  }

  return (
    <section>
      <p className="label">This week</p>
      <p className="mt-1 text-sm text-plum-soft">Small things you&rsquo;d like to do. Tap one when you&rsquo;ve lived it.</p>
      {week.length > 0 && (
        <ul className="mt-3 space-y-2">
          {week.map((a) => (
            <ActionRow key={a.id} action={a} attempt={attempt} />
          ))}
        </ul>
      )}
      <form onSubmit={add} className="mt-3 flex items-center gap-2">
        <input
          aria-label="Add an action for this week"
          value={adding}
          onChange={(e) => setAdding(e.target.value)}
          placeholder={week.length ? "Add another..." : "This week, I will..."}
          className="min-w-0 flex-1 border-b border-line bg-transparent py-2 font-serif text-lg text-plum outline-none placeholder:text-plum-soft/40 focus:border-plum"
        />
        <button type="submit" disabled={!adding.trim()} aria-label="Add action" className="rounded-full bg-plum p-2.5 text-ivory transition-opacity disabled:opacity-30">
          <Plus size={18} strokeWidth={1.6} />
        </button>
      </form>

      {waiting.length > 0 && (
        <div className="mt-6">
          <p className="label">From earlier weeks</p>
          <p className="mt-1 text-sm text-plum-soft">If one still calls to you, bring it into this week.</p>
          <ul className="mt-3 space-y-2">
            {waiting.map((a) => (
              <li key={a.id} className="flex items-center gap-3 rounded-2xl border border-line/80 bg-linen/50 px-4 py-3">
                <span className="min-w-0 flex-1 font-serif text-lg leading-snug text-plum-soft">{a.title}</span>
                <button
                  type="button"
                  onClick={() => attempt(() => store.moveWeeklyAction(a.id, weekOf(today)))}
                  aria-label={`Bring "${a.title}" into this week`}
                  className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs text-plum"
                >
                  Bring forward
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/** One action: tap to say she lived it (a gold circle fills). Remove it with the small cross. */
function ActionRow({ action, attempt }: { action: WeeklyAction; attempt: Attempt }) {
  const done = Boolean(action.livedAt);
  return (
    <li className="card flex items-center gap-3 py-1 pr-2 pl-4">
      <button
        type="button"
        aria-pressed={done}
        onClick={() => attempt(() => store.setWeeklyActionLived(action.id, !done))}
        className="flex min-w-0 flex-1 items-center gap-3 py-3 text-left"
      >
        <span
          aria-hidden="true"
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ${done ? "border-gold bg-gold text-ivory" : "border-taupe"}`}
        >
          {done && <Check size={15} strokeWidth={2} />}
        </span>
        <span className="min-w-0">
          <span className="block font-serif text-lg leading-snug text-plum">{action.title}</span>
          {done && <span className="block text-xs text-plum-soft">Lived {dayLabel(action.livedAt!).toLowerCase() === "today" ? "today" : `on ${dayLabel(action.livedAt!)}`}</span>}
        </span>
      </button>
      <button type="button" onClick={() => attempt(() => store.deleteWeeklyAction(action.id))} aria-label={`Remove "${action.title}"`} className="shrink-0 rounded-full p-2 text-plum-soft/70">
        <X size={16} strokeWidth={1.4} />
      </button>
    </li>
  );
}

function Milestones({ intention, milestones, attempt }: { intention: Intention; milestones: Milestone[]; attempt: Attempt }) {
  const [adding, setAdding] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const title = adding.trim();
    if (!title) return;
    await attempt(async () => {
      await store.addMilestone(intention.id, title);
      setAdding("");
    }, "That milestone didn't save. It's still here, so please try again in a moment.");
  }

  return (
    <section>
      <p className="label">Milestones</p>
      <p className="mt-1 text-sm text-plum-soft">Signs you&rsquo;re on your way. Each one you reach opens a gold-edged petal.</p>
      {milestones.length > 0 && (
        <ol className="mt-3 space-y-2">
          {milestones.map((m) => {
            const reached = Boolean(m.reachedAt);
            return (
              <li key={m.id} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors duration-500 ${reached ? "border-gold/70 bg-linen" : "border-line/80 bg-linen/60"}`}>
                <span className="min-w-0 flex-1">
                  <span className="block font-serif text-lg leading-snug text-plum">{m.title}</span>
                  {reached && <span className="block text-xs text-plum-soft">Reached {dayLabel(m.reachedAt!).toLowerCase() === "today" ? "today" : `on ${dayLabel(m.reachedAt!)}`}</span>}
                </span>
                {reached ? (
                  <button type="button" onClick={() => attempt(() => store.setMilestoneReached(m.id, false))} className="shrink-0 px-2 py-1.5 text-xs text-plum-soft">
                    Not yet
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => attempt(() => store.setMilestoneReached(m.id, true))}
                    aria-label={`I reached "${m.title}"`}
                    className="shrink-0 rounded-full border border-gold px-3 py-1.5 text-xs text-plum"
                  >
                    I reached this
                  </button>
                )}
                <button type="button" onClick={() => attempt(() => store.deleteMilestone(m.id))} aria-label={`Remove milestone "${m.title}"`} className="shrink-0 rounded-full p-1.5 text-plum-soft/70">
                  <X size={15} strokeWidth={1.4} />
                </button>
              </li>
            );
          })}
        </ol>
      )}
      <form onSubmit={add} className="mt-3 flex items-center gap-2">
        <input
          aria-label="Add a milestone"
          value={adding}
          onChange={(e) => setAdding(e.target.value)}
          placeholder="Add a milestone..."
          className="min-w-0 flex-1 border-b border-line bg-transparent py-2 font-serif text-lg text-plum outline-none placeholder:text-plum-soft/40 focus:border-plum"
        />
        <button type="submit" disabled={!adding.trim()} aria-label="Add milestone" className="rounded-full border border-plum p-2.5 text-plum transition-opacity disabled:opacity-30">
          <Plus size={18} strokeWidth={1.6} />
        </button>
      </form>
    </section>
  );
}

/** How she'd like to hold this intention now. Letting it go asks once before removing it. */
function Choices({ intention, attempt }: { intention: Intention; attempt: Attempt }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  async function letGo() {
    try {
      await store.deleteIntention(intention.id);
      router.replace("/intentions");
    } catch {
      setConfirming(false);
      await attempt(() => Promise.reject(), "This intention couldn't be let go just now. Please try again in a moment.");
    }
  }

  if (confirming) {
    return (
      <section className="card p-5">
        <p className="font-serif text-xl text-plum">Let this intention go?</p>
        <p className="mt-1 text-sm text-plum-soft">Its milestones and actions go with it. What you wrote on Today stays in your history.</p>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={() => setConfirming(false)} className="rounded-full px-4 py-2 text-sm text-plum">
            Keep it
          </button>
          <button type="button" onClick={letGo} className="rounded-full bg-plum px-5 py-2 text-sm text-ivory">
            Let it go
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-wrap items-center justify-center gap-2 border-t border-line/70 pt-6">
      {intention.status === "growing" && !cameFullCircle(intention) && (
        <>
          <button type="button" onClick={() => attempt(() => store.updateIntention(intention.id, { status: "reached" }))} className="rounded-full border border-gold px-4 py-2 text-sm text-plum">
            I reached this
          </button>
          <button type="button" onClick={() => attempt(() => store.updateIntention(intention.id, { status: "resting" }))} className={quietButton}>
            Let it rest
          </button>
        </>
      )}
      {intention.status !== "growing" && (
        <button
          type="button"
          onClick={() => attempt(() => (intention.status === "resting" && dayKey() < intention.endsOn ? store.updateIntention(intention.id, { status: "growing" }) : store.renewIntention(intention.id, dayKey())))}
          className={quietButton}
        >
          {intention.status === "resting" && dayKey() < intention.endsOn ? "Pick it back up" : "Begin another 90 days"}
        </button>
      )}
      <button type="button" onClick={() => setConfirming(true)} className="rounded-full px-4 py-2 text-sm text-plum-soft">
        Let it go
      </button>
    </section>
  );
}
