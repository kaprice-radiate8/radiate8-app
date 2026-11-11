-- VISION BOARD AS A COLLAGE
--
-- Items can now be stickers and the board's title as well as photos and words.
-- Each item may carry its own style (a frame for a photo, a look for words) and
-- a saved place on the board (layout: x, y, w in board-width units, tilt in
-- degrees, z for stacking). With no layout, the app arranges it for her.

alter table public.vision_items drop constraint if exists vision_items_check;
alter table public.vision_items drop constraint if exists vision_items_kind_check;

alter table public.vision_items
  add column sticker text,
  add column style text,
  add column layout jsonb,
  add constraint vision_items_kind_check check (kind in ('image', 'words', 'sticker', 'title')),
  add constraint vision_items_content_check check (
    (kind = 'image' and media_id is not null)
    or (kind = 'words' and length(trim(words)) > 0)
    or (kind = 'sticker' and sticker is not null)
    or (kind = 'title' and length(trim(words)) > 0)
  ),
  add constraint vision_items_layout_check check (layout is null or jsonb_typeof(layout) = 'object');

-- Save the places (and styles) of several items in one step, after she arranges her board.
-- changes: [{"id": "...", "layout": {...} or null, "style": "..." or null}, ...]
create or replace function public.set_vision_layouts(changes jsonb)
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.vision_items v
  set layout = c.layout, style = coalesce(c.style, v.style), updated_at = now()
  from jsonb_to_recordset(changes) as c(id text, layout jsonb, style text)
  where v.id = c.id and v.user_id = (select auth.uid());
$$;

revoke execute on function public.set_vision_layouts(jsonb) from public, anon;
grant execute on function public.set_vision_layouts(jsonb) to authenticated;
