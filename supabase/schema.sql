create extension if not exists pgcrypto with schema extensions;

create table if not exists public.profiles (
  id text primary key default gen_random_uuid()::text,
  user_id uuid unique references auth.users(id) on delete set null,
  display_name text not null unique,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.months (
  id text primary key,
  name text not null,
  range_text text not null default '',
  is_active boolean not null default false,
  sort_order integer not null default 0
);

create table if not exists public.weeks (
  id text primary key,
  month_id text not null references public.months(id) on delete cascade,
  name text not null,
  range_text text not null default '',
  sort_order integer not null default 0
);

create table if not exists public.days (
  id text primary key,
  week_id text not null references public.weeks(id) on delete cascade,
  label text not null,
  sort_order integer not null default 0,
  unique (week_id, label)
);

create table if not exists public.scores (
  day_id text not null references public.days(id) on delete cascade,
  player_id text not null references public.profiles(id) on delete cascade,
  score integer not null default 0 check (score >= 0 and score <= 25000),
  updated_at timestamptz not null default now(),
  primary key (day_id, player_id)
);

create schema if not exists private;

create table if not exists private.admin_credentials (
  username text primary key,
  password_hash text not null,
  updated_at timestamptz not null default now()
);

alter table private.admin_credentials enable row level security;

create or replace function public.verify_admin_login(input_username text, input_password text)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select exists (
    select 1
    from private.admin_credentials
    where username = input_username
      and password_hash = extensions.crypt(input_password, password_hash)
  );
$$;

grant execute on function public.verify_admin_login(text, text) to anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = auth.uid()
      and is_admin = true
  );
$$;

create or replace function public.my_profile_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.profiles
  where user_id = auth.uid()
  limit 1;
$$;

