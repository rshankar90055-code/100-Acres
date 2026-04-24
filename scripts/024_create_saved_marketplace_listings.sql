create table if not exists public.saved_marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, listing_id)
);

alter table public.saved_marketplace_listings enable row level security;

drop policy if exists "Users can view their own saved marketplace listings" on public.saved_marketplace_listings;
create policy "Users can view their own saved marketplace listings" on public.saved_marketplace_listings
  for select using (auth.uid() = user_id);

drop policy if exists "Users can manage their own saved marketplace listings" on public.saved_marketplace_listings;
create policy "Users can manage their own saved marketplace listings" on public.saved_marketplace_listings
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
