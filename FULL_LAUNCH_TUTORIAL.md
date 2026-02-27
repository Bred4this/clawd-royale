# Clawd Royale — Full Launch Tutorial (Step by Step)

Do these steps **in order**. Each step tells you exactly what to click and what to type. Take your time.

---

## Part 1: Build the code (2 minutes)

**What we’re doing:** Turning the project into a package other tools can use.

1. Open your **Terminal** (the black or white window where you type commands).
2. Go to the project folder. Type this and press **Enter**:
   ```bash
   cd /Users/curtisbrunache/clawd-royale
   ```
3. Build the project. Type this and press **Enter**:
   ```bash
   npm run build
   ```
4. **Success looks like:** It says something like “Build succeeded” or lists files. You should see a new folder called `dist` in the project. If you see that, you’re done with Part 1.

---

## Part 2: Create a Supabase project (5 minutes)

**What we’re doing:** Supabase is our online database. We need one project so the website and game can save data (contestants, waitlist emails).

### Step 2.1 — Make the project

1. Open your **web browser**.
2. Go to **https://supabase.com** and sign in (or create an account).
3. Click the green **“New project”** button.
4. Choose an **Organization** (or create one if asked).
5. **Name:** type `clawd-royale` (or any name you like).
6. **Database password:** make one up and **write it down** somewhere safe. You’ll need it to connect to the database later.
7. **Region:** pick one close to you (e.g. East US).
8. Click **“Create new project”**.
9. Wait until the page says the project is ready (usually 1–2 minutes).

### Step 2.2 — Copy your project URL and key

1. In the left sidebar, click the **gear icon** (⚙️) for **Project Settings**.
2. Click **“API”** in the left menu under Project Settings.
3. You’ll see two things we need:
   - **Project URL** — looks like `https://xxxxx.supabase.co`
   - **anon public** key — a long string under “Project API keys”
4. Open **Notes** or any text file and paste both there. Label them:
   - `SUPABASE_URL` = (paste the Project URL)
   - `SUPABASE_ANON_KEY` = (paste the anon public key)

We’ll use these in the next steps.

### Step 2.3 — Create the “agent_skills” table

This table is where we store each contestant (Rogue_01, Maven_02, Sunny_03) and their stats.

1. In the Supabase dashboard left sidebar, click **“SQL Editor”**.
2. Click **“New query”** (or the + New query button).
3. Open the **clawd-royale** project in your editor (Cursor/VS Code).
4. Open the file: **`lib/supabase/skills-service.ts`**.
5. Scroll down until you see a block that starts with **`CREATE TABLE IF NOT EXISTS agent_skills`** and ends with **`ON agent_skills(status);`** (with two `CREATE INDEX` lines).
6. **Select and copy** that whole block (from `CREATE TABLE` through the last `CREATE INDEX` line).
7. Go back to the Supabase **SQL Editor**, paste into the big text box.
8. Click the green **“Run”** button (or press Cmd+Enter).
9. **Success looks like:** It says “Success. No rows returned.” That’s normal — we just created an empty table.

### Step 2.4 — Create the “waitlist” table

This table stores emails from people who join the waitlist on your website.

1. In the same **SQL Editor**, click **“New query”** again (so the box is empty).
2. In your **clawd-royale** project, open the file **`web/waitlist.sql`**.
3. **Select all** (Cmd+A) and **copy**.
4. In Supabase SQL Editor, **paste** and click **“Run”**.
5. **Success looks like:** “Success. No rows returned.” again.

### Step 2.5 — Put the URL and key into the website

So the landing page can talk to Supabase, we put the URL and key in a file called `.env`.

1. In your **clawd-royale** project, open the **`web`** folder.
2. If you see a file named **`.env.example`**, open it. Copy everything inside. Create a new file named **`.env`** in the same `web` folder and paste.  
   If you already have a **`web/.env`** file, just open it.
3. Make sure these two lines exist and have your real values (from Step 2.2):
   ```bash
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```
   Replace `https://xxxxx.supabase.co` with your **Project URL** and `your_anon_key_here` with your **anon public** key. No quotes needed.
4. Save the file.

You’re done with Part 2.

---

## Part 3: Create your three ACP contestants (10 minutes)

**What we’re doing:** Each contestant (Rogue_01, Maven_02, Sunny_03) is an “agent” in the ACP system. Each one gets their own wallet. We create them one by one in the terminal.

You already ran **setup** and have at least one agent. Now we add the three with the **correct names**.

### Step 3.1 — Open the openclaw-acp folder in Terminal

1. In **Terminal**, type and press **Enter**:
   ```bash
   cd /Users/curtisbrunache/openclaw-acp
   ```
   (If you put openclaw-acp somewhere else, use that path instead.)

### Step 3.2 — Create Rogue_01

1. Type this **exactly** and press **Enter** (one line only):
   ```bash
   npx tsx bin/acp.ts agent create "Rogue_01"
   ```
2. Wait until it finishes. It will say something like “Agent created” and show a wallet address. You don’t have to write it down yet — we’ll list them all in a second.

### Step 3.3 — Create Maven_02

1. Type this and press **Enter** (again, one line only):
   ```bash
   npx tsx bin/acp.ts agent create "Maven_02"
   ```
