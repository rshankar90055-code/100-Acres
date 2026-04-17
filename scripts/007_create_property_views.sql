-- Create property_views table (analytics)
create table if not exists property_views (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  user_id uuid references profiles(id),
  ip_address text,
  created_at timestamptz default now()
);

-- Create index for faster lookups
create index if not exists idx_property_views_property on property_views(property_id);
create index if not exists idx_property_views_date on property_views(created_at);

-- Enable RLS
alter table property_views enable row level security;

-- Anyone can insert views
create policy "property_views_insert_public" on property_views for insert with check (true);

-- Agents can read views for their properties
create policy "property_views_select_agent" on property_views for select 
  using (
    exists (
      select 1 from properties 
      join agents on agents.id = properties.agent_id 
      where properties.id = property_views.property_id and agents.user_id = auth.uid()
    )
  );
