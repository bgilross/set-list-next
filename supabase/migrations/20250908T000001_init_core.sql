-- Core schema for audience request system
-- Run via: supabase db push OR include in initial project state

-- Enable needed extensions
create extension if not exists pgcrypto; -- for gen_random_uuid

-- Artists table (lightweight: you may also rely on auth.users, but this allows custom public fields)
create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text unique, -- optional mapping
  display_name text not null,
  slug text unique, -- vanity slug (also mirrored in Firestore if hybrid)
  public_blurb text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Setlists
create table if not exists public.setlists (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  name text not null,
  is_public boolean default false,
  is_active boolean default false, -- at most one per artist should be true (enforce with trigger)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Songs (library per artist)
create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  spotify_id text, -- nullable if CSV/legacy
  name text not null,
  artist_name text, -- stored separately for faster search
  album text,
  year int,
  user_tags text[] default '{}',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists songs_artist_idx on public.songs(artist_id);
create index if not exists songs_spotify_idx on public.songs(spotify_id);

-- Setlist <-> Songs join (ordered positions)
create table if not exists public.setlist_songs (
  setlist_id uuid references public.setlists(id) on delete cascade,
  song_id uuid references public.songs(id) on delete cascade,
  position int not null,
  primary key(setlist_id, song_id)
);
create index if not exists setlist_songs_position_idx on public.setlist_songs(setlist_id, position);

-- Song Requests from audience
create table if not exists public.song_requests (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  setlist_id uuid references public.setlists(id) on delete set null,
  song_id uuid references public.songs(id) on delete set null,
  raw_song_title text, -- if audience typed a song not in list
  audience_session text, -- anonymous session id
  audience_user_id uuid, -- future auth mapping
  status text not null default 'pending', -- pending|accepted|rejected|played|cancelled
  tip_cents int default 0,
  currency text default 'USD',
  message text,
  response_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists song_requests_artist_status_idx on public.song_requests(artist_id, status);
create index if not exists song_requests_created_idx on public.song_requests(created_at);

-- Simple trigger to keep updated_at fresh
create or replace function public.touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

create trigger _touch_artists before update on public.artists
  for each row execute function public.touch_updated_at();
create trigger _touch_setlists before update on public.setlists
  for each row execute function public.touch_updated_at();
create trigger _touch_songs before update on public.songs
  for each row execute function public.touch_updated_at();
create trigger _touch_song_requests before update on public.song_requests
  for each row execute function public.touch_updated_at();

-- Enforce only one active setlist per artist
create or replace function public.ensure_single_active_setlist() returns trigger as $$
begin
  if new.is_active then
    update public.setlists set is_active=false where artist_id=new.artist_id and id<>new.id and is_active=true;
  end if;
  return new;
end; $$ language plpgsql;

create trigger _single_active_setlist
  before insert or update on public.setlists
  for each row execute function public.ensure_single_active_setlist();

-- Enable Row Level Security
alter table public.artists enable row level security;
alter table public.setlists enable row level security;
alter table public.songs enable row level security;
alter table public.setlist_songs enable row level security;
alter table public.song_requests enable row level security;

-- Basic wide-open dev policies (TIGHTEN for prod!)
create policy "dev_artists_all" on public.artists for all using (true) with check (true);
create policy "dev_setlists_all" on public.setlists for all using (true) with check (true);
create policy "dev_songs_all" on public.songs for all using (true) with check (true);
create policy "dev_setlist_songs_all" on public.setlist_songs for all using (true) with check (true);
create policy "dev_song_requests_all" on public.song_requests for all using (true) with check (true);

-- TODO: Replace with proper ownership-based policies before production.
