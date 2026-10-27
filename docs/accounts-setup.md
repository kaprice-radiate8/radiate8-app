# Turning on accounts

Accounts are built but switched off on the live app until Supabase can send sign-in emails that work.
These steps are done once, in the Supabase dashboard for the **radiate8** project
(https://supabase.com/dashboard/project/tdnxxdihcfzjqabqpblt).

## 1. Tell Supabase where the app lives

**Authentication → URL Configuration**

- **Site URL:** `https://radiate8-app.vercel.app`
- **Redirect URLs** (add each):
  - `https://radiate8-app.vercel.app/auth/callback`
  - `https://*-kaprice-7041.vercel.app/auth/callback` (preview builds)
  - `http://localhost:3000/auth/callback` (a developer's computer)

Without this, the link in the sign-in email opens a page that doesn't exist.

## 2. Put the 6-digit code in the sign-in emails

**Authentication → Emails → Templates.** In both **Magic Link** and **Confirm signup**, replace the body with:

```html
<h2>Come in to Radiate8</h2>
<p>Tap to come in:</p>
<p><a href="{{ .ConfirmationURL }}">Open Radiate8</a></p>
<p>Or type this code in the app: <strong>{{ .Token }}</strong></p>
<p>If you didn't ask for this, you can ignore this email.</p>
```

The code matters when the app is on her home screen: links open in the browser, but the code works anywhere.

## 3. Send emails through Resend (before inviting testers)

Supabase's built-in email sends only a few emails an hour, which is enough for one person trying it.
Before inviting anyone else, connect Resend: **Authentication → Emails → SMTP Settings**, using a Resend API key and a
sender on a verified domain (for example `hello@radiate8.com`).

## 4. Switch accounts on

Set `ACCOUNTS_LIVE_ON_VERCEL = true` in `next.config.ts` and push. Vercel rebuilds, and the app asks for sign-in.
Anything already saved on a phone is copied into the account the first time that phone signs in.

## Checking it

- Database rules: run `supabase/tests/member_isolation.sql` in the Supabase SQL Editor. It ends with `PASS: member isolation`.
- On your phone: sign up with your email, take the Radiate 8, plant an intention, then sign in on a second device
  (or a private browser window) and check that everything is there.
