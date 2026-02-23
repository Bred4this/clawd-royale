# Clawd Royale — Landing & Waitlist

Landing page with waitlist signup. Emails are stored in Supabase.

## Setup

1. **Supabase:** In your project’s SQL editor, run the contents of `waitlist.sql` once (creates `waitlist` table and RLS policy).

2. **Env:** Copy `.env.example` to `.env` and set:
   - `VITE_SUPABASE_URL` — your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — your anon/public key

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173. Submit the form to test; check Supabase Table Editor → `waitlist`.

## Build & deploy

```bash
npm run build
```

Output is in `dist/`.

### Vercel

1. Push the repo to GitHub (if you haven’t).
2. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** → import the repo.
3. Set **Root Directory** to `web` (click Edit, enter `web`, Save).
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = your Supabase project URL  
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key  
5. **Deploy**. Your site will be at `https://your-project.vercel.app`.

### Netlify

1. **Add New site** → **Import an existing project** → connect the repo.
2. **Base directory:** `web`. **Build command:** `npm run build`. **Publish directory:** `web/dist`.
3. **Site settings** → **Environment variables**: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. **Deploy**.
