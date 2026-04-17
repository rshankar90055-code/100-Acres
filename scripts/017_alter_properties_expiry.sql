-- Add expiry and locality fields to properties table
alter table properties add column if not exists expires_at timestamptz;
alter table properties add column if not exists locality_id uuid references localities(id);
alter table properties add column if not exists is_expired boolean default false;
alter table properties add column if not exists boost_expires_at timestamptz;
alter table properties add column if not exists lead_count integer default 0;

-- Create index for expiry lookups
create index if not exists idx_properties_expires on properties(expires_at);
create index if not exists idx_properties_locality on properties(locality_id);
create index if not exists idx_properties_boost on properties(boost_expires_at);

-- Function to auto-expire properties (can be called via cron)
create or replace function expire_old_properties()
returns void as $$
begin
  update properties 
  set is_expired = true, status = 'inactive'
  where expires_at < now() 
    and is_expired = false 
    and status = 'active';
end;
$$ language plpgsql;
