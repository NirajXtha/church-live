-- ============================================================
-- ChurchLive Database Schema + RLS Policies
-- ============================================================

-- 0. EXTENSIONS
create extension if not exists "pgcrypto";

-- 1. PROFILES
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  email       text,
  display_name text,
  avatar_url  text,
  bio         text,
  role        text default 'user' not null check (role in ('user', 'moderator', 'admin')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table profiles enable row level security;

-- 2. HELPER FUNCTION (must exist before any policy references it)
create or replace function is_admin()
returns boolean
language sql stable security definer
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create policy "profiles_select" on profiles
  for select using (true);

create policy "profiles_insert" on profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update" on profiles
  for update using (auth.uid() = id or is_admin());

-- 3. STREAM KEYS
create table stream_keys (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  key         text not null,
  label       text default 'Primary',
  is_active   boolean default true,
  created_at  timestamptz default now(),
  last_used_at timestamptz
);

create index idx_stream_keys_user on stream_keys(user_id);

alter table stream_keys enable row level security;

create policy "sk_select" on stream_keys
  for select using (auth.uid() = user_id or is_admin());

create policy "sk_insert" on stream_keys
  for insert with check (auth.uid() = user_id);

create policy "sk_update" on stream_keys
  for update using (auth.uid() = user_id or is_admin());

create policy "sk_delete" on stream_keys
  for delete using (auth.uid() = user_id or is_admin());

-- 4. STREAMS
create table streams (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references profiles(id) on delete cascade,
  title             text not null,
  description       text,
  thumbnail_url     text,
  category          text,
  tags              text[] default '{}',
  is_live           boolean default false,
  latency_mode      text default 'low' not null check (latency_mode in ('low', 'normal')),
  started_at        timestamptz,
  ended_at          timestamptz,
  viewer_count      integer default 0,
  recording_url     text,
  recording_expires_at timestamptz,
  created_at        timestamptz default now()
);

create index idx_streams_live on streams(is_live) where is_live = true;
create index idx_streams_user on streams(user_id);

alter table streams enable row level security;

create policy "streams_select" on streams
  for select using (true);

create policy "streams_insert" on streams
  for insert with check (auth.uid() = user_id);

create policy "streams_update" on streams
  for update using (auth.uid() = user_id or is_admin());

create policy "streams_delete" on streams
  for delete using (auth.uid() = user_id or is_admin());

-- 5. CHAT MESSAGES
create table chat_messages (
  id          bigint primary key generated always as identity,
  stream_id   uuid not null references streams(id) on delete cascade,
  user_id     uuid not null references profiles(id),
  message     text not null,
  is_deleted  boolean default false,
  created_at  timestamptz default now()
);

create index idx_chat_stream on chat_messages(stream_id, created_at);

alter table chat_messages enable row level security;

create policy "chat_select" on chat_messages
  for select using (true);

create policy "chat_insert" on chat_messages
  for insert with check (
    auth.uid() = user_id
    and char_length(message) <= 500
    and not exists (
      select 1 from bans b
      where b.user_id = auth.uid()
      and b.stream_id = chat_messages.stream_id
      and (b.is_permanent or b.expires_at > now())
    )
    and not exists (
      select 1 from mutes m
      where m.user_id = auth.uid()
      and m.stream_id = chat_messages.stream_id
      and m.expires_at > now()
    )
  );

create policy "chat_delete" on chat_messages
  for delete using (
    auth.uid() = user_id
    or exists (select 1 from streams where id = stream_id and user_id = auth.uid())
    or is_admin()
  );

create policy "chat_update" on chat_messages
  for update using (
    auth.uid() = user_id
    or exists (select 1 from streams where id = stream_id and user_id = auth.uid())
    or is_admin()
  );

-- 6. BANS
create table bans (
  id            uuid primary key default gen_random_uuid(),
  stream_id     uuid references streams(id) on delete cascade,
  user_id       uuid not null references profiles(id),
  banned_by     uuid not null references profiles(id),
  reason        text,
  is_permanent  boolean default false,
  expires_at    timestamptz,
  created_at    timestamptz default now()
);

create index idx_bans_user on bans(user_id);
create index idx_bans_stream on bans(stream_id);

alter table bans enable row level security;

create policy "bans_select" on bans
  for select using (
    user_id = auth.uid()
    or exists (select 1 from streams where id = stream_id and user_id = auth.uid())
    or is_admin()
  );

create policy "bans_insert" on bans
  for insert with check (
    exists (select 1 from streams where id = stream_id and user_id = auth.uid())
    or is_admin()
  );

create policy "bans_delete" on bans
  for delete using (
    exists (select 1 from streams where id = stream_id and user_id = auth.uid())
    or is_admin()
  );

-- 7. MUTES
create table mutes (
  id           uuid primary key default gen_random_uuid(),
  stream_id    uuid references streams(id) on delete cascade,
  user_id      uuid not null references profiles(id),
  muted_by     uuid not null references profiles(id),
  expires_at   timestamptz,
  created_at   timestamptz default now()
);

create index idx_mutes_user on mutes(user_id);
create index idx_mutes_stream on mutes(stream_id);

alter table mutes enable row level security;

create policy "mutes_select" on mutes
  for select using (
    user_id = auth.uid()
    or exists (select 1 from streams where id = stream_id and user_id = auth.uid())
    or is_admin()
  );

create policy "mutes_insert" on mutes
  for insert with check (
    exists (select 1 from streams where id = stream_id and user_id = auth.uid())
    or is_admin()
  );

-- 8. REPORTS
create table reports (
  id                uuid primary key default gen_random_uuid(),
  reporter_id       uuid not null references profiles(id),
  reported_user_id  uuid not null references profiles(id),
  stream_id         uuid references streams(id),
  message_id        bigint references chat_messages(id),
  reason            text not null,
  status            text default 'pending' not null check (status in ('pending', 'reviewed', 'dismissed', 'actioned')),
  created_at        timestamptz default now(),
  reviewed_at       timestamptz,
  reviewed_by       uuid references profiles(id)
);

create index idx_reports_status on reports(status);

alter table reports enable row level security;

create policy "reports_select" on reports
  for select using (reporter_id = auth.uid() or is_admin());

create policy "reports_insert" on reports
  for insert with check (auth.uid() = reporter_id);

create policy "reports_update" on reports
  for update using (is_admin());

-- 9. TRIGGER: auto-create profile on user signup
create or replace function handle_new_user()
returns trigger
language plpgsql security definer
as $$
begin
  insert into public.profiles (id, username, email)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'preferred_username',
      new.raw_user_meta_data ->> 'user_name',
      split_part(new.email, '@', 1)
    ),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
