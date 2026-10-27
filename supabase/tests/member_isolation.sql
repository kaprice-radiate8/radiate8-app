-- MEMBER ISOLATION TESTS
--
-- Proves that one member can never see or change another member's data.
-- Run it against a Radiate8 database (Supabase SQL editor, or the
-- Supabase MCP `execute_sql`). It creates two throwaway members, checks
-- every rule, then removes them. Any failure stops with an error that names
-- the rule, and nothing is left behind.
do $$
declare
  a uuid := gen_random_uuid();
  b uuid := gen_random_uuid();
  n integer;
  t text;
  blocked boolean;
begin
  insert into auth.users (id, aud, role, email, instance_id)
  values (a, 'authenticated', 'authenticated', 'isolation-a-' || a || '@test.invalid', '00000000-0000-0000-0000-000000000000'),
         (b, 'authenticated', 'authenticated', 'isolation-b-' || b || '@test.invalid', '00000000-0000-0000-0000-000000000000');

  -- A profile is made for each new member.
  select count(*) into n from public.profiles where id in (a, b);
  if n <> 2 then raise exception 'FAIL: profiles were not created for new members'; end if;

  -- ---- Member A writes one of everything ----
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  set local role authenticated;

  update public.profiles set name = 'A' where id = a;
  insert into public.consents (document, version) values ('terms', '2026-10');
  insert into public.moods (date, mood_id) values ('2026-10-27', 'calm');
  insert into public.assessments (id, noticing) values ('as1', 'A noticed');
  insert into public.assessment_scores (assessment_id, dimension_id, score) values ('as1', 'joy', 8);
  insert into public.journal_entries (id, dimension_ids, movement, text) values ('j1', '{joy}', 'reflect', 'A private');
  insert into public.become_choices (id, text) values ('c1', 'A choice');
  insert into public.goals (id, title, starts_on, ends_on, become_choice_id) values ('g1', 'A goal', '2026-10-27', '2027-01-25', 'c1');
  insert into public.milestones (id, goal_id, title) values ('m1', 'g1', 'A milestone');
  insert into public.weekly_actions (id, goal_id, title, week_of) values ('w1', 'g1', 'A action', '2026-10-26');
  insert into public.daily_actions (date, text, weekly_action_id, goal_id) values ('2026-10-27', 'A today', 'w1', 'g1');
  insert into public.activity_log (activity_id) values ('rooted');
  insert into public.dedication_notes (dedication_id, text) values ('the-unhurried-ten', 'A note');
  insert into public.media (storage_path, mime_type, bytes) values (a || '/p1.jpg', 'image/jpeg', 1000);
  insert into storage.objects (bucket_id, name, owner_id) values ('member-media', a || '/p1.jpg', a::text);

  -- A's own reads work.
  select count(*) into n from public.goals;
  if n <> 1 then raise exception 'FAIL: a member cannot read her own goal'; end if;

  -- A cannot change what she agreed to.
  blocked := false;
  begin
    update public.consents set version = 'changed';
  exception when insufficient_privilege then blocked := true;
  end;
  if not blocked then raise exception 'FAIL: a consent record could be changed'; end if;

  -- A cannot put a photo in anyone else's folder.
  blocked := false;
  begin
    insert into storage.objects (bucket_id, name, owner_id) values ('member-media', b || '/sneaky.jpg', a::text);
  exception when insufficient_privilege or check_violation then blocked := true;
  end;
  if not blocked then raise exception 'FAIL: a member could write into another member''s photo folder'; end if;

  reset role;

  -- ---- Member B tries to reach A's data ----
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into n from public.profiles where id = a;
  if n <> 0 then raise exception 'FAIL: another member''s profile is readable'; end if;

  foreach t in array array[
    'consents', 'moods', 'assessments', 'assessment_scores', 'journal_entries', 'become_choices',
    'goals', 'milestones', 'weekly_actions', 'daily_actions', 'activity_log', 'dedication_notes', 'media'
  ]
  loop
    execute format('select count(*) from public.%I', t) into n;
    if n <> 0 then raise exception 'FAIL: % rows of another member are readable', t; end if;
    execute format('update public.%I set user_id = user_id where user_id = %L', t, a);
    get diagnostics n = row_count;
    if n <> 0 then raise exception 'FAIL: % rows of another member are changeable', t; end if;
    execute format('delete from public.%I where user_id = %L', t, a);
    get diagnostics n = row_count;
    if n <> 0 then raise exception 'FAIL: % rows of another member are deletable', t; end if;
  end loop;

  select count(*) into n from storage.objects where bucket_id = 'member-media';
  if n <> 0 then raise exception 'FAIL: another member''s photos are visible'; end if;

  -- B cannot write a row in A's name.
  blocked := false;
  begin
    insert into public.journal_entries (user_id, id, movement, text) values (a, 'forged', 'reflect', 'forged');
  exception when insufficient_privilege or check_violation then blocked := true;
  end;
  if not blocked then raise exception 'FAIL: a member could write a row as someone else'; end if;

  -- B cannot attach her own records to A's goal (references never cross members).
  blocked := false;
  begin
    insert into public.milestones (id, goal_id, title) values ('m-cross', 'g1', 'cross');
  exception when foreign_key_violation then blocked := true;
  end;
  if not blocked then raise exception 'FAIL: a record could point at another member''s goal'; end if;

  reset role;

  -- ---- Signed-out visitors see nothing ----
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  set local role anon;
  foreach t in array array['profiles', 'journal_entries', 'goals', 'media'] loop
    blocked := false;
    begin
      execute format('select count(*) from public.%I', t) into n;
      if n = 0 then blocked := true; end if;
    exception when insufficient_privilege then blocked := true;
    end;
    if not blocked then raise exception 'FAIL: signed-out visitors can read %', t; end if;
  end loop;
  reset role;

  -- ---- Deleting a member removes everything she owns ----
  delete from storage.objects where bucket_id = 'member-media' and name = a || '/p1.jpg';
  delete from auth.users where id in (a, b);
  foreach t in array array[
    'consents', 'moods', 'assessments', 'assessment_scores', 'journal_entries', 'become_choices',
    'goals', 'milestones', 'weekly_actions', 'daily_actions', 'activity_log', 'dedication_notes', 'media'
  ]
  loop
    execute format('select count(*) from public.%I where user_id in (%L, %L)', t, a, b) into n;
    if n <> 0 then raise exception 'FAIL: % rows remain after the member was deleted', t; end if;
  end loop;

  raise notice 'PASS: member isolation';
end
$$;

select 'PASS: member isolation' as result;
