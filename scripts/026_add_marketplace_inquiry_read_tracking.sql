alter table public.marketplace_inquiries
  add column if not exists buyer_last_read_at timestamptz default now(),
  add column if not exists agent_last_read_at timestamptz;

update public.marketplace_inquiries
set buyer_last_read_at = coalesce(buyer_last_read_at, created_at, now())
where buyer_last_read_at is null;

create index if not exists idx_marketplace_inquiries_buyer_unread
  on public.marketplace_inquiries (buyer_user_id, last_message_at desc);

create index if not exists idx_marketplace_inquiries_agent_unread
  on public.marketplace_inquiries (agent_id, last_message_at desc);
