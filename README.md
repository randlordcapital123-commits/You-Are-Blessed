# You Are Blessed Merch — GitHub Pages + Free Online Storage

This version is mobile-friendly and uses **Supabase Storage** for images and a small Supabase database row to keep products, gallery and site settings synchronized across devices.

## 1. Create a free Supabase project
Create a project at Supabase.

## 2. Run the setup SQL
Open **SQL Editor** and run `supabase-setup.sql`.

## 3. Create the storage bucket
In **Storage**, create a bucket called:
`yb-merch-images`

Set it to **Public**.

## 4. Add your project keys
Open `supabase-config.js` and paste your:
- Project URL
- Anon/Public key

Do NOT put your service_role key on GitHub Pages.

## 5. Upload to GitHub
Replace your existing website files with this version and commit/push them.

After setup:
- Product images are stored online
- Hero and gallery images are stored online
- Products and site settings synchronize online
- Other devices can see the same content
- The layout remains mobile-friendly

Important: The current simple admin password only controls the browser interface and is not strong server-side security. For a production public website, the next upgrade should be Supabase Auth so only the real owner can upload or edit cloud content.
