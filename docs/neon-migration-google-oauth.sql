-- Run this AFTER you've already run docs/neon-schema.sql
-- It updates the `users` table to support OAuth users (Google) alongside password users.

alter table users
  alter column password_hash drop not null;

alter table users
  add column if not exists name text,
  add column if not exists image text,
  add column if not exists oauth_provider text,
  add column if not exists oauth_sub text;

create unique index if not exists users_oauth_provider_sub_unique
  on users (oauth_provider, oauth_sub)
  where oauth_provider is not null and oauth_sub is not null;

