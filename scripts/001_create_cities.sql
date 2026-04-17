-- Create cities table
create table if not exists cities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  state text default 'Karnataka',
  is_active boolean default true,
  hero_image_url text,
  description text,
  property_count integer default 0,
  agent_count integer default 0,
  created_at timestamptz default now()
);

-- Enable RLS
alter table cities enable row level security;

-- Everyone can read active cities
create policy "cities_select_public" on cities for select using (is_active = true);

-- Only admins can insert/update/delete cities (via service role)
