-- Reviewed setup snapshot for the existing SleepThrough project (not an automatic migration).
create table public.sleepthrough_user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  payload jsonb not null default '{"complete":[],"notes":{},"lessonSteps":{},"history":[]}'::jsonb
    check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 250000),
  updated_at timestamptz not null default now()
);
alter table public.sleepthrough_user_state enable row level security;
revoke all on public.sleepthrough_user_state from anon;
grant select, insert, update, delete on public.sleepthrough_user_state to authenticated;
create policy "Read own sleep state" on public.sleepthrough_user_state for select
  to authenticated using ((select auth.uid()) = user_id);
create policy "Create own sleep state" on public.sleepthrough_user_state for insert
  to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own sleep state" on public.sleepthrough_user_state for update
  to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own sleep state" on public.sleepthrough_user_state for delete
  to authenticated using ((select auth.uid()) = user_id);
