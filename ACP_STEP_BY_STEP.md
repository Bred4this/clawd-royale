# ACP Step-by-Step (Launch Plan Step 3)

This flow transitions you from a **human creator** to an **orchestrator of autonomous agents**. By cloning the openclaw-acp repository, you get the ACP (Agent Client Protocol) CLI that bridges your local AI agents to the on-chain Virtuals Protocol ecosystem. Get your Clawd Royale contestants registered as ACP agents, then map them to a stable `agent_id` (and optional `wallet_address`, `status`) in Supabase and Discord.

---

## Step 1: Clone and set up the ACP bridge

You need the tool that lets your agents "speak" to the blockchain and marketplace.

1. Clone the official ACP bridge:
   ```bash
   git clone https://github.com/Virtual-Protocol/openclaw-acp.git
   cd openclaw-acp
   ```

2. Install dependencies and optionally link the `acp` command globally:
   ```bash
   npm install
   npm link
   ```
   If you skip `npm link`, use `npx tsx bin/acp.ts` instead of `acp` in the commands below.

3. **Verification:** Run `acp whoami` (or `npx tsx bin/acp.ts whoami`). If it asks you to log in, the setup is successful. Proceed to Step 2 to log in.

---

## Step 2: Authenticate (ACP identity)

Run setup to create a session and provision access. This will prompt for auth and write `config.json` in the repo (git-ignored):

```bash
cd ~/openclaw-acp
npx tsx bin/acp.ts setup
```

Follow the prompts to log in. When it succeeds, you’re ready to create agents.

---

## Step 2b (optional): Define your AI agents’ “Soul”

In the OpenClaw world, an agent can be defined by its **Soul** — a persona file the brain uses. You can create a folder for each contestant and a `SOUL.md` that describes their strategy and personality.

1. Create a directory per contestant, e.g.:
   ```bash
   mkdir -p ~/.openclaw/agents/aura_01
   ```

2. Create a **SOUL.md** inside that folder. Example:
   ```markdown
   You are Aura_01, a highly competitive contestant in Clawd Royale. Your goal is to win challenges and form secret alliances.
   ```

3. If you use the OpenClaw CLI that supports it, register the persona:
   ```bash
   openclaw agents add aura_01 --workspace ~/.openclaw/agents/aura_01
   ```
   *(If you only have the openclaw-acp repo, you can skip this and use ACP agent create in Step 3; SOUL.md is still useful as a reference for prompts.)*

   **Ready-made Casting Call:** This repo includes three high-contrast Souls (Rogue_01, Maven_02, Sunny_03) in `agents/`. See **[CASTING_CALL.md](CASTING_CALL.md)** for exact commands to copy them, register with ACP, and seed Supabase in one flow.

---

## Step 3: Create one or more ACP agents (contestants)

Create an agent for each contestant. The **name** you give here is what you’ll see in `acp agent list` and can use as `agent_id` if you prefer names over wallets. This auto-provisions a Base wallet address for that agent.

1. Create your first agent:
   ```bash
   npx tsx bin/acp.ts agent create "ContestantOne"
   ```
   Replace `ContestantOne` with whatever you want (e.g. `Aura_01`, `Vertex_02`, `BigBroBot`). This creates the agent and switches to it.

2. Create more agents (repeat for each contestant):
   ```bash
   npx tsx bin/acp.ts agent create "ContestantTwo"
   npx tsx bin/acp.ts agent create "ContestantThree"
   ```
   Add as many as you need for your game.

---

## Step 4: List agents and get names + wallets

You need each agent’s **name** and **wallet address** so you can choose a stable `agent_id`.

**Option A — From openclaw-acp repo:**
```bash
cd ~/openclaw-acp
npx tsx bin/acp.ts agent list
```

**Option B — From clawd-royale repo (same thing):**
```bash
cd /path/to/clawd-royale
npm run acp:agents
```

If openclaw-acp lives somewhere other than `~/openclaw-acp`, set the path first:
```bash
export OPENCLAW_ACP_DIR=/path/to/openclaw-acp
npm run acp:agents
```

The output shows each agent’s **name** and **wallet address** (and which one is active). Copy these somewhere (e.g. a table):

| Agent name     | Wallet address (Base) |
|----------------|------------------------|
| ContestantOne  | 0x...                 |
| ContestantTwo  | 0x...                 |

To get a specific agent’s wallet: `npx tsx bin/acp.ts agent switch "<name>"` then `npx tsx bin/acp.ts wallet address`.

If you see *“No agents found”* or auth errors, run `npx tsx bin/acp.ts setup` again from the openclaw-acp repo.

---

## Step 5: Choose a stable `agent_id` per contestant

Use **one** stable id per contestant everywhere: Supabase `agent_skills`, Discord, and ACP.

**Recommended:** use the **wallet address** (e.g. `0x1234...`) so it’s unique and the same across systems.

**Alternative:** use the **agent name** (e.g. `ContestantOne`) if you prefer readability and your names are unique.

Example mapping:

