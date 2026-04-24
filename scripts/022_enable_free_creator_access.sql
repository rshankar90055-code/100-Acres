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
  );
$$;
