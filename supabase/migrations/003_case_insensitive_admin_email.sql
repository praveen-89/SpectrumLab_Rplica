-- Supabase Auth always lowercases emails internally, but admin_user was
-- inserted with whatever case the admin typed in the SQL Editor. An
-- exact string comparison between the two then silently fails even for
-- the correct account. Normalize the stored value and compare
-- case-insensitively from now on, so this can't happen again regardless
-- of how a future email gets typed into admin_user.

update admin_user set email = lower(email);

create or replace function is_admin() returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from admin_user
    where lower(email) = lower(auth.jwt() ->> 'email') and is_active
  );
$$;