create or replace function public.touch_score_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists scores_touch_updated_at on public.scores;
create trigger scores_touch_updated_at
before update on public.scores
for each row execute function public.touch_score_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  wanted_name text;
begin
  wanted_name := nullif(trim(new.raw_user_meta_data->>'display_name'), '');
  if wanted_name is null then
    wanted_name := split_part(new.email, '@', 1);
  end if;

  insert into public.profiles (user_id, display_name)
  values (new.id, wanted_name)
  on conflict (display_name) do update
    set user_id = coalesce(public.profiles.user_id, excluded.user_id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.months enable row level security;
alter table public.weeks enable row level security;
alter table public.days enable row level security;
alter table public.scores enable row level security;

drop policy if exists "profiles are readable" on public.profiles;
create policy "profiles are readable"
on public.profiles for select
using (true);

drop policy if exists "profiles can be inserted by admin" on public.profiles;
drop policy if exists "profiles can be inserted by anyone" on public.profiles;
create policy "profiles can be inserted by anyone"
on public.profiles for insert
with check (true);

drop policy if exists "profiles can be updated by owner or admin" on public.profiles;
drop policy if exists "profiles can be updated by anyone" on public.profiles;
create policy "profiles can be updated by anyone"
on public.profiles for update
using (true)
with check (true);

drop policy if exists "profiles can be deleted by admin" on public.profiles;
drop policy if exists "profiles can be deleted by anyone" on public.profiles;
create policy "profiles can be deleted by anyone"
on public.profiles for delete
using (true);

drop policy if exists "months are readable" on public.months;
create policy "months are readable" on public.months for select using (true);
drop policy if exists "months are writable by admin" on public.months;
drop policy if exists "months are writable by anyone" on public.months;
create policy "months are writable by anyone" on public.months for all using (true) with check (true);

drop policy if exists "weeks are readable" on public.weeks;
create policy "weeks are readable" on public.weeks for select using (true);
drop policy if exists "weeks are writable by admin" on public.weeks;
drop policy if exists "weeks are writable by anyone" on public.weeks;
create policy "weeks are writable by anyone" on public.weeks for all using (true) with check (true);

drop policy if exists "days are readable" on public.days;
create policy "days are readable" on public.days for select using (true);
drop policy if exists "days are writable by admin" on public.days;
drop policy if exists "days are writable by anyone" on public.days;
create policy "days are writable by anyone" on public.days for all using (true) with check (true);

drop policy if exists "scores are readable" on public.scores;
create policy "scores are readable" on public.scores for select using (true);

drop policy if exists "scores can be inserted by owner or admin" on public.scores;
drop policy if exists "scores can be inserted by anyone" on public.scores;
create policy "scores can be inserted by anyone"
on public.scores for insert
with check (true);

drop policy if exists "scores can be updated by owner or admin" on public.scores;
drop policy if exists "scores can be updated by anyone" on public.scores;
create policy "scores can be updated by anyone"
on public.scores for update
using (true)
with check (true);

drop policy if exists "scores can be deleted by owner or admin" on public.scores;
drop policy if exists "scores can be deleted by anyone" on public.scores;
create policy "scores can be deleted by anyone"
on public.scores for delete
using (true);

insert into public.profiles (id, display_name) values
  ('bigaz', 'Bigaz'),
  ('buccia', 'Buccia'),
  ('evelyn', 'Evelyn'),
  ('fede-melis', 'Fede Melis'),
  ('fede-putamorsi', 'Fede Putamorsi'),
  ('leo', 'Leo'),
  ('matti-berna', 'Matti Berna'),
  ('nello', 'Nello'),
  ('ricky-salami', 'Ricky Salami'),
  ('tobi', 'Tobi'),
  ('carmine', 'Carmine'),
  ('thomas', 'Thomas')
on conflict (id) do update set display_name = excluded.display_name;

insert into public.months (id, name, range_text, is_active, sort_order) values
  ('mese-1', 'Mese 1', '20/04-16/05', false, 1),
  ('mese-2', 'Mese 2', '18/05-12/06', true, 2)
on conflict (id) do update set
  name = excluded.name,
  range_text = excluded.range_text,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.weeks (id, month_id, name, range_text, sort_order) values
  ('m1w1', 'mese-1', 'Settimana 1', '20/04-24/04', 1),
  ('m1w2', 'mese-1', 'Settimana 2', '27/04-01/05', 2),
  ('m1w3', 'mese-1', 'Settimana 3', '04/05-08/05', 3),
  ('m1w4', 'mese-1', 'Settimana 4', '11/05-15/05', 4),
  ('m2w1', 'mese-2', 'Settimana 1', '18/05-22/05', 1),
  ('m2w2', 'mese-2', 'Settimana 2', '25/05-29/05', 2),
  ('m2w3', 'mese-2', 'Settimana 3', '01/06-05/06', 3),
  ('m2w4', 'mese-2', 'Settimana 4', '08/06-12/06', 4)
on conflict (id) do update set
  month_id = excluded.month_id,
  name = excluded.name,
  range_text = excluded.range_text,
  sort_order = excluded.sort_order;

insert into public.days (id, week_id, label, sort_order) values
  ('m1w1d1', 'm1w1', '20/04', 1), ('m1w1d2', 'm1w1', '21/04', 2), ('m1w1d3', 'm1w1', '22/04', 3), ('m1w1d4', 'm1w1', '23/04', 4), ('m1w1d5', 'm1w1', '24/04', 5),
  ('m1w2d1', 'm1w2', '27/04', 1), ('m1w2d2', 'm1w2', '28/04', 2), ('m1w2d3', 'm1w2', '29/04', 3), ('m1w2d4', 'm1w2', '30/04', 4), ('m1w2d5', 'm1w2', '01/05', 5),
  ('m1w3d1', 'm1w3', '04/05', 1), ('m1w3d2', 'm1w3', '05/05', 2), ('m1w3d3', 'm1w3', '06/05', 3), ('m1w3d4', 'm1w3', '07/05', 4), ('m1w3d5', 'm1w3', '08/05', 5),
  ('m1w4d1', 'm1w4', '11/05', 1), ('m1w4d2', 'm1w4', '12/05', 2), ('m1w4d3', 'm1w4', '13/05', 3), ('m1w4d4', 'm1w4', '14/05', 4), ('m1w4d5', 'm1w4', '15/05', 5),
  ('m2w1d1', 'm2w1', '18/05', 1), ('m2w1d2', 'm2w1', '19/05', 2), ('m2w1d3', 'm2w1', '20/05', 3), ('m2w1d4', 'm2w1', '21/05', 4), ('m2w1d5', 'm2w1', '22/05', 5),
  ('m2w2d1', 'm2w2', '25/05', 1), ('m2w2d2', 'm2w2', '26/05', 2), ('m2w2d3', 'm2w2', '27/05', 3), ('m2w2d4', 'm2w2', '28/05', 4), ('m2w2d5', 'm2w2', '29/05', 5),
  ('m2w3d1', 'm2w3', '01/06', 1), ('m2w3d2', 'm2w3', '02/06', 2), ('m2w3d3', 'm2w3', '03/06', 3), ('m2w3d4', 'm2w3', '04/06', 4), ('m2w3d5', 'm2w3', '05/06', 5),
  ('m2w4d1', 'm2w4', '08/06', 1), ('m2w4d2', 'm2w4', '09/06', 2), ('m2w4d3', 'm2w4', '10/06', 3), ('m2w4d4', 'm2w4', '11/06', 4), ('m2w4d5', 'm2w4', '12/06', 5)
on conflict (id) do update set
  week_id = excluded.week_id,
  label = excluded.label,
  sort_order = excluded.sort_order;

insert into public.scores (day_id, player_id, score) values
  ('m1w1d1','bigaz',15299), ('m1w1d2','bigaz',20969), ('m1w1d3','bigaz',19007), ('m1w1d5','bigaz',18202),
  ('m1w1d1','buccia',23159), ('m1w1d2','buccia',21014), ('m1w1d3','buccia',22842), ('m1w1d4','buccia',19692), ('m1w1d5','buccia',22192),
  ('m1w1d1','evelyn',12250), ('m1w1d2','evelyn',21063), ('m1w1d3','evelyn',11848), ('m1w1d4','evelyn',17628), ('m1w1d5','evelyn',9814),
  ('m1w1d1','fede-melis',15320), ('m1w1d2','fede-melis',13196), ('m1w1d3','fede-melis',10103), ('m1w1d5','fede-melis',12948),
  ('m1w1d1','fede-putamorsi',19542), ('m1w1d2','fede-putamorsi',17874), ('m1w1d3','fede-putamorsi',16981), ('m1w1d4','fede-putamorsi',10018), ('m1w1d5','fede-putamorsi',15375),
  ('m1w1d3','leo',16318), ('m1w1d4','leo',18456), ('m1w1d5','leo',13604),
  ('m1w1d1','matti-berna',11801), ('m1w1d2','matti-berna',17772), ('m1w1d3','matti-berna',19527),
  ('m1w1d1','nello',14371), ('m1w1d2','nello',23253), ('m1w1d3','nello',16164), ('m1w1d4','nello',16245), ('m1w1d5','nello',22846),
  ('m1w1d1','tobi',14721), ('m1w1d2','tobi',20075), ('m1w1d3','tobi',11783), ('m1w1d4','tobi',13340), ('m1w1d5','tobi',18496),
  ('m1w1d4','carmine',14112),
  ('m1w2d1','bigaz',19486), ('m1w2d2','bigaz',13443), ('m1w2d4','bigaz',23961),
  ('m1w2d1','buccia',13785), ('m1w2d2','buccia',20098), ('m1w2d3','buccia',16140), ('m1w2d4','buccia',16060), ('m1w2d5','buccia',24347),
  ('m1w2d1','evelyn',16711), ('m1w2d2','evelyn',16549), ('m1w2d3','evelyn',19994), ('m1w2d4','evelyn',14962), ('m1w2d5','evelyn',8802),
  ('m1w2d1','fede-putamorsi',10316), ('m1w2d2','fede-putamorsi',14314), ('m1w2d3','fede-putamorsi',15327), ('m1w2d4','fede-putamorsi',11313), ('m1w2d5','fede-putamorsi',7520),
  ('m1w2d1','leo',11662), ('m1w2d2','leo',18778), ('m1w2d3','leo',16958), ('m1w2d4','leo',13457), ('m1w2d5','leo',19233),
  ('m1w2d2','nello',16799),
  ('m1w2d1','tobi',14882), ('m1w2d2','tobi',14076), ('m1w2d3','tobi',17706), ('m1w2d4','tobi',14743), ('m1w2d5','tobi',19922),
  ('m1w3d1','bigaz',17189), ('m1w3d2','bigaz',18677), ('m1w3d5','bigaz',23633),
  ('m1w3d1','buccia',21667), ('m1w3d2','buccia',15332), ('m1w3d3','buccia',18321), ('m1w3d4','buccia',19906), ('m1w3d5','buccia',20208),
  ('m1w3d1','evelyn',19898), ('m1w3d2','evelyn',11227), ('m1w3d3','evelyn',7581), ('m1w3d4','evelyn',18882),
  ('m1w3d1','fede-putamorsi',14568), ('m1w3d2','fede-putamorsi',10560), ('m1w3d3','fede-putamorsi',9800), ('m1w3d4','fede-putamorsi',13589), ('m1w3d5','fede-putamorsi',13895),
  ('m1w3d1','leo',13814), ('m1w3d2','leo',13000), ('m1w3d4','leo',18734),
  ('m1w3d1','tobi',15332), ('m1w3d2','tobi',16967), ('m1w3d3','tobi',13109), ('m1w3d4','tobi',17291), ('m1w3d5','tobi',16894),
  ('m1w3d5','thomas',16368),
  ('m1w4d1','buccia',20968), ('m1w4d2','buccia',20242), ('m1w4d3','buccia',20682), ('m1w4d4','buccia',19368), ('m1w4d5','buccia',16332),
  ('m1w4d1','evelyn',15897), ('m1w4d2','evelyn',21198), ('m1w4d3','evelyn',16214), ('m1w4d4','evelyn',19200), ('m1w4d5','evelyn',18113),
  ('m1w4d1','fede-putamorsi',12000), ('m1w4d2','fede-putamorsi',12000), ('m1w4d3','fede-putamorsi',12000), ('m1w4d4','fede-putamorsi',14500), ('m1w4d5','fede-putamorsi',12256),
  ('m1w4d1','leo',17581), ('m1w4d2','leo',10585), ('m1w4d3','leo',12059), ('m1w4d4','leo',14048), ('m1w4d5','leo',15101),
  ('m1w4d1','tobi',18945), ('m1w4d2','tobi',22182), ('m1w4d3','tobi',21268), ('m1w4d4','tobi',18190), ('m1w4d5','tobi',18649),
  ('m1w4d1','thomas',14638), ('m1w4d3','thomas',16904), ('m1w4d4','thomas',8971), ('m1w4d5','thomas',8847)
on conflict (day_id, player_id) do update set score = excluded.score;
