-- Run this in Supabase: SQL Editor -> New query
create table if not exists public.yb_merch_store (
  id integer primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.yb_merch_store enable row level security;

drop policy if exists "public read yb merch" on public.yb_merch_store;
create policy "public read yb merch" on public.yb_merch_store for select using (true);
drop policy if exists "public write yb merch" on public.yb_merch_store;
create policy "public write yb merch" on public.yb_merch_store for insert with check (true);
drop policy if exists "public update yb merch" on public.yb_merch_store;
create policy "public update yb merch" on public.yb_merch_store for update using (true) with check (true);

insert into public.yb_merch_store (id,data) values (1,'{}'::jsonb) on conflict (id) do nothing;

-- Create the storage bucket in the Supabase dashboard named: yb-merch-images
-- Make the bucket PUBLIC.
-- Then run these storage policies:
drop policy if exists "public read merch images" on storage.objects;
create policy "public read merch images" on storage.objects for select using (bucket_id='yb-merch-images');
drop policy if exists "public upload merch images" on storage.objects;
create policy "public upload merch images" on storage.objects for insert with check (bucket_id='yb-merch-images');
drop policy if exists "public update merch images" on storage.objects;
create policy "public update merch images" on storage.objects for update using (bucket_id='yb-merch-images') with check (bucket_id='yb-merch-images');
