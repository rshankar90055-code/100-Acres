-- 100acres Real Estate Platform Database Schema
-- Run this script to create all required tables

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'agent', 'admin')),
  preferred_city_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- 2. Cities table
create table if not exists public.cities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  state text not null,
  is_active boolean default true,
  hero_image_url text,
  description text,
  property_count integer default 0,
  agent_count integer default 0,
  created_at timestamptz default now()
);

alter table public.cities enable row level security;

create policy "Cities are viewable by everyone" on public.cities
  for select using (true);

create policy "Only admins can manage cities" on public.cities
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 3. Agents table
create table if not exists public.agents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  city_id uuid references public.cities(id) on delete set null,
  agency_name text,
  license_number text,
  experience_years integer default 0,
  specialization text[],
  bio text,
  whatsapp_number text,
  is_verified boolean default false,
  is_active boolean default true,
  rating numeric(2,1) default 0,
  review_count integer default 0,
  properties_sold integer default 0,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'basic', 'premium')),
  subscription_expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

alter table public.agents enable row level security;

create policy "Agents are viewable by everyone" on public.agents
  for select using (true);

create policy "Users can insert their own agent profile" on public.agents
  for insert with check (auth.uid() = user_id);

create policy "Agents can update their own profile" on public.agents
  for update using (auth.uid() = user_id);

