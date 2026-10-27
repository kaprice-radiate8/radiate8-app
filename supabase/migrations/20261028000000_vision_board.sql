-- VISION BOARD
--
-- Each item on her board is an image (a photo in her private member-media
-- folder) or a few words, optionally tagged with one dimension and linked
-- to one of her 90-day goals. Same rules as every member table: she sees
-- and changes only her own items, and references never cross members.
-- `board` leaves room for more than one board later; today everyone has 'main'.

create table public.vision_items (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  board text not null default 'main',
  kind text not null check (kind in ('image', 'words')),
  media_id text,
  words text not null default '',
  dimension_id text check (dimension_id is null or public.is_dimension_list(array[dimension_id])),
  goal_id text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id),
  -- An image item always has its photo; a words item always has words.
  check ((kind = 'image' and media_id is not null) or (kind = 'words' and length(trim(words)) > 0)),
  -- Removing the photo removes its item. Letting a goal go keeps the image, unlinked.
  foreign key (user_id, media_id) references public.media (user_id, id) on delete cascade,
  foreign key (user_id, goal_id) references public.goals (user_id, id) on delete set null (goal_id)
);

create index vision_items_board_position on public.vision_items (user_id, board, position);

alter table public.vision_items enable row level security;
create policy "Members use only their own rows" on public.vision_items for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
revoke all on public.vision_items from anon;
grant select, insert, update, delete on public.vision_items to authenticated;

-- Put her items in the order given, in one step.
create or replace function public.reorder_vision_items(ids text[])
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.vision_items v
  set position = o.n, updated_at = now()
  from unnest(ids) with ordinality as o(id, n)
  where v.id = o.id and v.user_id = (select auth.uid());
$$;

revoke execute on function public.reorder_vision_items(text[]) from public, anon;
grant execute on function public.reorder_vision_items(text[]) to authenticated;
