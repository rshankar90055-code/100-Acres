create table if not exists public.phone_identities (
  phone text primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.phone_identities enable row level security;

drop policy if exists "Users can view their own phone identity" on public.phone_identities;
create policy "Users can view their own phone identity" on public.phone_identities
  for select using (auth.uid() = user_id);

create unique index if not exists idx_profiles_phone_unique
on public.profiles (phone)
where phone is not null;
