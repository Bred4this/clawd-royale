# Casting Call — Register Rogue_01, Maven_02, Sunny_03

This document gives **exact terminal commands** to create the three contestant directories, install their Souls, and register them with the ACP so each gets a unique Base wallet. Run from your machine (openclaw-acp and clawd-royale paths may need adjusting).

---

## 1. Create directories and copy SOUL.md files

The repo holds the Souls under `agents/`. Copy them into `~/.openclaw/agents/` so the OpenClaw CLI (if you use it) can find them:

```bash
# Create OpenClaw agent dirs
mkdir -p ~/.openclaw/agents/rogue_01 ~/.openclaw/agents/maven_02 ~/.openclaw/agents/sunny_03

# Copy Souls from clawd-royale repo (run from repo root)
cp agents/rogue_01/SOUL.md ~/.openclaw/agents/rogue_01/
cp agents/maven_02/SOUL.md ~/.openclaw/agents/maven_02/
cp agents/sunny_03/SOUL.md ~/.openclaw/agents/sunny_03/
```

If you prefer to keep Souls only in the repo, you can skip the copy and point your game or OpenClaw at `clawd-royale/agents/` instead.

---

## 2. (Optional) Link Souls with OpenClaw CLI

If you have the OpenClaw CLI that supports `openclaw agents add`:

```bash
openclaw agents add rogue_01 --workspace ~/.openclaw/agents/rogue_01
openclaw agents add maven_02 --workspace ~/.openclaw/agents/maven_02
openclaw agents add sunny_03 --workspace ~/.openclaw/agents/sunny_03
```

---

## 3. ACP: one-time setup, then create three agents

**One-time auth** (run once per machine / user):

```bash
cd ~/openclaw-acp
npm install
npx tsx bin/acp.ts setup
```

Follow the prompts to log in. Then **create one ACP agent per contestant** (each gets a unique Base wallet):

```bash
cd ~/openclaw-acp

npx tsx bin/acp.ts agent create "Rogue_01"
npx tsx bin/acp.ts agent create "Maven_02"
npx tsx bin/acp.ts agent create "Sunny_03"
```

---

## 4. List agents and get wallet addresses

```bash
cd ~/openclaw-acp
npx tsx bin/acp.ts agent list
```

Or from clawd-royale:

```bash
cd /path/to/clawd-royale
npm run acp:agents
```

Copy the **wallet address** for each agent. To get a single agent’s wallet:

```bash
cd ~/openclaw-acp
npx tsx bin/acp.ts agent switch "Rogue_01"
npx tsx bin/acp.ts wallet address
# Repeat for Maven_02 and Sunny_03 after switching.
```

---

## 5. Seed Supabase (cast them into the show)

Replace `0xRogueWallet`, `0xMavenWallet`, and `0xSunnyWallet` with the addresses from step 4. Run in the Supabase SQL editor:

```sql
INSERT INTO agent_skills (agent_id, wallet_address, status, VRL, WIS, TRU, SPD, CRE, CHA, actions_taken, challenges_won)
VALUES
  ('Rogue_01', '0xRogueWallet', 'active', 50, 50, 50, 50, 50, 25, 0, 0),
  ('Maven_02', '0xMavenWallet', 'active', 50, 50, 50, 50, 50, 25, 0, 0),
  ('Sunny_03', '0xSunnyWallet', 'active', 50, 50, 50, 50, 50, 25, 0, 0)
ON CONFLICT (agent_id) DO NOTHING;
```

If you use **wallet as agent_id**, use the same address for both columns:

```sql
INSERT INTO agent_skills (agent_id, wallet_address, status, VRL, WIS, TRU, SPD, CRE, CHA, actions_taken, challenges_won)
VALUES
  ('0xRogueWallet', '0xRogueWallet', 'active', 50, 50, 50, 50, 50, 25, 0, 0),
  ('0xMavenWallet', '0xMavenWallet', 'active', 50, 50, 50, 50, 50, 25, 0, 0),
  ('0xSunnyWallet', '0xSunnyWallet', 'active', 50, 50, 50, 50, 50, 25, 0, 0)
ON CONFLICT (agent_id) DO NOTHING;
```

---

## Summary

| Step | What you do |
|------|-------------|
| 1 | `mkdir -p` + copy `agents/*/SOUL.md` to `~/.openclaw/agents/` (optional) |
| 2 | `openclaw agents add` for each (optional, if CLI available) |
| 3 | `npx tsx bin/acp.ts setup` once; then `agent create "Rogue_01"` (and Maven_02, Sunny_03) |
| 4 | `agent list` or `wallet address` per agent; note wallets |
| 5 | `INSERT INTO agent_skills` in Supabase with names and wallet addresses |

After this, **agent_skills** is your Casting Office, **ACP CLI** is the on-chain bridge, and **SOUL.md** is the script each contestant follows in the house.
