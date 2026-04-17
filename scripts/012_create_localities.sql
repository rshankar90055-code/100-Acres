-- Create localities table for area-based lead routing
create table if not exists localities (
  id uuid primary key default gen_random_uuid(),
  city_id uuid references cities(id) on delete cascade,
  name text not null,
  slug text not null,
  latitude decimal(10,8),
  longitude decimal(11,8),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(city_id, slug)
);

-- Create index for faster lookups
create index if not exists idx_localities_city on localities(city_id);
create index if not exists idx_localities_slug on localities(slug);

-- Enable RLS
alter table localities enable row level security;

-- Everyone can read active localities
create policy "localities_select_active" on localities for select using (is_active = true);

-- Admins can manage localities (handled via service role)
