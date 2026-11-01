-- grants was the one readData-backed table missing a sort_order column,
-- unlike funders/recognition/gallery_* — needed so the public site can
-- preserve the original file's array order when reading from Supabase
-- instead of relying on insertion order (not guaranteed by Postgres).
alter table grants add column sort_order integer not null default 0;
