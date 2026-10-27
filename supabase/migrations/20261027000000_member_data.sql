-- RADIATE8: MEMBER DATA (Phase 1)
--
-- Every table here holds one member's private data. The rules:
--   * Every row carries user_id, and row-level security allows a member to
--     see and change only her own rows. Nobody else (not even other members'
--     sessions) can read them. Staff access goes through the dashboard only.
--   * Primary keys are (user_id, id), and references between tables include
--     user_id, so a record can only ever point at the same member's records.
--   * ids are text so records saved on a device before accounts existed keep
--     their ids when imported (and importing twice never duplicates).
--   * Deleting a member (auth.users) deletes everything she owns.
--
-- Mirrors the DataStore contract in src/lib/data/types.ts.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- The eight dimensions, by id (src/config/app.config.ts). Ids never change.
create or replace function public.is_dimension_list(ids text[])
returns boolean
language sql
immutable
set search_path = ''
as $$
  select ids <@ array['health','relationships','career','finance','environment','growth','joy','spirit']::text[]
$$;

-- ---------------------------------------------------------------------------
-- Profile and consent
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  onboarded_at timestamptz,
  -- What her bloom looked like when she last saw it (so new petals grow in once).
  bloom_seen_petals integer not null default 0,
  bloom_seen_bouquets integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A profile is made the moment an account is created.
create or replace function public.handle_new_member()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_member();

-- Which terms and privacy policy she accepted, and when.
create table public.consents (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  document text not null check (document in ('terms', 'privacy')),
  version text not null,
  accepted_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- ---------------------------------------------------------------------------
-- Daily check-in
-- ---------------------------------------------------------------------------

create table public.moods (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date date not null,
  mood_id text not null,
  at timestamptz not null default now(),
  primary key (user_id, date)
);

-- ---------------------------------------------------------------------------
-- The eight-dimension assessment (never edited after saving, so history stays true)
-- ---------------------------------------------------------------------------

create table public.assessments (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  taken_at timestamptz not null default now(),
  noticing text not null default '',
  primary key (user_id, id)
);

create table public.assessment_scores (
  user_id uuid not null default auth.uid(),
  assessment_id text not null,
  dimension_id text not null check (public.is_dimension_list(array[dimension_id])),
  -- Saved 0 to 10 (decision Q1 may move this to 1 to 10).
  score smallint not null check (score between 0 and 10),
  note text,
  primary key (user_id, assessment_id, dimension_id),
  foreign key (user_id, assessment_id) references public.assessments (user_id, id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- Reflect, Bloom, Become
-- ---------------------------------------------------------------------------

create table public.journal_entries (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  dimension_ids text[] not null default '{}' check (public.is_dimension_list(dimension_ids)),
  movement text not null check (movement in ('reflect', 'bloom', 'become')),
  prompt text not null default '',
  text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table public.become_choices (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  dimension_ids text[] not null default '{}' check (public.is_dimension_list(dimension_ids)),
  text text not null,
  lived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- ---------------------------------------------------------------------------
-- 90-day goals ("intentions" in the app), milestones and actions
-- ---------------------------------------------------------------------------

create table public.goals (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  title text not null,
  vision text not null default '',
  dimension_ids text[] not null default '{}' check (public.is_dimension_list(dimension_ids)),
  become_choice_id text,
  starts_on date not null,
  ends_on date not null,
  status text not null default 'growing' check (status in ('growing', 'resting', 'reached')),
  reached_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id),
  foreign key (user_id, become_choice_id) references public.become_choices (user_id, id) on delete set null (become_choice_id)
);

create table public.milestones (
  user_id uuid not null default auth.uid(),
  id text not null default gen_random_uuid()::text,
  goal_id text not null,
  title text not null,
  reached_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (user_id, id),
  foreign key (user_id, goal_id) references public.goals (user_id, id) on delete cascade
);

create table public.weekly_actions (
  user_id uuid not null default auth.uid(),
  id text not null default gen_random_uuid()::text,
  goal_id text not null,
  title text not null,
  -- The Monday that starts its week.
  week_of date not null,
  lived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id),
  foreign key (user_id, goal_id) references public.goals (user_id, id) on delete cascade
);

-- Today's one meaningful action (one per day). It stays in her history even
-- when the goal or weekly action it came from is let go.
create table public.daily_actions (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date date not null,
  text text not null,
  weekly_action_id text,
  goal_id text,
  lived_at timestamptz,
  at timestamptz not null default now(),
  primary key (user_id, date),
  foreign key (user_id, weekly_action_id) references public.weekly_actions (user_id, id) on delete set null (weekly_action_id),
  foreign key (user_id, goal_id) references public.goals (user_id, id) on delete set null (goal_id)
);

-- ---------------------------------------------------------------------------
-- Daily Activities and Dedications (the content itself lives in the app for now)
-- ---------------------------------------------------------------------------

create table public.activity_log (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  activity_id text not null,
  felt text,
  at timestamptz not null default now(),
  primary key (user_id, id)
);

create table public.dedication_notes (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  dedication_id text not null,
  text text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- ---------------------------------------------------------------------------
-- Photos (vision boards, journal and completions arrive in Phase 2)
-- ---------------------------------------------------------------------------

create table public.media (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  -- Always "<user id>/<file name>" inside the private member-media bucket.
  storage_path text not null,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  bytes integer not null check (bytes > 0 and bytes <= 10485760),
  width integer,
  height integer,
  created_at timestamptz not null default now(),
  primary key (user_id, id),
  check (split_part(storage_path, '/', 1) = user_id::text)
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('member-media', 'member-media', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Access: each member sees and changes only her own rows
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
create policy "Members read their own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "Members update their own profile" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

do $$
declare
  t text;
begin
  foreach t in array array[
    'consents', 'moods', 'assessments', 'assessment_scores', 'journal_entries', 'become_choices',
    'goals', 'milestones', 'weekly_actions', 'daily_actions', 'activity_log', 'dedication_notes', 'media'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "Members use only their own rows" on public.%I for all to authenticated '
      'using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))',
      t
    );
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end
$$;

-- Consent records are kept as written: added, never changed.
revoke update on public.consents from authenticated;

revoke all on public.profiles from anon;
grant select, update on public.profiles to authenticated;
revoke execute on function public.handle_new_member() from public, anon, authenticated;

-- Photos: a member reads and writes only inside her own folder.
create policy "Members read their own photos" on storage.objects
  for select to authenticated
  using (bucket_id = 'member-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Members add their own photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'member-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Members remove their own photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'member-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
