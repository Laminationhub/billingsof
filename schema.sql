-- Lamination Hub QR website schema for Supabase
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.business_profile (
  id text primary key default 'main' check (id = 'main'),
  name text not null default 'LAMINATION HUB',
  logo_text text not null default 'LH',
  logo_url text not null default '',
  tagline text not null default 'Tera Style, Teri Choice — Lamination Hub Always Right',
  about text not null default 'Customised gifts, mobile skins and printing services.',
  phone text not null default '', whatsapp text not null default '',
  instagram text not null default '', facebook text not null default '', youtube text not null default '', website text not null default '',
  address text not null default 'Kurebhar, Sultanpur, Uttar Pradesh, India', maps_url text not null default '', hours text not null default '',
  updated_at timestamptz not null default now()
);
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(), title text not null, emoji text not null default '✨',
  description text not null default '', price text not null default '', sort_order integer not null default 0,
  is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
alter table public.business_profile enable row level security;
alter table public.services enable row level security;
drop policy if exists "Public can read business profile" on public.business_profile;
create policy "Public can read business profile" on public.business_profile for select to anon, authenticated using (true);
drop policy if exists "Admins can insert business profile" on public.business_profile;
create policy "Admins can insert business profile" on public.business_profile for insert to authenticated with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
drop policy if exists "Admins can update business profile" on public.business_profile;
create policy "Admins can update business profile" on public.business_profile for update to authenticated using (exists (select 1 from public.admin_users a where a.user_id = auth.uid())) with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
drop policy if exists "Public can read active services" on public.services;
create policy "Public can read active services" on public.services for select to anon, authenticated using (is_active = true or exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
drop policy if exists "Admins can insert services" on public.services;
create policy "Admins can insert services" on public.services for insert to authenticated with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
drop policy if exists "Admins can update services" on public.services;
create policy "Admins can update services" on public.services for update to authenticated using (exists (select 1 from public.admin_users a where a.user_id = auth.uid())) with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
drop policy if exists "Admins can delete services" on public.services;
create policy "Admins can delete services" on public.services for delete to authenticated using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
drop policy if exists "Admins can read own admin record" on public.admin_users;
create policy "Admins can read own admin record" on public.admin_users for select to authenticated using (user_id = auth.uid());
insert into public.business_profile (id) values ('main') on conflict (id) do nothing;
insert into public.services (title,emoji,description,sort_order)
select x.title,x.emoji,x.description,x.sort_order from (values
('Photo Frames','🖼️','Custom photo frames in multiple sizes and styles.',1),
('Customised Mugs','☕','Photo mugs, magic mugs and personalised gifts.',2),
('Mobile & Laptop Skins','📱','Stylish skins with custom designs.',3),
('Personalised Gifts','🎁','T-shirts, keychains, pillows and bottles.',4),
('PVC & ID Cards','🪪','PVC printing, ID cards and lamination.',5),
('Printing Services','🖨️','Document cropping and printing assistance.',6)
) as x(title,emoji,description,sort_order) where not exists (select 1 from public.services);
-- Admin setup: create a user in Supabase Dashboard > Authentication > Users, then insert its UUID into public.admin_users.
-- Public sign-ups should remain disabled. Never expose a service-role key in frontend code.

-- Public logo storage bucket and admin-only upload policies.
alter table public.business_profile add column if not exists logo_url text not null default '';
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('business-logos', 'business-logos', true, 3145728, array['image/png','image/jpeg','image/webp','image/svg+xml'])
on conflict (id) do update set public = true, file_size_limit = 3145728, allowed_mime_types = array['image/png','image/jpeg','image/webp','image/svg+xml'];
drop policy if exists "Public can view business logos" on storage.objects;
create policy "Public can view business logos" on storage.objects for select to anon, authenticated using (bucket_id = 'business-logos');
drop policy if exists "Admins can upload business logos" on storage.objects;
create policy "Admins can upload business logos" on storage.objects for insert to authenticated with check (bucket_id = 'business-logos' and exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
drop policy if exists "Admins can update business logos" on storage.objects;
create policy "Admins can update business logos" on storage.objects for update to authenticated using (bucket_id = 'business-logos' and exists (select 1 from public.admin_users a where a.user_id = auth.uid())) with check (bucket_id = 'business-logos' and exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
drop policy if exists "Admins can delete business logos" on storage.objects;
create policy "Admins can delete business logos" on storage.objects for delete to authenticated using (bucket_id = 'business-logos' and exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