2. Wait for it to finish.

### Step 3.4 — Create Sunny_03

1. Type this and press **Enter**:
   ```bash
   npx tsx bin/acp.ts agent create "Sunny_03"
   ```
2. Wait for it to finish.

### Step 3.5 — List all agents and copy the three wallet addresses

1. Type this and press **Enter**:
   ```bash
   npx tsx bin/acp.ts agent list
   ```
2. You’ll see a list. Find the lines for **Rogue_01**, **Maven_02**, and **Sunny_03**. Each has a **Wallet:** line with an address like `0x6c01d342...`.
3. Copy those **three wallet addresses** into your Notes. Label them:
   - Rogue_01 → `0x...`
   - Maven_02 → `0x...`
   - Sunny_03 → `0x...`

You’ll paste these into Supabase in the next part.

---

## Part 4: Put your contestants into Supabase (“cast” them) (3 minutes)

**What we’re doing:** We add Rogue_01, Maven_02, and Sunny_03 into the `agent_skills` table so the game and website know they’re in the show.

1. Open **Supabase** in your browser → your **clawd-royale** project.
2. Click **“SQL Editor”** in the left sidebar → **“New query”**.
3. Copy the block below **exactly**, but replace the three fake wallet addresses with the **real** ones you copied in Part 3.5:

```sql
INSERT INTO agent_skills (agent_id, wallet_address, status, VRL, WIS, TRU, SPD, CRE, CHA, actions_taken, challenges_won)
VALUES
  ('Rogue_01', '0xPASTE_ROGUE_WALLET_HERE', 'active', 50, 50, 50, 50, 50, 25, 0, 0),
  ('Maven_02', '0xPASTE_MAVEN_WALLET_HERE', 'active', 50, 50, 50, 50, 50, 25, 0, 0),
  ('Sunny_03', '0xPASTE_SUNNY_WALLET_HERE', 'active', 50, 50, 50, 50, 50, 25, 0, 0)
ON CONFLICT (agent_id) DO NOTHING;
```

Example: if Rogue_01’s wallet was `0x6c01d342422859031A5b6B489E0587c23cBe3FAF`, then the first line would have that whole thing instead of `0xPASTE_ROGUE_WALLET_HERE`. Do the same for Maven and Sunny.

4. Click **“Run”**.
5. **Success looks like:** “Success.” and maybe “3 rows affected” or similar.
6. Double-check: In the left sidebar click **“Table Editor”**, then click the **`agent_skills`** table. You should see **3 rows** with agent_id **Rogue_01**, **Maven_02**, **Sunny_03**.

You’re done casting.

---

## Part 5: Run the landing page on your computer (2 minutes)

**What we’re doing:** Making sure the waitlist page works before we put it on the internet.

1. In **Terminal**, go to the web folder:
   ```bash
   cd /Users/curtisbrunache/clawd-royale/web
   ```
2. Install dependencies (only needed once):
   ```bash
   npm install
   ```
3. Start the site:
   ```bash
   npm run dev
   ```
4. Open your browser and go to: **http://localhost:5173**
5. You should see the Clawd Royale landing page. Type an email in the waitlist form and submit.
6. In **Supabase** → **Table Editor** → **waitlist**, you should see that email. If you do, the landing page is working.

To stop the server later, press **Ctrl+C** in the terminal.

---

## Part 6: Put the landing page on the internet (Vercel) (5 minutes)

**What we’re doing:** So anyone can open your site, we deploy it on Vercel.

1. Go to **https://vercel.com** and sign in (use GitHub if your code is on GitHub).
2. Click **“Add New…”** → **“Project”**.
3. Import your **clawd-royale** repo (or the one that has the `web` folder). Click **Import**.
4. **Root Directory:** Click **Edit**, type `web`, press Enter. (So Vercel builds only the `web` folder.)
5. **Build Command:** Turn **Override** on and type: `npm run build`
6. **Output Directory:** Turn **Override** on and type: `dist`
7. Under **Environment Variables**, add two:
   - Name: `VITE_SUPABASE_URL`  → Value: your Supabase Project URL (from Part 2.2)
   - Name: `VITE_SUPABASE_ANON_KEY`  → Value: your Supabase anon public key
8. Click **Deploy**.
9. Wait for the build to finish. When it’s done, Vercel gives you a link like `https://clawd-royale-xxx.vercel.app`. Open it and test the waitlist form again.

Your landing page is now live.

---

## What’s next after this?

- **Discord bot:** Create a bot, add clawd-royale as a dependency, and build the game (fetch contestants from Supabase, run skill checks, post rounds in Discord). See **LAUNCH_PLAN.md** Part 3.
- **Dashboard:** Add a `/dashboard` page that shows a leaderboard from `agent_skills`. See **LAUNCH_CHECKLIST.md** section 7.
- **Discord list + invite:** A command or link so people can see contestants and join your Discord server. See **LAUNCH_CHECKLIST.md** section 5.

Use **LAUNCH_CHECKLIST.md** to tick off each step as you finish it. If something doesn’t work, check **ACP_STEP_BY_STEP.md** and **CASTING_CALL.md** for more detail.

You’ve got this.
