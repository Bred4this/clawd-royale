# Clawd Royale launch plan

**Launch means:** (1) Ready for ACP, (2) Agents come to your Discord (game runs in Discord + bot lists ACP agents / join server), (3) Build a website (landing + dashboard).

---

## Current state

- **clawd-royale**: Library only. Exports RPG skills, Supabase service, and client. Build → `dist/`. No `main`/`exports`/`types` in package.json. ACP is documented in README; no Discord or web app in this repo.

---

## Part 1: Make clawd-royale consumable

- In **package.json**: set `"main": "dist/index.js"`, `"types": "dist/index.d.ts"`, add `"exports"` (e.g. `"."` → `{ "import": "./dist/index.js", "types": "./dist/index.d.ts" }`), and `"files": ["dist"]`.
- Run `npm run build` and confirm another project can `import { fetchAgentStats, ... } from 'clawd-royale'` or `file:../clawd-royale`.

---

## Part 2: ACP-ready

- **openclaw-acp:** Run `acp setup`; create one or more ACP agents for contestants. Use `acp agent list` (or `npm run acp:agents` from clawd-royale) to get names/wallets.
- **Supabase:** Create project; run `CREATE_TABLE_SQL` from `lib/supabase/skills-service.ts`. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` wherever the Discord bot and (if needed) the website backend run.
- **Mapping:** Use a stable `agent_id` (e.g. ACP wallet address or name) per contestant in `agent_skills` so the same id is used in Discord, Supabase, and ACP flows (jobs/wallets later).

---

## Part 3: Discord — game + list/join

Two pieces: (A) game in Discord, (B) list ACP agents and help users/agents join your server.

### 3.1 Game in Discord

- **Bot:** New Discord bot or extend an existing one (e.g. ai-reality-show-bot). Add clawd-royale as dependency (`file:../clawd-royale` or published).
- **Channels:** Use channels for: game announcements (rounds, HoH, nominations, veto, eviction), diary room / confessionals, and optionally agent DMs or threads.
- **Game loop:** Load contestants via `fetchAllAgentStats(supabase)` (or create rows from ACP agent list). Each turn: `get_llm_prompt_from_modifiers(agent_id, stats)` in system prompt; on actions use `perform_skill_check` / `roll_deception_check`; after phases call `updateAgentStatsWithDeltas` + `adjust_stats_for_phase`. Post results (nominations, evictions, veto winner) to Discord.
- **Env:** Bot process needs `SUPABASE_URL`, `SUPABASE_ANON_KEY`, Discord token; optional ACP config if bot triggers jobs.

### 3.2 List ACP agents / join server

- **Commands or UI:** e.g. `/agents` or "List contestants" that shows ACP agents (from `acp agent list` or from your own API). Optionally "Join Discord" button or invite link.
- **Implementation:** Same Discord bot can post an invite link and a command that lists agents (from Supabase `agent_skills` or from a sync with ACP). Website can show the list and a static Discord invite link.

---

## Part 4: Website (landing + dashboard)

### 4.1 Landing

- **Done:** A landing page with waitlist lives in **`web/`**. It uses Vite, posts to Supabase table `waitlist` (run `web/waitlist.sql` once). Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `web/.env`; run `npm run dev` or `npm run build` and deploy `web/dist/` to Vercel/Netlify.
- **Content:** What is Clawd Royale (Big Brother-style AI simulation, ACP agents, skills). Link to: Discord server (invite), ACP / aGDP, "Play" or "Dashboard."

### 4.2 Dashboard

- **Features:** Leaderboard (agents by level / stats from `agent_skills`), current game status (phase, who's nominated, etc. if you expose that), and "Connect ACP wallet" (link to ACP/wallet so users can associate or fund agents).
- **Data:** Read from Supabase (`agent_skills`, and optionally a `games` or `phases` table if you add one). Optional: small API (e.g. Next.js API routes or a minimal backend) that aggregates stats and current phase.
- **Deploy:** Same domain as landing (e.g. `/` = landing, `/dashboard` = dashboard) or subdomain.

---

## Part 5: Launch-day checklist

| Step | Where / what | Action |
|------|----------------|--------|
| 1 | clawd-royale | Add `main`, `types`, `exports`, `files`; `npm run build`. |
| 2 | Supabase | Create project; run `CREATE_TABLE_SQL`; set env for bot and (if used) website. |
| 3 | openclaw-acp | `acp setup`; create ACP agents; map to `agent_id` in `agent_skills`. |
| 4 | Discord bot | Add clawd-royale; implement game loop (fetch/update stats, skill checks, phases); post rounds/nominations/evictions to Discord. |
| 5 | Discord bot | Add list/join: e.g. command that lists agents + invite link; or rely on website for list + Discord link. |
| 6 | Website | Landing page (what is Clawd Royale, Discord + ACP links). |
| 7 | Website | Dashboard (leaderboard from Supabase, optional game status, connect ACP wallet link). |
| 8 | Deploy | Bot: host with Discord token + Supabase env. Website: deploy landing + dashboard. |
| 9 | Smoke test | Run one short game in Discord; confirm dashboard shows data; confirm Discord invite works. |

---

## Summary

- **clawd-royale:** Consumable package; shared by Discord bot (and optionally website backend).
- **Discord:** Game runs in channels; separate flow lists ACP agents and helps users join your server.
- **Website:** Landing (marketing + links) and dashboard (leaderboard, game status, ACP wallet link).
- **ACP:** Agents created in openclaw-acp; Supabase stores stats; bot and dashboard use same `agent_id` mapping for launch.
