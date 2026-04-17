-- Create agents table
create table if not exists agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade unique,
  city_id uuid references cities(id),
  agency_name text,
  license_number text,
  experience_years integer default 0,
  specializations text[] default '{}',
  languages text[] default '{kannada}',
  whatsapp_number text,
  is_verified boolean default false,
  verification_status text default 'pending' check (verification_status in ('pending', 'approved', 'rejected')),
  bio text,
  total_listings integer default 0,
  rating decimal(2,1) default 0,
  review_count integer default 0,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'basic', 'premium')),
  subscription_expires_at timestamptz,
  created_at timestamptz default now()
);

-- Enable RLS
alter table agents enable row level security;

-- Everyone can read verified agents
create policy "agents_select_verified" on agents for select using (is_verified = true);

-- Agents can read their own profile even if not verified
create policy "agents_select_own" on agents for select using (auth.uid() = user_id);

-- Agents can update their own profile
create policy "agents_update_own" on agents for update using (auth.uid() = user_id);

-- Users can insert their agent application
create policy "agents_insert_own" on agents for insert with check (auth.uid() = user_id);
