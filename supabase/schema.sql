-- Transfer App database setup.
-- Paste this whole file into the Supabase SQL Editor and click "Run".
-- It is safe to run more than once.

-- 1. The messages table (stores one row per uploaded file) --------------

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  file_path text,
  file_name text,
  file_size bigint,
  file_type text,
  device text not null,
  created_at timestamptz not null default now()
);

-- If you ran an earlier version of this file, these add the new columns
-- without touching your existing rows.
alter table public.messages add column if not exists file_size bigint;
alter table public.messages add column if not exists file_type text;

-- 2. Row Level Security: everyone can only see/change their OWN rows ----

alter table public.messages enable row level security;

drop policy if exists "Users can view own messages" on public.messages;
create policy "Users can view own messages"
  on public.messages for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own messages" on public.messages;
create policy "Users can insert own messages"
  on public.messages for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own messages" on public.messages;
create policy "Users can delete own messages"
  on public.messages for delete
  using (auth.uid() = user_id);

-- 3. Realtime: broadcast changes to this table live ----------------------

alter publication supabase_realtime add table public.messages;

-- 4. Storage: a PRIVATE bucket for file attachments -----------------------
-- Files are stored at "<user_id>/<random>-<filename>" so each user's
-- folder can be locked down to only themselves.

insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

drop policy if exists "Users can read own attachments" on storage.objects;
create policy "Users can read own attachments"
  on storage.objects for select
  using (
    bucket_id = 'attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can upload own attachments" on storage.objects;
create policy "Users can upload own attachments"
  on storage.objects for insert
  with check (
    bucket_id = 'attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can delete own attachments" on storage.objects;
create policy "Users can delete own attachments"
  on storage.objects for delete
  using (
    bucket_id = 'attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
