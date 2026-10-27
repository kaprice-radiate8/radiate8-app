-- ATOMIC SAVES
-- Saving an assessment and planting a goal each write several rows. These
-- functions write them together, so a dropped connection never leaves half
-- of one behind. They run as the member (security invoker), so the usual
-- row-level security applies to every row.

create or replace function public.save_assessment(noticing text, scores jsonb)
returns public.assessments
language plpgsql
security invoker
set search_path = ''
as $$
declare
  saved public.assessments;
begin
  insert into public.assessments (noticing) values (coalesce(noticing, '')) returning * into saved;
  insert into public.assessment_scores (assessment_id, dimension_id, score, note)
  select saved.id, s.dimension_id, s.score, nullif(s.note, '')
  from jsonb_to_recordset(scores) as s(dimension_id text, score smallint, note text);
  return saved;
end;
$$;

create or replace function public.plant_goal(goal jsonb, milestone_titles text[], first_actions jsonb)
returns public.goals
language plpgsql
security invoker
set search_path = ''
as $$
declare
  saved public.goals;
begin
  insert into public.goals (title, vision, dimension_ids, become_choice_id, starts_on, ends_on)
  values (
    goal ->> 'title',
    coalesce(goal ->> 'vision', ''),
    coalesce(array(select jsonb_array_elements_text(goal -> 'dimension_ids')), '{}'),
    goal ->> 'become_choice_id',
    (goal ->> 'starts_on')::date,
    (goal ->> 'ends_on')::date
  )
  returning * into saved;

  -- A millisecond apart, so they keep the order she wrote them in.
  insert into public.milestones (goal_id, title, created_at)
  select saved.id, m.t, now() + m.n * interval '1 millisecond'
  from unnest(milestone_titles) with ordinality as m(t, n);

  insert into public.weekly_actions (goal_id, title, week_of, created_at, updated_at)
  select saved.id, a.title, a.week_of, now() + a.n * interval '1 millisecond', now()
  from rows from (jsonb_to_recordset(first_actions) as (title text, week_of date)) with ordinality as a(title, week_of, n);

  return saved;
end;
$$;

revoke execute on function public.save_assessment(text, jsonb) from public, anon;
revoke execute on function public.plant_goal(jsonb, text[], jsonb) from public, anon;
grant execute on function public.save_assessment(text, jsonb) to authenticated;
grant execute on function public.plant_goal(jsonb, text[], jsonb) to authenticated;
