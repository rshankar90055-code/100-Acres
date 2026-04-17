-- Create area_insights table (local intelligence)
create table if not exists area_insights (
  id uuid primary key default gen_random_uuid(),
  city_id uuid references cities(id),
  locality text not null,
  avg_price_sqft decimal(10,2),
  price_trend text check (price_trend in ('rising', 'stable', 'falling')),
  infrastructure_score integer check (infrastructure_score >= 1 and infrastructure_score <= 10),
  connectivity_score integer check (connectivity_score >= 1 and connectivity_score <= 10),
  amenities_nearby text[] default '{}',
  upcoming_projects text[] default '{}',
  updated_at timestamptz default now(),
  unique(city_id, locality)
);

-- Create index for faster lookups
create index if not exists idx_area_insights_city on area_insights(city_id);

-- Enable RLS
alter table area_insights enable row level security;

-- Everyone can read area insights
create policy "area_insights_select_public" on area_insights for select using (true);
