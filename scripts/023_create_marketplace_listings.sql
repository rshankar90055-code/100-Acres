create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  city_id uuid references public.cities(id) on delete set null,
  title text not null,
  slug text not null unique,
  description text,
  category text not null check (category in ('car', 'bike', 'electronics', 'appliance')),
  subcategory text,
  listing_type text not null default 'sale' check (listing_type in ('sale', 'rent')),
  condition text check (condition in ('new', 'like_new', 'good', 'fair')),
  price numeric not null,
  brand text,
  model text,
  year integer,
  mileage_km integer,
  fuel_type text,
  transmission text,
  owner_count integer,
  warranty_months integer,
  locality text,
  address text,
  contact_phone text,
  contact_whatsapp text,
  images text[] default '{}',
  video_url text,
  is_featured boolean default false,
  is_verified boolean default false,
  is_active boolean default true,
  status text not null default 'pending' check (status in ('available', 'pending', 'sold')),
  view_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_marketplace_category_created on public.marketplace_listings(category, created_at desc);
create index if not exists idx_marketplace_city_created on public.marketplace_listings(city_id, created_at desc);
create index if not exists idx_marketplace_agent on public.marketplace_listings(agent_id);

alter table public.marketplace_listings enable row level security;

drop policy if exists "Marketplace listings viewable by everyone" on public.marketplace_listings;
create policy "Marketplace listings viewable by everyone" on public.marketplace_listings
  for select using (true);

drop policy if exists "Agents can create own marketplace listings" on public.marketplace_listings;
create policy "Agents can create own marketplace listings" on public.marketplace_listings
  for insert with check (
    exists (
      select 1
      from public.agents a
      where a.id = agent_id
        and a.user_id = auth.uid()
    )
  );

drop policy if exists "Agents can update own marketplace listings" on public.marketplace_listings;
create policy "Agents can update own marketplace listings" on public.marketplace_listings
  for update using (
    exists (
      select 1
      from public.agents a
      where a.id = agent_id
        and a.user_id = auth.uid()
    )
  );

drop policy if exists "Agents can delete own marketplace listings" on public.marketplace_listings;
create policy "Agents can delete own marketplace listings" on public.marketplace_listings
  for delete using (
    exists (
      select 1
      from public.agents a
      where a.id = agent_id
        and a.user_id = auth.uid()
    )
  );
