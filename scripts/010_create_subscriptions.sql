-- Create subscriptions table
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id) on delete cascade,
  tier text not null check (tier in ('basic', 'premium')),
  amount decimal(10,2) not null,
  payment_id text,
  starts_at timestamptz default now(),
  expires_at timestamptz not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Create index for faster lookups
create index if not exists idx_subscriptions_agent on subscriptions(agent_id);
create index if not exists idx_subscriptions_active on subscriptions(is_active);

-- Enable RLS
alter table subscriptions enable row level security;

-- Agents can read their own subscriptions
create policy "subscriptions_select_own" on subscriptions for select 
  using (
    exists (
      select 1 from agents where agents.id = subscriptions.agent_id and agents.user_id = auth.uid()
    )
  );

-- Agents can insert their own subscriptions
create policy "subscriptions_insert_own" on subscriptions for insert 
  with check (
    exists (
      select 1 from agents where agents.id = subscriptions.agent_id and agents.user_id = auth.uid()
    )
  );
