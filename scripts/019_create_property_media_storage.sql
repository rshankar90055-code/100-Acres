-- Create separate public buckets for profile images, property images, and property videos.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'profile-images',
    'profile-images',
    true,
    10485760,
    array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/gif'
    ]
  ),
  (
    'property-images',
    'property-images',
    true,
    20971520,
    array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/gif'
    ]
  ),
  (
    'property-videos',
    'property-videos',
    true,
    262144000,
    array[
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/ogg'
    ]
  ),
  (
    'reel-videos',
    'reel-videos',
    true,
    262144000,
    array[
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/ogg'
    ]
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view profile images" on storage.objects;
create policy "Public can view profile images"
on storage.objects
for select
to public
using (bucket_id = 'profile-images');

drop policy if exists "Authenticated users can upload profile images" on storage.objects;
create policy "Authenticated users can upload profile images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'profile-images');

drop policy if exists "Public can view property images" on storage.objects;
create policy "Public can view property images"
on storage.objects
for select
to public
using (bucket_id = 'property-images');

drop policy if exists "Authenticated users can upload property images" on storage.objects;
create policy "Authenticated users can upload property images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'property-images' and public.has_creator_access(auth.uid()));

drop policy if exists "Public can view property videos" on storage.objects;
create policy "Public can view property videos"
on storage.objects
for select
to public
using (bucket_id = 'property-videos');

drop policy if exists "Authenticated users can upload property videos" on storage.objects;
create policy "Authenticated users can upload property videos"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'property-videos' and public.has_creator_access(auth.uid()));

drop policy if exists "Public can view reel videos" on storage.objects;
create policy "Public can view reel videos"
on storage.objects
for select
to public
using (bucket_id = 'reel-videos');

drop policy if exists "Authenticated users can upload reel videos" on storage.objects;
create policy "Authenticated users can upload reel videos"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'reel-videos' and public.has_creator_access(auth.uid()));
