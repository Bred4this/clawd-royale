# Clawd Royale — Launch Checklist

**How to use:** Click the checkbox in the editor (or toggle `[ ]` → `[x]`) when you finish a step. Unchecked items are what we work on next.

**Hand-holding:** See **[NEXT_STEPS.md](NEXT_STEPS.md)** for ordered, copy-paste steps (build → Supabase → ACP → cast → verify).

---

## 1. Package consumable

- [x] **1.1** `package.json` has `main`, `types`, `exports`, `files`
- [ ] **1.2** Run `npm run build` and confirm `dist/` is built

---

## 2. Supabase

- [ ] **2.1** Create Supabase project (or use existing)
- [ ] **2.2** Run `CREATE_TABLE_SQL` from `lib/supabase/skills-service.ts` in SQL editor (creates `agent_skills`)
- [ ] **2.3** Run `web/waitlist.sql` in SQL editor (creates `waitlist` table)
- [ ] **2.4** Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` where bot/backend will run
- [ ] **2.5** Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `web/.env` for landing

---

## 3. ACP (contestants)

- [ ] **3.1** Clone openclaw-acp (e.g. `~/openclaw-acp`); `npm install` (optional: `npm link`; verify with `acp whoami`)
- [ ] **3.2** Run `npx tsx bin/acp.ts setup` and complete auth
- [ ] **3.2b** (Optional) Define SOUL.md per contestant; `openclaw agents add <name>` if using that CLI
- [ ] **3.3** Create one or more agents: `npx tsx bin/acp.ts agent create "<Name>"`
- [ ] **3.4** Run `npm run acp:agents` (from clawd-royale) and write down names/wallets
- [ ] **3.5** Choose `agent_id` rule (wallet or name); same everywhere
- [ ] **3.6** Seed `agent_skills` in Supabase (INSERT with `agent_id`, optional `wallet_address`, `status`) — see [ACP_STEP_BY_STEP.md](ACP_STEP_BY_STEP.md) Step 6

---

## 4. Discord bot — game

- [ ] **4.1** Create or choose Discord bot; get token
- [ ] **4.2** Add clawd-royale as dependency (`file:../clawd-royale` or published)
- [ ] **4.3** Implement game loop: fetch contestants, skill checks, phases; post to channels
- [ ] **4.4** Set bot env: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, Discord token

---

## 5. Discord bot — list / join

- [ ] **5.1** Add command or UI that lists contestants (e.g. `/agents` or from Supabase)
- [ ] **5.2** Add Discord invite link (command or static link)

---

## 6. Website — landing

- [ ] **6.1** Landing runs locally: `cd web && npm install && npm run dev`
- [ ] **6.2** Add links: Discord invite, ACP / aGDP, Dashboard (or “Play”)
- [ ] **6.3** Deploy landing (e.g. Vercel/Netlify; root `web/`, build `npm run build`, output `web/dist`)

---

## 7. Website — dashboard

- [ ] **7.1** Add `/dashboard` (or dashboard route): leaderboard from `agent_skills`
- [ ] **7.2** Optional: current game status (phase, nominated)
- [ ] **7.3** Optional: “Connect ACP wallet” link
- [ ] **7.4** Deploy dashboard with landing (same domain or subdomain)

---

## 8. Deploy & smoke test

- [ ] **8.1** Bot hosted with Discord token + Supabase env
- [ ] **8.2** Website deployed (landing + dashboard)
- [ ] **8.3** Run one short game in Discord; confirm dashboard shows data; confirm Discord invite works

---

**Detail:** [LAUNCH_PLAN.md](LAUNCH_PLAN.md) · **ACP walkthrough:** [ACP_STEP_BY_STEP.md](ACP_STEP_BY_STEP.md)
