-- Create property_analytics table for detailed tracking
create table if not exists property_analytics (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  date date not null default current_date,
  views integer default 0,
  unique_views integer default 0,
  phone_clicks integer default 0,
  whatsapp_clicks integer default 0,
  lead_submissions integer default 0,
  save_count integer default 0,
  share_count integer default 0,
  created_at timestamptz default now(),
  unique(property_id, date)
);

-- Create indexes
create index if not exists idx_property_analytics_property on property_analytics(property_id);
create index if not exists idx_property_analytics_date on property_analytics(date);

-- Enable RLS
alter table property_analytics enable row level security;

-- Agents can read analytics for their properties
create policy "analytics_select_own" on property_analytics for select 
  using (
    exists (
      select 1 from properties p
      join agents a on a.id = p.agent_id
      where p.id = property_analytics.property_id and a.user_id = auth.uid()
    )
  );
