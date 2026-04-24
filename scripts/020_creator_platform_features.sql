-- Add trial support for agents and create notification/reels infrastructure.

alter table public.agents
  add column if not exists trial_started_at timestamptz,
  add column if not exists trial_expires_at timestamptz,
  add column if not exists has_used_trial boolean default false;

create index if not exists idx_agents_trial_expires_at on public.agents(trial_expires_at);

create or replace function public.has_creator_access(user_uuid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = user_uuid
      and p.role = 'admin'
  ) or exists (
    select 1
    from public.agents a
    where a.user_id = user_uuid
      and (
        (
          a.subscription_tier <> 'free'
          and (a.subscription_expires_at is null or a.subscription_expires_at > now())
        )
        or (a.trial_expires_at is not null and a.trial_expires_at > now())
      )
  );
$$;

create table if not exists public.user_locality_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  city_id uuid references public.cities(id) on delete cascade,
  locality text not null,
  locality_key text not null,
  created_at timestamptz default now(),
  unique(user_id, city_id, locality_key)
);

alter table public.user_locality_alerts enable row level security;

drop policy if exists "Users can view their own locality alerts" on public.user_locality_alerts;
create policy "Users can view their own locality alerts" on public.user_locality_alerts
  for select using (auth.uid() = user_id);

drop policy if exists "Users can manage their own locality alerts" on public.user_locality_alerts;
create policy "Users can manage their own locality alerts" on public.user_locality_alerts
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  link text,
  metadata jsonb default '{}'::jsonb,
  is_read boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_notifications_user_created on public.notifications(user_id, created_at desc);
create index if not exists idx_notifications_user_unread on public.notifications(user_id, is_read);

alter table public.notifications enable row level security;

drop policy if exists "Users can view their own notifications" on public.notifications;
create policy "Users can view their own notifications" on public.notifications
  for select using (auth.uid() = user_id);

drop policy if exists "Users can update their own notifications" on public.notifications;
create policy "Users can update their own notifications" on public.notifications
  for update using (auth.uid() = user_id);

create table if not exists public.property_reels (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,
  city_id uuid references public.cities(id) on delete set null,
  locality text,
  title text,
  caption text,
  video_url text not null,
  thumbnail_url text,
  contact_phone text,
  contact_whatsapp text,
  like_count integer default 0,
  comment_count integer default 0,
  share_count integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_property_reels_agent on public.property_reels(agent_id);
create index if not exists idx_property_reels_created on public.property_reels(created_at desc);

alter table public.property_reels enable row level security;

drop policy if exists "Reels are viewable by everyone" on public.property_reels;
create policy "Reels are viewable by everyone" on public.property_reels
  for select using (true);

drop policy if exists "Eligible agents can create reels" on public.property_reels;
create policy "Eligible agents can create reels" on public.property_reels
  for insert with check (
    exists (
      select 1
      from public.agents a
      where a.id = agent_id
        and a.user_id = auth.uid()
        and public.has_creator_access(auth.uid())
    )
  );

drop policy if exists "Owners can update reels" on public.property_reels;
create policy "Owners can update reels" on public.property_reels
  for update using (
    exists (
      select 1
      from public.agents a
      where a.id = agent_id
        and a.user_id = auth.uid()
    )
  );

drop policy if exists "Owners can delete reels" on public.property_reels;
create policy "Owners can delete reels" on public.property_reels
  for delete using (
    exists (
      select 1
      from public.agents a
      where a.id = agent_id
        and a.user_id = auth.uid()
    )
  );

create table if not exists public.reel_likes (
  reel_id uuid not null references public.property_reels(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (reel_id, user_id)
);

alter table public.reel_likes enable row level security;

drop policy if exists "Users can view reel likes" on public.reel_likes;
create policy "Users can view reel likes" on public.reel_likes
  for select using (true);

drop policy if exists "Users can like reels" on public.reel_likes;
create policy "Users can like reels" on public.reel_likes
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can unlike reels" on public.reel_likes;
create policy "Users can unlike reels" on public.reel_likes
  for delete using (auth.uid() = user_id);

create table if not exists public.reel_comments (
  id uuid primary key default gen_random_uuid(),
  reel_id uuid not null references public.property_reels(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  comment text not null,
  created_at timestamptz default now()
);

alter table public.reel_comments enable row level security;

drop policy if exists "Users can view reel comments" on public.reel_comments;
create policy "Users can view reel comments" on public.reel_comments
  for select using (true);

drop policy if exists "Users can add reel comments" on public.reel_comments;
create policy "Users can add reel comments" on public.reel_comments
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own reel comments" on public.reel_comments;
create policy "Users can delete their own reel comments" on public.reel_comments
  for delete using (auth.uid() = user_id);

create or replace function public.notify_locality_followers()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.status <> 'available' or NEW.is_active is not true then
    return NEW;
  end if;

  insert into public.notifications (user_id, title, body, link, metadata)
  select
    ula.user_id,
    'New property in ' || coalesce(NEW.locality, 'your area'),
    NEW.title,
    '/properties/' || NEW.slug,
    jsonb_build_object(
      'propertyId', NEW.id,
      'cityId', NEW.city_id,
      'locality', NEW.locality
    )
  from public.user_locality_alerts ula
  where ula.city_id is not distinct from NEW.city_id
    and ula.locality_key = lower(coalesce(NEW.locality, ''))
    and ula.user_id <> (
      select a.user_id from public.agents a where a.id = NEW.agent_id
    );

  return NEW;
end;
$$;

drop trigger if exists on_property_notification_insert on public.properties;
create trigger on_property_notification_insert
  after insert on public.properties
  for each row
  execute function public.notify_locality_followers();

create or replace function public.sync_reel_counts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_TABLE_NAME = 'reel_likes' then
    update public.property_reels
    set like_count = (
      select count(*) from public.reel_likes where reel_id = coalesce(NEW.reel_id, OLD.reel_id)
    ),
    updated_at = now()
    where id = coalesce(NEW.reel_id, OLD.reel_id);
  elsif TG_TABLE_NAME = 'reel_comments' then
    update public.property_reels
    set comment_count = (
      select count(*) from public.reel_comments where reel_id = coalesce(NEW.reel_id, OLD.reel_id)
    ),
    updated_at = now()
    where id = coalesce(NEW.reel_id, OLD.reel_id);
  end if;

  return coalesce(NEW, OLD);
end;
$$;

drop trigger if exists on_reel_like_change on public.reel_likes;
create trigger on_reel_like_change
  after insert or delete on public.reel_likes
  for each row
  execute function public.sync_reel_counts();

drop trigger if exists on_reel_comment_change on public.reel_comments;
create trigger on_reel_comment_change
  after insert or delete on public.reel_comments
  for each row
  execute function public.sync_reel_counts();
