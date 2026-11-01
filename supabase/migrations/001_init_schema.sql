-- Spectrum Lab admin portal — initial schema.
-- Run this once in the Supabase SQL Editor (or via `supabase db push` if
-- you have the Supabase CLI linked to the project) after the project is
-- created, before running the content migration script.
--
-- Design: each content table pairs a few indexed scalar columns (used for
-- routing/filtering — the same identity fields the current filesystem
-- layout already encodes, like slug/group/year) with a single `data
-- jsonb` column holding the exact shape already validated by the Zod
-- schemas in lib/content/schemas.ts. This keeps the Zod schema as the one
-- source of truth for a row's shape, rather than hand-mirroring every
-- nested field (speakers[], accordion sections, etc.) into SQL columns.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Content tables
-- ---------------------------------------------------------------------

create table pages (
  slug text primary key, -- "home" | "opportunities" | "contact"
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table people (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  "group" text not null,
  status text not null check (status in ('current', 'alumni')),
  year integer, -- alumni only (the cohort year subfolder, e.g. 2011)
  data jsonb not null,
  updated_at timestamptz not null default now(),
  unique (status, "group", slug)
);

create table publications (
  key text primary key, -- BibTeX citekey
  year integer not null,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table coauthors (
  id uuid primary key default gen_random_uuid(),
  name_key text not null unique,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table news (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  item_date date not null,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  item_date date,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table talks (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('delivered', 'organized')),
  slug text not null,
  year integer not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  unique (kind, year, slug)
);

create table teaching (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table gallery_events (
  id uuid primary key default gen_random_uuid(),
  data jsonb not null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table gallery_videos (
  id uuid primary key default gen_random_uuid(),
  youtube_id text not null unique,
  data jsonb not null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table recognition (
  id uuid primary key default gen_random_uuid(),
  data jsonb not null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table grants (
  id uuid primary key default gen_random_uuid(),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table funders (
  id uuid primary key default gen_random_uuid(),
  data jsonb not null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Site-structure config — deliberately just two rows ('nav', 'site').
-- Highest blast radius if edited wrong (breaks every page's navbar and
-- the search index), kept in its own table so the admin UI can set it
-- visually apart from ordinary content.
create table site_config (
  key text primary key, -- "nav" | "site"
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Admin authorization + audit trail
-- ---------------------------------------------------------------------

-- The single allowlisted admin. Authentication happens via Supabase Auth
-- (any email/password account can authenticate); this table is the
-- separate authorization gate — only a row here, with is_active = true,
-- may ever reach /admin.
create table admin_user (
  email text primary key,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_email text not null,
  action text not null, -- "insert" | "update" | "delete"
  table_name text not null,
  record_id text not null,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------

create function is_admin() returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from admin_user
    where email = auth.jwt() ->> 'email' and is_active
  );
$$;

-- Public, anonymous read access on every content table — matches the
-- current site, which is entirely public with no login.
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'pages', 'people', 'publications', 'coauthors', 'news', 'articles',
    'talks', 'teaching', 'gallery_events', 'gallery_videos',
    'recognition', 'grants', 'funders', 'site_config'
  ])
  loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "public read" on %I for select using (true)', t);
    execute format('create policy "admin write" on %I for all using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;

-- admin_user and audit_log are never publicly readable — only the
-- allowlisted admin (via is_admin()) or the service-role key (which
-- bypasses RLS entirely) can touch them.
alter table admin_user enable row level security;
create policy "admin only" on admin_user for all using (is_admin()) with check (is_admin());

alter table audit_log enable row level security;
create policy "admin only" on audit_log for all using (is_admin()) with check (is_admin());
