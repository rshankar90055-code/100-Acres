create table if not exists public.marketplace_inquiries (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  buyer_user_id uuid not null references auth.users(id) on delete cascade,
  buyer_name text,
  buyer_phone text,
  status text not null default 'new' check (status in ('new', 'replied', 'closed')),
  last_message_at timestamptz default now(),
  buyer_last_read_at timestamptz default now(),
  agent_last_read_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(listing_id, buyer_user_id)
);

create table if not exists public.marketplace_messages (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.marketplace_inquiries(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  sender_role text not null check (sender_role in ('buyer', 'agent')),
  message text not null,
  created_at timestamptz default now()
);

alter table public.marketplace_inquiries enable row level security;
alter table public.marketplace_messages enable row level security;

drop policy if exists "Participants can view marketplace inquiries" on public.marketplace_inquiries;
create policy "Participants can view marketplace inquiries" on public.marketplace_inquiries
  for select using (
    auth.uid() = buyer_user_id
    or exists (
      select 1 from public.agents a
      where a.id = agent_id and a.user_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "Buyers can create marketplace inquiries" on public.marketplace_inquiries;
create policy "Buyers can create marketplace inquiries" on public.marketplace_inquiries
  for insert with check (auth.uid() = buyer_user_id);

drop policy if exists "Participants can update marketplace inquiries" on public.marketplace_inquiries;
create policy "Participants can update marketplace inquiries" on public.marketplace_inquiries
  for update using (
    auth.uid() = buyer_user_id
    or exists (
      select 1 from public.agents a
      where a.id = agent_id and a.user_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "Participants can view marketplace messages" on public.marketplace_messages;
create policy "Participants can view marketplace messages" on public.marketplace_messages
  for select using (
    exists (
      select 1
      from public.marketplace_inquiries mi
      left join public.agents a on a.id = mi.agent_id
      left join public.profiles p on p.id = auth.uid()
      where mi.id = inquiry_id
        and (
          mi.buyer_user_id = auth.uid()
          or a.user_id = auth.uid()
          or p.role = 'admin'
        )
    )
  );

drop policy if exists "Participants can create marketplace messages" on public.marketplace_messages;
create policy "Participants can create marketplace messages" on public.marketplace_messages
  for insert with check (
    auth.uid() = sender_user_id
    and exists (
      select 1
      from public.marketplace_inquiries mi
      left join public.agents a on a.id = mi.agent_id
      where mi.id = inquiry_id
        and (
          mi.buyer_user_id = auth.uid()
          or a.user_id = auth.uid()
        )
    )
  );
