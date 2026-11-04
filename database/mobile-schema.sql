create table if not exists public.sleepthrough_mobile_records (
user_id uuid not null references auth.users(id) on delete cascade,
id text not null check(char_length(id)<=140),
kind text not null check(kind in ('profile','assessment','night','lesson','health')),
data jsonb not null check(jsonb_typeof(data)='object' and octet_length(data::text)<=50000),
revision integer not null default 1 check(revision>0),
updated_at timestamptz not null default now(),
primary key(user_id,id)
);
alter table public.sleepthrough_mobile_records enable row level security;
revoke all on public.sleepthrough_mobile_records from anon;
grant select,insert,update,delete on public.sleepthrough_mobile_records to authenticated;
create policy "Read own mobile records" on public.sleepthrough_mobile_records for select to authenticated using ((select auth.uid())=user_id);
create policy "Insert own mobile records" on public.sleepthrough_mobile_records for insert to authenticated with check ((select auth.uid())=user_id);
create policy "Update own mobile records" on public.sleepthrough_mobile_records for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "Delete own mobile records" on public.sleepthrough_mobile_records for delete to authenticated using ((select auth.uid())=user_id);
