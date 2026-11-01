-- Tables created via the SQL Editor (001_init_schema.sql) don't get
-- Supabase's usual automatic role grants the way tables created through
-- the dashboard's Table Editor do — Postgres grants and Row Level
-- Security are two separate layers, and RLS alone doesn't help if the
-- role has no base privilege on the table at all. This grants the base
-- privilege; RLS (already enabled in 001) still decides which rows each
-- role can actually see or touch.

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;

-- So the same grants apply automatically to any table created later too.
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated, service_role;
