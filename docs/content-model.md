# Content model: Daily Activities and Dedications

Daily Activities and Dedications are **content**, not code. This file explains how they're organized today, and how they move into an admin system so new items can be added without a developer.

## Today

- The records live in `src/content/activities.ts` and `src/content/dedications.ts`.
- Their shapes are defined in `src/lib/content/types.ts`.
- Screens never read those files directly. They ask `content` (in `src/lib/content/source.ts`), which only returns **live** items: `active` is true and `publishOn` has arrived.
- The two path names ("Rev Up" and "Calm / Reset") are working names. They live in `feelingPaths` in `src/config/app.config.ts` and can be renamed there. Saved data uses the ids `energize` and `settle`, which stay the same.

## Later: the admin system

1. Create the two tables below (in Supabase, or a headless CMS with the same fields).
2. Write a `ContentSource` that reads from them, and switch the last line of `source.ts` to it.
3. Editors add, schedule, feature or retire items from the admin screen. No code changes.

Pages are built ahead of time today. Once content comes from the admin system, they'll refresh on a schedule (or when an editor publishes), so new items appear without a redeploy.

### `daily_activities`

| Field | Type | Brief |
| --- | --- | --- |
| id | text, unique | |
| title | text | Activity Name |
| path | `energize` or `settle` | State / category |
| purpose | text | Purpose |
| practice | text | Movement / Practice |
| duration_minutes | number | Duration |
| guidance | list of text | Instructions |
| guidance_audio_url | text, optional | Audio guidance |
| song_title, song_artist | text | Song |
| song_links | spotify / apple music / youtube music URLs, optional | Music link / integration |
| song_audio_url | text, optional | Only for music Radiate has the rights to |
| notice | text | Reflection / Notice prompt |
| dimension_tags | list of dimension ids | Radiate dimension tags |
| artwork_url, artwork_colors | text / two colors | Image / artwork |
| active | yes / no | Active / inactive status |
| publish_on | date | Publish date |

### `dedications`

| Field | Type | Brief |
| --- | --- | --- |
| id | text, unique | |
| title | text | Title |
| description | text | Short description |
| duration_minutes | number | Estimated duration |
| body | list of paragraphs | Written content |
| audio_url | text, optional | Audio |
| video_url | text, optional | Video |
| practice_title, practice_steps | text / list of text, optional | Practice / activity |
| reflection | text | Reflection prompt |
| journal_prompt | text, optional | Optional journal prompt |
| author | text | Author / expert |
| dimension_tags | list of dimension ids | Radiate dimension tags |
| theme_tags | list of text | Theme tags |
| artwork_url, artwork_colors | text / two colors | Image / watercolor artwork |
| featured | yes / no | Featured status |
| active | yes / no | |
| publish_on | date | Publish date |

## Personalization

- **Daily Activity:** her two paths each offer one activity per day, rotating through what's live. She can always pick another.
- **Today's Dedication:** a featured Dedication comes first. Otherwise, every other day she gets one tagged to a dimension she has been focusing on (her Become choices and reflections from the last 30 days). On the other days she gets something to discover, so it never feels like homework.
- **What she does is saved on her device:** finished activities, with her optional one-word answer ("Steadier"), and anything she chose to write in a Dedication. This is for her own history and future Progress Stories. It is never used for streaks.

## Music

- Commercial songs are never stored in the app. Each song opens in her own music service: Spotify, Apple Music or YouTube Music.
- The songs chosen so far are suggestions waiting for approval.
- Original or licensed Radiate music can play inside the app through `song_audio_url`.
