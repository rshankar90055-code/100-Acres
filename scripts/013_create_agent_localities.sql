-- Create agent_localities junction table for area-based agent assignment
create table if not exists agent_localities (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id) on delete cascade,
  locality_id uuid references localities(id) on delete cascade,
  is_primary boolean default false,
  created_at timestamptz default now(),
  unique(agent_id, locality_id)
);

-- Create indexes
create index if not exists idx_agent_localities_agent on agent_localities(agent_id);
create index if not exists idx_agent_localities_locality on agent_localities(locality_id);

-- Enable RLS
alter table agent_localities enable row level security;

-- Agents can read their own localities
create policy "agent_localities_select_own" on agent_localities for select 
  using (
    exists (
      select 1 from agents where agents.id = agent_localities.agent_id and agents.user_id = auth.uid()
    )
  );

-- Everyone can read for public agent profiles
create policy "agent_localities_select_public" on agent_localities for select using (true);
