# Hand-holding next steps

Do these in order. After each step, tick the matching box in [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md) if you want to track progress.

---

## Right now (5 min)

### Step A: Build the package

In the **clawd-royale** folder:

```bash
cd /Users/curtisbrunache/clawd-royale
npm run build
```

You should see `dist/` with `.js` and `.d.ts` files.  
→ Check **1.2** in [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md).

---

## Next: Supabase (10 min)

### Step B: Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. **New project** → pick org, name (e.g. `clawd-royale`), password, region → Create.
3. Wait for the project to be ready. Open **Project Settings** → **API**: copy **Project URL** and **anon public** key.

### Step C: Create the database tables

1. In the Supabase dashboard, open **SQL Editor**.
2. Copy the full SQL from **lib/supabase/skills-service.ts**: the block that starts with `CREATE TABLE IF NOT EXISTS agent_skills` and ends with the two `CREATE INDEX` lines. Paste into the editor and **Run**.
3. Open **web/waitlist.sql** in this repo. Copy its contents into the SQL editor and **Run** again.

→ Check **2.1**, **2.2**, **2.3** in the checklist.

### Step D: Set env for the web app

1. In clawd-royale, go to the **web** folder: `cd web`
2. Copy the example env: `cp .env.example .env`
3. Edit **web/.env**: set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the values from Step B.

→ Check **2.5**. (You’ll set **2.4** when you run the Discord bot.)

---

## Next: ACP + cast your three contestants (15 min)

### Step E: Clone and set up openclaw-acp

In a terminal (any folder):

```bash
git clone https://github.com/Virtual-Protocol/openclaw-acp.git
cd openclaw-acp
npm install
npx tsx bin/acp.ts setup
```

Follow the login prompts. When it says you’re logged in, you’re done.  
→ Check **3.1**, **3.2**.

### Step F: Create the three ACP agents (each gets a Base wallet)

Still in the **openclaw-acp** folder:

```bash
npx tsx bin/acp.ts agent create "Rogue_01"
npx tsx bin/acp.ts agent create "Maven_02"
npx tsx bin/acp.ts agent create "Sunny_03"
```

→ Check **3.3**.

### Step G: Get their wallet addresses

From **openclaw-acp**:

```bash
npx tsx bin/acp.ts agent list
```

Or from **clawd-royale** (if openclaw-acp is at `~/openclaw-acp`):

```bash
cd /Users/curtisbrunache/clawd-royale
npm run acp:agents
```

Write down the **wallet address** for Rogue_01, Maven_02, and Sunny_03 (or take a screenshot).  
→ Check **3.4**. Decide you’ll use **name as agent_id** (e.g. `Rogue_01`) → **3.5**.

### Step H: Seed Supabase (cast them into the show)

1. Open Supabase → **SQL Editor**.
2. Paste the following and replace `0xRogueWallet`, `0xMavenWallet`, `0xSunnyWallet` with the real addresses from Step G:

```sql
INSERT INTO agent_skills (agent_id, wallet_address, status, VRL, WIS, TRU, SPD, CRE, CHA, actions_taken, challenges_won)
VALUES
  ('Rogue_01', '0xRogueWallet', 'active', 50, 50, 50, 50, 50, 25, 0, 0),
  ('Maven_02', '0xMavenWallet', 'active', 50, 50, 50, 50, 50, 25, 0, 0),
  ('Sunny_03', '0xSunnyWallet', 'active', 50, 50, 50, 50, 50, 25, 0, 0)
ON CONFLICT (agent_id) DO NOTHING;
```

3. **Run**. In **Table Editor** → **agent_skills** you should see three rows.  
→ Check **3.6**.

---

## Optional: Copy Souls to ~/.openclaw (for OpenClaw CLI)

If you want the Souls in your home dir (e.g. for `openclaw agents add`):

```bash
cd /Users/curtisbrunache/clawd-royale
mkdir -p ~/.openclaw/agents/rogue_01 ~/.openclaw/agents/maven_02 ~/.openclaw/agents/sunny_03
cp agents/rogue_01/SOUL.md ~/.openclaw/agents/rogue_01/
cp agents/maven_02/SOUL.md ~/.openclaw/agents/maven_02/
cp agents/sunny_03/SOUL.md ~/.openclaw/agents/sunny_03/
```

---

## Verify: Run the landing locally

```bash
cd /Users/curtisbrunache/clawd-royale/web
npm install
npm run dev
```

Open http://localhost:5173. Submit an email on the waitlist form, then in Supabase **Table Editor** → **waitlist** you should see the row.  
→ Check **6.1**.

---

## Deploy to Vercel (landing live)

You already have **Root Directory** set to **web** — that’s correct. Finish the deploy with these overrides and env vars:

1. **Build and Deployment** (same page as your screenshot):
   - **Root Directory:** `web` (you already have this).
   - **Build Command:** Turn **Override** on and set to: `npm run build`  
     (When root is `web`, Vercel uses `web/package.json` — which has `build`, not `build:web`. So use `npm run build` here.)
   - **Output Directory:** Turn **Override** on and set to: `dist`  
     (Relative to `web/`, Vite outputs to `dist/`. Do **not** use `web/dist` when root is already `web`.)
   - **Install Command:** Leave default (`npm install`) — no override needed.
   - Leave **“Include files outside the root directory in the Build Step”** enabled if you need the monorepo root for anything; otherwise optional.
   - Click **Save**.

2. **Environment Variables** (left sidebar → Environment Variables):
   - Add `VITE_SUPABASE_URL` = your Supabase project URL.
   - Add `VITE_SUPABASE_ANON_KEY` = your Supabase anon/public key.  
   (Same values as in **web/.env** so the waitlist can write to Supabase.)

3. Trigger a **Redeploy** (Deployments → … on latest → Redeploy) so the new build/output settings and env vars are used.

After a successful deploy, your landing + waitlist will be live at `https://clawd-royale.vercel.app` (or your project URL).  
→ Check **6.3** in [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md).

---

## What’s next after this

| When you’re ready | What to do | Doc |
|-------------------|------------|-----|
| Discord game | Create a bot, add clawd-royale, implement game loop (fetch agents, skill checks, phases) | [LAUNCH_PLAN.md](LAUNCH_PLAN.md) Part 3 |
| List/join | Add `/agents` (or similar) + Discord invite | Checklist 5 |
| Deploy site | Use the Vercel steps above; or Netlify (base dir `web`, build `npm run build`, publish `web/dist`) | [web/README.md](web/README.md) |
| Dashboard | Add a `/dashboard` that reads `agent_skills` for leaderboard | Checklist 7 |

If anything in a step fails (e.g. ACP login, missing table), see [ACP_STEP_BY_STEP.md](ACP_STEP_BY_STEP.md) and [CASTING_CALL.md](CASTING_CALL.md) for more detail.
