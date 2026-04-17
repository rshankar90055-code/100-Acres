-- Create property_verifications table for physical verification workflow
create table if not exists property_verifications (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade unique,
  agent_id uuid references agents(id) on delete set null,
  verified_by_agent_id uuid references agents(id) on delete set null,
  
  -- Verification checklist
  ownership_verified boolean default false,
  photos_match boolean default false,
  amenities_verified boolean default false,
  measurements_verified boolean default false,
  location_verified boolean default false,
  legal_docs_checked boolean default false,
  
  -- Verification photos (stored in Vercel Blob)
  verification_photos text[] default '{}',
  
  -- Additional notes
  notes text,
  
  -- Status
  status text default 'pending' check (status in ('pending', 'in_progress', 'verified', 'rejected')),
  verified_at timestamptz,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes
create index if not exists idx_property_verifications_property on property_verifications(property_id);
create index if not exists idx_property_verifications_status on property_verifications(status);

-- Enable RLS
alter table property_verifications enable row level security;

-- Agents can read verifications for their properties
create policy "verifications_select_own" on property_verifications for select 
  using (
    exists (
      select 1 from agents where agents.id = property_verifications.agent_id and agents.user_id = auth.uid()
    )
  );

-- Agents can update verifications they're conducting
create policy "verifications_update_verifier" on property_verifications for update 
  using (
    exists (
      select 1 from agents where agents.id = property_verifications.verified_by_agent_id and agents.user_id = auth.uid()
    )
  );
