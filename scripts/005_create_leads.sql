-- Create leads table
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  agent_id uuid references agents(id),
  user_id uuid references profiles(id),
  name text not null,
  phone text not null,
  email text,
  message text,
  source text default 'website' check (source in ('website', 'whatsapp', 'call')),
  status text default 'new' check (status in ('new', 'contacted', 'viewing_scheduled', 'negotiating', 'converted', 'lost')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create index for faster lookups
create index if not exists idx_leads_agent on leads(agent_id);
create index if not exists idx_leads_property on leads(property_id);
create index if not exists idx_leads_status on leads(status);

-- Enable RLS
alter table leads enable row level security;

-- Agents can read leads for their properties
create policy "leads_select_agent" on leads for select 
  using (
    exists (
      select 1 from agents where agents.id = leads.agent_id and agents.user_id = auth.uid()
    )
  );

-- Users can read their own leads
create policy "leads_select_own" on leads for select using (auth.uid() = user_id);

-- Anyone can insert leads (for inquiry forms)
create policy "leads_insert_public" on leads for insert with check (true);

-- Agents can update their leads
create policy "leads_update_agent" on leads for update 
  using (
    exists (
      select 1 from agents where agents.id = leads.agent_id and agents.user_id = auth.uid()
    )
  );
