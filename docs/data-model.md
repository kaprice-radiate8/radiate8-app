# Data model: today on the device, tomorrow in Supabase

Screens only talk to `store` (`src/lib/data/store.ts`), whose functions are listed in `DataStore` (`src/lib/data/types.ts`).
Today that is `local-store.ts` (the browser's storage). Phase 2 adds `supabase-store.ts` with the same functions.

Below is the planned Postgres shape. It is a plan only: nothing here has been created yet.

## Principles

- **Every personal row has `user_id`** and row-level security: `user_id = auth.uid()`. No exceptions.
- **Photos live in a private storage bucket** under `<user_id>/...`, served only through short-lived signed links.
- **Sharing is explicit, revocable, and narrow.** A `shares` row grants one viewer (or one private link) access to one thing, and it can be revoked at any time. Nothing is shared by default.
- **Deletion is real.** Deleting the account removes every row and every photo (cascades plus a storage cleanup job).
- **Coaching, community, retreats and memberships hang off the same user.** They never change the personal tables.

## Personal tables (one row per thing she saves)

| Table | Maps to (types.ts) | Notes |
| --- | --- | --- |
| `profiles` | `Profile` | `id = auth.users.id`, name, onboarded_at, timezone |
| `moods` | `MoodEntry` | unique (user_id, date) |
| `assessments` | `Assessment` | taken_at, noticing |
| `assessment_places` | `Assessment.places/notes` | (assessment_id, dimension_id, place 0–10, note) |
| `journal_entries` | `JournalEntry` | dimension_ids text[], movement, prompt, text. Later adds kind: reflection / gratitude / free |
| `journal_photos` | (Phase 3) | entry_id, storage_path |
| `become_choices` | `BecomeChoice` | lived_at |
| `intentions` | `Intention` | starts_on, ends_on, status (growing / resting / reached), reached_at, become_choice_id |
| `milestones` | `Milestone` | intention_id on delete cascade, reached_at |
| `weekly_actions` | `WeeklyAction` | intention_id on delete cascade, week_of, lived_at |
| `daily_actions` | `DailyAction` | unique (user_id, date), weekly_action_id on delete set null |
| `activity_log`, `dedication_notes` | as named | |
| `vision_boards`, `vision_items` | (Phase 4) | item: kind (image / words), storage_path, text, position, `intention_id` (links a goal to an image) |
| `monthly_reviews` | (Phase 5) | user_id, month, her own closing words. Figures are computed, not stored. |

## Sharing and the future

| Table | Purpose |
| --- | --- |
| `shares` | owner_id, subject_type (review / board / moment / assessment), subject_id, grantee_id or link_token, scope, expires_at, revoked_at |
| `coach_clients` | coach_id, client_id, status, started_at. A coach sees **only** what a client shares through `shares`. |
| `communities`, `community_members`, `posts` | Opt-in circles. Never auto-filled from private data. |
| `retreats`, `retreat_enrollments` | Links the app to the in-person Radiate 8 retreat (cohort content, arrival assessment). |
| `plans`, `memberships` | Subscription tier, status, provider ids (e.g. Stripe), current_period_end. Feature access is checked from here. |

Content (`daily_activities`, `dedications`) is already specified in `content-model.md`.
