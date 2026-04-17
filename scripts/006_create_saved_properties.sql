-- Create saved_properties table (user favorites)
create table if not exists saved_properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  property_id uuid references properties(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, property_id)
);

-- Create index for faster lookups
create index if not exists idx_saved_properties_user on saved_properties(user_id);

-- Enable RLS
alter table saved_properties enable row level security;

-- Users can read their own saved properties
create policy "saved_properties_select_own" on saved_properties for select using (auth.uid() = user_id);

-- Users can insert their own saved properties
create policy "saved_properties_insert_own" on saved_properties for insert with check (auth.uid() = user_id);

-- Users can delete their own saved properties
create policy "saved_properties_delete_own" on saved_properties for delete using (auth.uid() = user_id);
