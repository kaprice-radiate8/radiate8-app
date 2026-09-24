# Rhythm (working name)

The daily practice companion to the Radiate 8 retreat, by Radiate Collective, LLC.
It's a mobile-first web app that people can install on their phone's home screen and use offline.

## Run it on your computer

1. Install [Node.js](https://nodejs.org) (version 20 or newer).
2. In this folder, run `npm install` once.
3. Run `npm run dev`, then open http://localhost:3000.
   To see the phone layout, open your browser's developer tools and choose a phone size.

To check that everything builds before sharing: `npm run build`.

## Where things live

| You want to change... | Edit this file |
| --- | --- |
| App name, tagline, colors, the 8 dimensions, mood options, reflection sections | `src/config/app.config.ts` |
| Songs, Today's Dedication, songs per feeling or dimension | `src/content/music.ts` |
| Icons available for dimensions | `src/components/Icon.tsx` |

Other folders:

```
src/
  app/                 One folder per screen (its web address)
    page.tsx           Today (/)
    wheel/             The Radiate 8 Wheel (/wheel)
    dimension/[id]/    One page per dimension (/dimension/joy ...)
    settings/          Settings (/settings)
    rhythm/ moments/ music/   Placeholders, built next
    layout.tsx         The frame around every screen (fonts, background, tab bar)
    manifest.ts        How the app installs on a phone
  components/          The building blocks each screen is made from
    today/             Pieces of the Today screen
    wheel/             The wheel and its pop-up sheet
    music/             Song cards and the shared music player
  config/              The one config file (plus a helper that turns colors into CSS)
  content/             Songs and other editable content
  lib/data/            Saving and loading (see below)
public/
  audio/               Placeholder songs
  icons/               Home-screen icons
  sw.js                Offline support
scripts/               One-off helpers that regenerate placeholder audio and icons
```

## How data is saved

Everything is saved privately in the browser on the person's own device (localStorage).
Screens never touch storage directly. They go through `store` in `src/lib/data/store.ts`.

**To move to Supabase later:** write a `supabase-store.ts` that provides the same functions
listed in `DataStore` (in `src/lib/data/types.ts`), then change the one line in `store.ts`.
No screen needs to change.

## Writing style for app copy

Warm, intimate, encouraging. Never corporate. **No em dashes.** Gentle triads where natural
("Reflect, Release, Reach", "Reflect, Bloom, Become").

## Changing icons or colors

After changing colors, regenerate the home-screen icons with `node scripts/generate-icons.mjs`.
After adding or renaming screens, update the list and `VERSION` in `public/sw.js`.