create policy "Admins can manage all agents" on public.agents
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 4. Properties table
create table if not exists public.properties (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  city_id uuid references public.cities(id) on delete set null,
  title text not null,
  slug text unique not null,
  description text,
  property_type text not null check (property_type in ('apartment', 'house', 'villa', 'plot', 'commercial', 'pg')),
  listing_type text not null check (listing_type in ('sale', 'rent')),
  price numeric not null,
  price_per_sqft numeric,
  area_sqft numeric,
  bedrooms integer,
  bathrooms integer,
  furnishing text check (furnishing in ('unfurnished', 'semi-furnished', 'fully-furnished')),
  floor_number integer,
  total_floors integer,
  facing text,
  age_of_property text,
  amenities text[],
  address text,
  locality text,
  landmark text,
  latitude numeric,
  longitude numeric,
  images text[],
  video_url text,
  is_featured boolean default false,
  is_verified boolean default false,
  is_active boolean default true,
  status text default 'available' check (status in ('available', 'sold', 'rented', 'pending')),
  view_count integer default 0,
  lead_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.properties enable row level security;

create policy "Properties are viewable by everyone" on public.properties
  for select using (true);

create policy "Agents can insert their own properties" on public.properties
  for insert with check (
    exists (
      select 1 from public.agents
      where agents.id = agent_id and agents.user_id = auth.uid()
    )
  );

create policy "Agents can update their own properties" on public.properties
  for update using (
    exists (
      select 1 from public.agents
      where agents.id = agent_id and agents.user_id = auth.uid()
    )
  );

create policy "Agents can delete their own properties" on public.properties
  for delete using (
    exists (
      select 1 from public.agents
      where agents.id = agent_id and agents.user_id = auth.uid()
    )
  );

create policy "Admins can manage all properties" on public.properties
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 5. Leads table
create table if not exists public.leads (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references public.properties(id) on delete set null,
  agent_id uuid not null references public.agents(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text,
  phone text not null,
  message text,
  lead_type text default 'callback' check (lead_type in ('callback', 'whatsapp', 'visit')),
  status text default 'new' check (status in ('new', 'contacted', 'interested', 'converted', 'closed')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.leads enable row level security;

create policy "Agents can view their own leads" on public.leads
  for select using (
    exists (
      select 1 from public.agents
      where agents.id = agent_id and agents.user_id = auth.uid()
    )
  );

create policy "Users can create leads" on public.leads
  for insert with check (true);

create policy "Agents can update their own leads" on public.leads
  for update using (
    exists (
      select 1 from public.agents
      where agents.id = agent_id and agents.user_id = auth.uid()
    )
  );

create policy "Admins can view all leads" on public.leads
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 6. Saved Properties table
create table if not exists public.saved_properties (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, property_id)
);

alter table public.saved_properties enable row level security;

create policy "Users can view their own saved properties" on public.saved_properties
  for select using (auth.uid() = user_id);

create policy "Users can save properties" on public.saved_properties
  for insert with check (auth.uid() = user_id);

create policy "Users can unsave properties" on public.saved_properties
  for delete using (auth.uid() = user_id);

-- 7. Area Insights table
create table if not exists public.area_insights (
  id uuid primary key default uuid_generate_v4(),
  city_id uuid not null references public.cities(id) on delete cascade,
  locality text not null,
  water_supply_rating integer check (water_supply_rating >= 1 and water_supply_rating <= 5),
  power_supply_rating integer check (power_supply_rating >= 1 and power_supply_rating <= 5),
  safety_rating integer check (safety_rating >= 1 and safety_rating <= 5),
  connectivity_rating integer check (connectivity_rating >= 1 and connectivity_rating <= 5),
  schools_nearby text[],
  hospitals_nearby text[],
  markets_nearby text[],
  public_transport text[],
  average_rent numeric,
  average_price_sqft numeric,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.area_insights enable row level security;

create policy "Area insights are viewable by everyone" on public.area_insights
  for select using (true);

create policy "Only admins can manage area insights" on public.area_insights
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 8. Agent Reviews table
create table if not exists public.agent_reviews (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  review text,
  is_verified boolean default false,
  created_at timestamptz default now()
);

alter table public.agent_reviews enable row level security;

create policy "Reviews are viewable by everyone" on public.agent_reviews
  for select using (true);

create policy "Users can create reviews" on public.agent_reviews
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own reviews" on public.agent_reviews
  for update using (auth.uid() = user_id);

create policy "Users can delete their own reviews" on public.agent_reviews
  for delete using (auth.uid() = user_id);

-- Add foreign key for profiles.preferred_city_id
alter table public.profiles
  add constraint profiles_preferred_city_id_fkey
  foreign key (preferred_city_id) references public.cities(id) on delete set null;

-- Create indexes for better query performance
create index if not exists idx_properties_city_id on public.properties(city_id);
create index if not exists idx_properties_agent_id on public.properties(agent_id);
create index if not exists idx_properties_status on public.properties(status);
create index if not exists idx_properties_is_active on public.properties(is_active);
create index if not exists idx_properties_is_featured on public.properties(is_featured);
create index if not exists idx_properties_listing_type on public.properties(listing_type);
create index if not exists idx_properties_property_type on public.properties(property_type);
create index if not exists idx_agents_city_id on public.agents(city_id);
create index if not exists idx_agents_is_verified on public.agents(is_verified);
create index if not exists idx_leads_agent_id on public.leads(agent_id);
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_cities_is_active on public.cities(is_active);
create index if not exists idx_cities_slug on public.cities(slug);

-- Trigger to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    coalesce(new.raw_user_meta_data ->> 'role', 'user')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Function to update city property counts
create or replace function public.update_city_property_count()
returns trigger
language plpgsql
security definer
as $$
begin
  if TG_OP = 'INSERT' then
    update public.cities
    set property_count = property_count + 1
    where id = NEW.city_id;
  elsif TG_OP = 'DELETE' then
    update public.cities
    set property_count = property_count - 1
    where id = OLD.city_id;
  elsif TG_OP = 'UPDATE' and OLD.city_id is distinct from NEW.city_id then
    update public.cities
    set property_count = property_count - 1
    where id = OLD.city_id;
    update public.cities
    set property_count = property_count + 1
    where id = NEW.city_id;
  end if;
  return coalesce(NEW, OLD);
end;
$$;

drop trigger if exists on_property_change on public.properties;

create trigger on_property_change
  after insert or update or delete on public.properties
  for each row
  execute function public.update_city_property_count();

-- Function to update city agent counts
create or replace function public.update_city_agent_count()
returns trigger
language plpgsql
security definer
as $$
begin
  if TG_OP = 'INSERT' then
    update public.cities
    set agent_count = agent_count + 1
    where id = NEW.city_id;
  elsif TG_OP = 'DELETE' then
    update public.cities
    set agent_count = agent_count - 1
    where id = OLD.city_id;
  elsif TG_OP = 'UPDATE' and OLD.city_id is distinct from NEW.city_id then
    update public.cities
    set agent_count = agent_count - 1
    where id = OLD.city_id;
    update public.cities
    set agent_count = agent_count + 1
    where id = NEW.city_id;
  end if;
  return coalesce(NEW, OLD);
end;
$$;

drop trigger if exists on_agent_change on public.agents;

create trigger on_agent_change
  after insert or update or delete on public.agents
  for each row
  execute function public.update_city_agent_count();
