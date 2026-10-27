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
  insert into public.media (id, storage_path, mime_type, bytes) values ('p1', a || '/p1.jpg', 'image/jpeg', 1000);
  insert into public.vision_items (id, kind, media_id, goal_id) values ('v1', 'image', 'p1', 'g1');
  insert into public.vision_items (id, kind, words) values ('v2', 'words', 'A vision');
  insert into storage.objects (bucket_id, name, owner_id) values ('member-media', a || '/p1.jpg', a::text);

  -- A's own reads work.
  select count(*) into n from public.goals;
  if n <> 1 then raise exception 'FAIL: a member cannot read her own goal'; end if;

  -- Saving an assessment writes it and its scores together.
  perform public.save_assessment('Noticed', '[{"dimension_id":"joy","score":7,"note":"dancing"},{"dimension_id":"spirit","score":5,"note":""}]'::jsonb);
  select count(*) into n from public.assessment_scores s join public.assessments x on x.id = s.assessment_id and x.user_id = s.user_id where x.noticing = 'Noticed';
  if n <> 2 then raise exception 'FAIL: save_assessment did not save every score'; end if;

  -- Planting a goal writes it, its milestones (in order) and its first actions together.
  perform public.plant_goal(
    '{"title":"Planted","vision":"why","dimension_ids":["joy"],"starts_on":"2026-10-27","ends_on":"2027-01-25"}'::jsonb,
    array['first', 'second', 'third'],
    '[{"title":"act one","week_of":"2026-10-26"},{"title":"act two","week_of":"2026-10-26"}]'::jsonb
  );
  select count(*) into n from public.milestones m join public.goals g on g.id = m.goal_id and g.user_id = m.user_id where g.title = 'Planted';
  if n <> 3 then raise exception 'FAIL: plant_goal did not save every milestone'; end if;
  select count(*) into n from public.weekly_actions w join public.goals g on g.id = w.goal_id and g.user_id = w.user_id where g.title = 'Planted';
  if n <> 2 then raise exception 'FAIL: plant_goal did not save every first action'; end if;
  if (select string_agg(m.title, ',' order by m.created_at) from public.milestones m join public.goals g on g.id = m.goal_id and g.user_id = m.user_id where g.title = 'Planted') <> 'first,second,third' then
    raise exception 'FAIL: milestones lost the order she wrote them in';
  end if;

  -- A goal that fails halfway leaves nothing behind (a bad dimension stops it).
  blocked := false;
  begin
    perform public.plant_goal('{"title":"Broken","dimension_ids":["not-a-dimension"],"starts_on":"2026-10-27","ends_on":"2027-01-25"}'::jsonb, array['m'], '[]'::jsonb);
  exception when check_violation then blocked := true;
  end;
  if not blocked or exists (select 1 from public.goals where title = 'Broken') then raise exception 'FAIL: a failed plant_goal left something behind'; end if;

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
    'goals', 'milestones', 'weekly_actions', 'daily_actions', 'activity_log', 'dedication_notes', 'media', 'vision_items'
  ]
  loop
    execute format('select count(*) from public.%I', t) into n;
    if n <> 0 then raise exception 'FAIL: % rows of another member are readable', t; end if;
    -- Either nothing matches (row-level security) or the change is refused outright
    -- (consents can never be changed by anyone): both mean A's rows are safe.
    begin
      execute format('update public.%I set user_id = user_id where user_id = %L', t, a);
      get diagnostics n = row_count;
    exception when insufficient_privilege then n := 0;
    end;
    if n <> 0 then raise exception 'FAIL: % rows of another member are changeable', t; end if;
    begin
      execute format('delete from public.%I where user_id = %L', t, a);
      get diagnostics n = row_count;
    exception when insufficient_privilege then n := 0;
    end;
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
  blocked := false;
  begin
    perform public.save_assessment('anon', '[]'::jsonb);
  exception when insufficient_privilege then blocked := true;
  end;
  if not blocked then raise exception 'FAIL: signed-out visitors can save an assessment'; end if;
  reset role;

  -- ---- Deleting a member removes everything she owns ----
  -- Newer Supabase versions guard direct deletes from storage; this test's own row is the exception.
  perform set_config('storage.allow_delete_query', 'true', true);
  delete from storage.objects where bucket_id = 'member-media' and name = a || '/p1.jpg';
  delete from auth.users where id in (a, b);
  foreach t in array array[
    'consents', 'moods', 'assessments', 'assessment_scores', 'journal_entries', 'become_choices',
    'goals', 'milestones', 'weekly_actions', 'daily_actions', 'activity_log', 'dedication_notes', 'media', 'vision_items'
  ]
  loop
    execute format('select count(*) from public.%I where user_id in (%L, %L)', t, a, b) into n;
    if n <> 0 then raise exception 'FAIL: % rows remain after the member was deleted', t; end if;
  end loop;

  raise notice 'PASS: member isolation';
end
$$;

select 'PASS: member isolation' as result;
