-- Create payments table for revenue tracking
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id) on delete set null,
  stripe_payment_id text unique,
  stripe_customer_id text,
  stripe_session_id text,
  amount decimal(10,2) not null,
  currency text default 'inr',
  payment_type text not null check (payment_type in ('subscription', 'boost', 'featured')),
  plan_tier text check (plan_tier in ('basic', 'premium')),
  status text default 'pending' check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes
create index if not exists idx_payments_agent on payments(agent_id);
create index if not exists idx_payments_status on payments(status);
create index if not exists idx_payments_type on payments(payment_type);
create index if not exists idx_payments_created on payments(created_at);

-- Enable RLS
alter table payments enable row level security;

-- Agents can read their own payments
create policy "payments_select_own" on payments for select 
  using (
    exists (
      select 1 from agents where agents.id = payments.agent_id and agents.user_id = auth.uid()
    )
  );
