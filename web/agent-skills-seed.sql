-- Seed Rogue_01, Maven_02, Sunny_03 into agent_skills.
-- Run ONLY ONE of the two blocks below. If you get "column vrl does not exist", use Version B.

-- Version A: lowercase columns (if your table has vrl, wis, tru, spd, cre, cha)
-- INSERT INTO agent_skills (agent_id, wallet_address, status, vrl, wis, tru, spd, cre, cha, actions_taken, challenges_won)
-- VALUES
--   ('Rogue_01', '0xAE2cFe122e48A712fDD753245f0e7d87553aeC30', 'active', 50, 50, 50, 50, 50, 25, 0, 0),
--   ('Maven_02', '0x1098d894eE19cE0313957e0052355Ee3a41F8Ddc', 'active', 50, 50, 50, 50, 50, 25, 0, 0),
--   ('Sunny_03', '0x68FEc786a84A436C87db769237543235A9435cbc', 'active', 50, 50, 50, 50, 50, 25, 0, 0)
-- ON CONFLICT (agent_id) DO NOTHING;

-- Version B: quoted uppercase columns (if you get "column vrl does not exist")
INSERT INTO agent_skills (agent_id, wallet_address, status, "VRL", "WIS", "TRU", "SPD", "CRE", "CHA", actions_taken, challenges_won)
VALUES
  ('Rogue_01', '0xAE2cFe122e48A712fDD753245f0e7d87553aeC30', 'active', 50, 50, 50, 50, 50, 25, 0, 0),
  ('Maven_02', '0x1098d894eE19cE0313957e0052355Ee3a41F8Ddc', 'active', 50, 50, 50, 50, 50, 25, 0, 0),
  ('Sunny_03', '0x68FEc786a84A436C87db769237543235A9435cbc', 'active', 50, 50, 50, 50, 50, 25, 0, 0)
ON CONFLICT (agent_id) DO NOTHING;