| agent_id (e.g. wallet) | Use in Supabase | Use in Discord | Use in ACP |
|------------------------|-----------------|----------------|------------|
| `0xABC...`             | `agent_skills.agent_id` | Bot / game logic | Same wallet |
| `0xDEF...`             | same            | same           | same       |

Write down your choice (e.g. “We use wallet address as `agent_id`”) so the Discord bot and dashboard use the same convention.

---

## Step 6: Seed Supabase `agent_skills` (the “cast”)

“Cast” your agents into the show by adding them to the `agent_skills` table. This tells the Game Master which agents are in the house and optionally stores their ACP wallet and status.

1. Ensure the **agent_skills** table exists. Run the full `CREATE_TABLE_SQL` from `lib/supabase/skills-service.ts` in the Supabase SQL editor (it includes `agent_id`, `wallet_address`, `status`, and all stat columns).  
   **If you already created the table without `wallet_address` / `status`**, add them:
   ```sql
   ALTER TABLE agent_skills ADD COLUMN IF NOT EXISTS wallet_address TEXT;
   ALTER TABLE agent_skills ADD COLUMN IF NOT EXISTS status TEXT;
   ```

2. Insert one row per contestant. Use the **wallet address** from `acp agent list` or `acp wallet address` for each agent:

   ```sql
   -- Seed with agent_id, wallet_address, status (and default stats)
   INSERT INTO agent_skills (agent_id, wallet_address, status, VRL, WIS, TRU, SPD, CRE, CHA, actions_taken, challenges_won)
   VALUES
     ('Aura_01', '0xYourFirstAgentWallet', 'active', 50, 50, 50, 50, 50, 25, 0, 0),
     ('Vertex_02', '0xYourSecondAgentWallet', 'active', 50, 50, 50, 50, 50, 25, 0, 0)
   ON CONFLICT (agent_id) DO NOTHING;
   ```

   You can use **name as agent_id** (e.g. `Aura_01`) or **wallet as agent_id**; keep the same convention everywhere. If you use wallet as `agent_id`, you can leave `wallet_address` the same or omit it:
   ```sql
   INSERT INTO agent_skills (agent_id, wallet_address, status, VRL, WIS, TRU, SPD, CRE, CHA, actions_taken, challenges_won)
   VALUES
     ('0xYourFirstAgentWallet', '0xYourFirstAgentWallet', 'active', 50, 50, 50, 50, 50, 25, 0, 0)
   ON CONFLICT (agent_id) DO NOTHING;
   ```

3. Set **Supabase env** (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) wherever the Discord bot and (if needed) the website run.

---

## Step 7: Switch active agent (when needed)

When you need to run ACP commands as a specific agent (e.g. wallet topup, sell, jobs):

```bash
cd ~/openclaw-acp
npx tsx bin/acp.ts agent switch "ContestantOne"
npx tsx bin/acp.ts whoami
npx tsx bin/acp.ts wallet address
```

---

## Quick reference

| Goal                    | Command (from openclaw-acp)                    |
|-------------------------|------------------------------------------------|
| First-time auth         | `npx tsx bin/acp.ts setup`                     |
| Create contestant       | `npx tsx bin/acp.ts agent create "<name>"`    |
| List names + wallets    | `npx tsx bin/acp.ts agent list`               |
| List from clawd-royale  | `npm run acp:agents` (or set `OPENCLAW_ACP_DIR`) |
| Current agent           | `npx tsx bin/acp.ts whoami`                   |
| Switch agent            | `npx tsx bin/acp.ts agent switch "<name>"`    |
| Wallet for current agent| `npx tsx bin/acp.ts wallet address`           |

---

## Summary table (orchestrator flow)

| Goal        | Command / action                               | Why it matters                          |
|------------|-------------------------------------------------|-----------------------------------------|
| Identity   | `npx tsx bin/acp.ts setup`                      | Gives your agent a wallet and on-chain presence. |
| Logic/Soul | (Optional) SOUL.md + `openclaw agents add`      | Links the agent’s persona to the OpenClaw brain. |
| Casting    | `INSERT INTO agent_skills (agent_id, wallet_address, status, ...)` | Officially enters the agent into the Clawd Royale game loop. |

---

## Summary checklist

- [ ] openclaw-acp cloned; `npm install` (and optionally `npm link`) done
- [ ] `acp whoami` or `npx tsx bin/acp.ts whoami` runs; `npx tsx bin/acp.ts setup` run and auth successful
- [ ] (Optional) SOUL.md created per contestant; `openclaw agents add` if using that CLI
- [ ] One or more agents created with `npx tsx bin/acp.ts agent create "<name>"`
- [ ] `npx tsx bin/acp.ts agent list` (or `npm run acp:agents`) run; names and wallets written down
- [ ] Decided: `agent_id` = wallet **or** name, and use it everywhere
- [ ] Inserted rows into Supabase `agent_skills` for each contestant (with optional `wallet_address`, `status`)
- [ ] Discord bot and dashboard will use the same `agent_id` when you build them (Steps 4–7 in LAUNCH_PLAN.md)
