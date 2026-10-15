# Radiate 8: feature audit and phased plan

Measured against the Version 1 build brief ("The Art of Becoming Fully Alive").
Reviewed October 2026.

## Where each Version 1 feature stands

| # | Brief feature | Status | Where it lives / what's missing |
| --- | --- | --- | --- |
| 1 | Registration and private profiles | **Partial** | A first-name profile and onboarding, saved on the device. No accounts, sign-in or cross-device sync yet. |
| 2 | Eight-dimension self-assessment, scores and written reflections | **Built** | `/radiate8/assess`: one dimension at a time, a note per dimension, "What do you notice?". Saved as 0 to 10 but shown only in words (see decision A). |
| 3 | Wheel of Life dashboard and history | **Built** | `/radiate8` wheel, every past assessment, `/radiate8/compare`. |
| 4 | Vision board (images, text, goals linked to images) | **Missing** | Needs private image storage (Phase 1). |
| 5 | Goal planner: 90-day goals, milestones, weekly actions | **Built in this change** | `/intentions`: 90-day intentions grown from Become choices, milestones, weekly actions, carry-forward. |
| 6 | Daily dashboard: Rev Up / Calm Down music activity, ten-minute dedication, one meaningful action | **Built** (action added in this change) | Today (`/`). Activities and Dedications existed. "One meaningful action" is new. |
| 7 | Journal: text, photos, gratitude, reflections | **Partial** | Reflect/Bloom/Become writing with voice dictation, per-dimension pages, Dedication notes. No free-form entries, gratitude or photos. |
| 8 | Monthly progress reviews | **Missing** | `/stories` is a placeholder. All the data it needs now exists (assessments, lived actions, milestones, petals). |
| 9 | Private secure storage, user-controlled sharing and deletion | **Partial** | Everything is private on the device, and each item can be deleted. No cloud backup, export, "delete everything", or sharing. |
| | Visual identity | **Mostly built** | Brand palette, Cormorant Garamond / DM Sans, script accent, micro mark, golden-hour background, soft animations. Missing: approved watercolor floral artwork, the master logo SVG, the licensed La Luxes Script font. |

## The journey built in this change

**Reflect → Bloom → Become → live it.** Previously, a Become choice had nowhere to go. Now:

1. Become saves her choice, then offers **"Shape it into 90 days."**
2. Planting (`/intentions/new`) takes four short steps. Her words and dimensions are already filled in. She adds why it matters, up to three milestones, and up to three actions for this week. Only the first step is required.
3. The intention page (`/intentions/view?id=`) shows the week she's in (Week 3 of 13), this week's actions, any milestones, what she has lived, and her choices: reached, rest, pick back up, another 90 days, or let it go.
4. **Today** offers *one meaningful action*: one of this week's actions, or her own words. Living it opens a petal in her bloom. Reaching a milestone or an intention opens a gold-edged petal.

How the product principles show up:

- **Only what she lived is counted.** Never "3 of 5". Nothing turns red, and nothing is overdue.
- **Unlived actions from earlier weeks** appear under "From earlier weeks" with an offer to *bring one forward*, never as missed.
- **After 90 days, nothing happens automatically.** She is asked how it went: reached, another 90 days, or let it rest.
- **The screen mentions three intentions as a comfortable number** but never limits her.

## Proposed phases

Each phase ends with a complete, tested journey.

| Phase | Scope | Depends on |
| --- | --- | --- |
| **0. Foundation** (done) | Assessment, wheel, history, Reflect/Bloom/Become, daily activities, Dedications, bloom. | |
| **1. Plan and live** (this change) | 90-day intentions, milestones, weekly actions, one meaningful action. | |
| **2. Accounts and private cloud** | Supabase sign-up/sign-in (email magic link), `supabase-store.ts` behind the existing `DataStore` contract, row-level security, a one-time import of on-device data on first sign-in. Private photo bucket. Export everything (JSON + photos) and "delete my account and everything in it". | Decision B |
| **3. Journal, fuller** | Free-form entries, gratitude, photos (Moments tab), links to dimensions and intentions. | Phase 2 (photos) |
| **4. Vision board** | Boards of images and words. Each image can link to an intention, so the board becomes the "Bloom" half of the loop. | Phase 2 (photos) |
| **5. Monthly review** | The Stories tab: her month in moments, lived actions, milestones, petals, and how her wheel moved (in words). Hers to keep or share. | Phases 2 to 4 enrich it |
| **6. Sharing** | Share a review, a board or a single moment by private link she can revoke. Later, share with a coach. | Phase 2 |
| **7. Brand pass** | Approved watercolor florals, master logo SVG, licensed script font. | Approved assets |
| Later | Coaching, community, retreats, memberships (see `data-model.md`). | |

## Decisions needed from the Radiate team

- **A. Numbers on the assessment.** The brief says "scores from 1–10". The app was deliberately built to save 0 to 10 but show only words ("Growing warm"), and a test protects that. Options: keep words only; show the number quietly beside the words; or let her turn numbers on in Profile. Either way the scale should probably move to 1–10 to match the brief.
- **B. Cloud backend.** The data layer is ready for Supabase (one file to add, one line to switch). Creating the project, choosing a region, and setting billing and email sender are yours to approve.
- **C. Naming.** The brief says "Radiate8". The brand guide and app currently say "Radiate 8", and the tagline is "Come back to yourself." with "The art of becoming fully alive." as the promise. Which leads on the opening screen?
- **D. Navigation.** The four tabs (Today, Radiate 8, Moments, Stories) still fit. Intentions live inside the Radiate 8 tab and on Today. When the journal and vision board arrive, a tab may be worth reconsidering.
- **E. Brand assets.** Please share the master logo SVG, watercolor floral artwork, and the La Luxes Script web license. The app will not invent replacements.
