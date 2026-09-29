-- SDETFlow Portfolio v2
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'viewer' check (role in ('viewer','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.site_content (
  id text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.site_content enable row level security;

drop policy if exists "public can read site content" on public.site_content;
create policy "public can read site content"
on public.site_content for select
using (true);

drop policy if exists "admins can insert site content" on public.site_content;
create policy "admins can insert site content"
on public.site_content for insert
to authenticated
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "admins can update site content" on public.site_content;
create policy "admins can update site content"
on public.site_content for update
to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

-- After creating your first Supabase user, promote that user once:
-- insert into public.profiles (id, role)
-- values ('YOUR_AUTH_USER_UUID', 'admin')
-- on conflict (id) do update set role = excluded.role;
