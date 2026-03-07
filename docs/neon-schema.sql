-- Run this in the Neon SQL Editor for your project.
-- It creates the minimum tables this app needs after moving off Supabase.

create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text,
  name text,
  image text,
  oauth_provider text,
  oauth_sub text,
  created_at timestamptz not null default now()
);

create unique index if not exists users_oauth_provider_sub_unique
  on users (oauth_provider, oauth_sub)
  where oauth_provider is not null and oauth_sub is not null;

create table if not exists api_usage (
  date date primary key,
  call_count integer not null default 0
);

create table if not exists identification_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  plant_name text not null,
  scientific_name text,
  confidence double precision,
  image_thumbnail text,
  result_json jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists identification_history_user_created_at_idx
  on identification_history (user_id, created_at desc);

