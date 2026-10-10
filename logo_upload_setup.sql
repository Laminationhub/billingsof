-- Run this once in Supabase SQL Editor to enable admin logo uploads on an existing project.
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
