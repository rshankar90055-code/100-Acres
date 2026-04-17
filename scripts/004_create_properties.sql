-- Create properties table
create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id) on delete cascade,
  city_id uuid references cities(id),
  title text not null,
  slug text,
  description text,
  property_type text not null check (property_type in ('apartment', 'house', 'villa', 'plot', 'commercial', 'pg', 'farmland')),
  listing_type text not null check (listing_type in ('sale', 'rent')),
  price decimal(15,2) not null,
  price_unit text default 'total' check (price_unit in ('total', 'per_sqft', 'per_month')),
  bedrooms integer,
  bathrooms integer,
  area_sqft decimal(10,2),
  floor_number integer,
  total_floors integer,
  facing text,
  age_years integer,
  furnishing text check (furnishing in ('unfurnished', 'semi-furnished', 'fully-furnished')),
  amenities text[] default '{}',
  address text,
  locality text,
  landmark text,
  latitude decimal(10,8),
  longitude decimal(11,8),
  images text[] default '{}',
  video_url text,
  is_featured boolean default false,
  is_verified boolean default false,
  status text default 'active' check (status in ('active', 'pending', 'sold', 'rented', 'inactive')),
  views_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create index for faster lookups
create index if not exists idx_properties_city on properties(city_id);
create index if not exists idx_properties_agent on properties(agent_id);
create index if not exists idx_properties_type on properties(property_type);
create index if not exists idx_properties_listing_type on properties(listing_type);
create index if not exists idx_properties_status on properties(status);

-- Enable RLS
alter table properties enable row level security;

-- Everyone can read active properties
create policy "properties_select_active" on properties for select using (status = 'active');

-- Agents can read their own properties regardless of status
create policy "properties_select_own" on properties for select 
  using (
    exists (
      select 1 from agents where agents.id = properties.agent_id and agents.user_id = auth.uid()
    )
  );

-- Agents can insert properties
create policy "properties_insert_agent" on properties for insert 
  with check (
    exists (
      select 1 from agents where agents.id = properties.agent_id and agents.user_id = auth.uid()
    )
  );

-- Agents can update their own properties
create policy "properties_update_own" on properties for update 
  using (
    exists (
      select 1 from agents where agents.id = properties.agent_id and agents.user_id = auth.uid()
    )
  );

-- Agents can delete their own properties
create policy "properties_delete_own" on properties for delete 
  using (
    exists (
      select 1 from agents where agents.id = properties.agent_id and agents.user_id = auth.uid()
    )
  );
