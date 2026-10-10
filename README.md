# Lamination Hub — QR Digital Business Card

This is a small static website with a public QR landing page and a Supabase-backed admin panel. Once deployed, the QR code encodes the public page URL. Keep the same domain/path to keep the QR destination stable.

## Files
- `index.html` — public profile page
- `admin.html` — private login/admin screen
- `config.js` — Supabase project URL and public anon/publishable key
- `app.js` — public page rendering and QR code
- `admin.js` — admin login and editing logic
- `style.css` — responsive black/orange theme
- `schema.sql` — database tables, seed data and Row Level Security policies
- `logo_upload_setup.sql` — one-time upgrade for uploading a logo to Supabase Storage

## Setup (Supabase)
1. The Supabase project `lamination-hub-qr` is already connected in `config.js` (Mumbai region). The core tables and policies have already been created.
2. The core tables already exist. To enable the new logo-upload feature on this existing project, open Supabase SQL Editor and run the contents of `logo_upload_setup.sql` once. For a brand-new database, run `schema.sql`.
3. In **Authentication > Users**, create an admin user with your own email/password. Keep public sign-ups disabled.
4. Copy the admin user's UUID. Run this SQL in SQL Editor, replacing the placeholder:
   ```sql
   insert into public.admin_users (user_id)
   values ('PASTE-AUTH-USER-UUID-HERE');
   ```
5. `config.js` is pre-filled with this project URL and its public publishable key. Do not replace these unless you move to another project:
   ```js
   window.LH_CONFIG = {
     SUPABASE_URL: "https://YOUR-PROJECT.supabase.co",
     SUPABASE_ANON_KEY: "YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY"
   };
   ```
   Do **not** use a `service_role` or secret key in browser code.
6. Deploy all files to a static HTTPS host such as Netlify, Vercel, or Cloudflare Pages. Upload all files to the same site root.
7. Open the public URL and check the page. Open `/admin.html`, sign in, edit the profile and save. Add or edit services. Changes are stored in Supabase and the public page reads the latest values.
8. In Admin > Business profile, use **Upload business logo** to choose a PNG/JPG/WEBP/SVG logo up to 3 MB, then click **Save profile online**. The logo is stored in Supabase Storage and appears to all visitors.
9. Admin access is intentionally hidden on the public page: click/tap the logo five times quickly to reveal the small Admin link. You can also use `Alt + Shift + A`. The admin page still requires authorised login.
10. Use the QR download button on the public page. It encodes the current page URL. For a permanent printed QR, attach a custom domain and avoid changing that domain or page path.

## Security notes
- Admin editing depends on Supabase Auth and Row Level Security (RLS).
- Only UUIDs added to `public.admin_users` can modify profile/services.
- The website intentionally has no public sign-up form.
- Anyone can read public profile data and active services, so do not store private information in these tables.
- Logo uploads use a public Supabase Storage bucket for viewing and admin-only policies for uploads. Do not upload private images or sensitive information.
- Use HTTPS in production.

## Troubleshooting
- If you see demo mode, verify `config.js` and reload.
- If admin login works but editing is denied, verify the signed-in user's UUID is in `admin_users` and that `schema.sql` ran successfully.
- QR generation uses third-party CDN scripts and therefore needs internet access.


### Google Drive logo link
In Admin → Business profile, paste the Google Drive share link into “Or paste Google Drive logo link”, set the file sharing to “Anyone with the link” (Viewer), then click “Save profile online”. Standard Drive file links are converted to a view URL. Some Google Drive links may not embed reliably; if the preview does not load, upload the image directly through the file upload option or use Supabase Storage.
