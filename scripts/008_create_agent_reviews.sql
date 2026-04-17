-- Create agent_reviews table
create table if not exists agent_reviews (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  is_verified boolean default false,
  created_at timestamptz default now()
);

-- Create index for faster lookups
create index if not exists idx_agent_reviews_agent on agent_reviews(agent_id);

-- Enable RLS
alter table agent_reviews enable row level security;

-- Everyone can read reviews
create policy "agent_reviews_select_public" on agent_reviews for select using (true);

-- Authenticated users can insert reviews
create policy "agent_reviews_insert_auth" on agent_reviews for insert with check (auth.uid() = user_id);

-- Users can update their own reviews
create policy "agent_reviews_update_own" on agent_reviews for update using (auth.uid() = user_id);

-- Users can delete their own reviews
create policy "agent_reviews_delete_own" on agent_reviews for delete using (auth.uid() = user_id);

-- Function to update agent rating
create or replace function update_agent_rating()
returns trigger
language plpgsql
security definer
as $$
begin
  update agents
  set 
    rating = (select coalesce(avg(rating), 0) from agent_reviews where agent_id = NEW.agent_id),
    review_count = (select count(*) from agent_reviews where agent_id = NEW.agent_id)
  where id = NEW.agent_id;
  return NEW;
end;
$$;

-- Trigger to update rating on new review
drop trigger if exists on_agent_review_change on agent_reviews;

create trigger on_agent_review_change
  after insert or update or delete on agent_reviews
  for each row
  execute function update_agent_rating();
