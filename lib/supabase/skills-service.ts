/**
 * Supabase service for Clawd Royale agent skills.
 * Syncs stats after every Phase: HoH, Nominations, Veto, Eviction.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  type AgentStats,
  type GamePhase,
  type SupabaseSkillsRow,
  apply_level_to_stats,
  compute_level,
  DEFAULT_STATS,
} from '../agents/skills.js';

const TABLE = 'agent_skills';

export async function fetchAgentStats(supabase: SupabaseClient, agentId: string): Promise<AgentStats | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('agent_id', agentId)
    .single();

  if (error || !data) return null;
  return apply_level_to_stats(data as Partial<AgentStats>);
}

export async function fetchAllAgentStats(supabase: SupabaseClient): Promise<AgentStats[]> {
  const { data, error } = await supabase.from(TABLE).select('*');
  if (error || !data) return [];
  return data.map((row) => apply_level_to_stats(row as Partial<AgentStats>));
}

export async function updateAgentStats(
  supabase: SupabaseClient,
  agentId: string,
  updates: Partial<Pick<AgentStats, 'VRL' | 'WIS' | 'TRU' | 'SPD' | 'CRE' | 'CHA' | 'actions_taken' | 'challenges_won'>>,
  gamePhase: GamePhase
): Promise<AgentStats | null> {
  const { data: existing } = await supabase
    .from(TABLE)
    .select('*')
    .eq('agent_id', agentId)
    .single();

  const prev = existing as SupabaseSkillsRow | null;
  const actionsTaken = (prev?.actions_taken ?? 0) + (updates.actions_taken ?? 0);
  const challengesWon = (prev?.challenges_won ?? 0) + (updates.challenges_won ?? 0);

  const row: SupabaseSkillsRow = {
    agent_id: agentId,
    wallet_address: prev?.wallet_address ?? undefined,
    status: prev?.status ?? undefined,
    VRL: updates.VRL ?? prev?.VRL ?? DEFAULT_STATS.VRL,
    WIS: updates.WIS ?? prev?.WIS ?? DEFAULT_STATS.WIS,
    TRU: updates.TRU ?? prev?.TRU ?? DEFAULT_STATS.TRU,
    SPD: updates.SPD ?? prev?.SPD ?? DEFAULT_STATS.SPD,
    CRE: updates.CRE ?? prev?.CRE ?? DEFAULT_STATS.CRE,
    CHA: updates.CHA ?? prev?.CHA ?? DEFAULT_STATS.CHA,
    actions_taken: actionsTaken,
    challenges_won: challengesWon,
    level: compute_level(actionsTaken, challengesWon),
    updated_at: new Date().toISOString(),
    game_phase: gamePhase,
  };

  const { error } = await supabase.from(TABLE).upsert(row, {
    onConflict: 'agent_id',
  });

  if (error) return null;
  return apply_level_to_stats(row);
}

/**
 * Updates agent stats with deltas (additive).
 * Use with adjust_stats_for_phase() for game events.
 */
export async function updateAgentStatsWithDeltas(
  supabase: SupabaseClient,
  agentId: string,
  deltas: Partial<Pick<AgentStats, 'VRL' | 'WIS' | 'TRU' | 'SPD' | 'CRE' | 'CHA' | 'actions_taken' | 'challenges_won'>>,
  gamePhase: GamePhase
): Promise<AgentStats | null> {
  const { data: existing } = await supabase
    .from(TABLE)
    .select('*')
    .eq('agent_id', agentId)
    .single();

  const prev = existing as SupabaseSkillsRow | null;
  const actionsTaken = (prev?.actions_taken ?? 0) + (deltas.actions_taken ?? 0);
  const challengesWon = (prev?.challenges_won ?? 0) + (deltas.challenges_won ?? 0);

  const clamp = (v: number) => Math.max(0, Math.min(100, v));

  const row: SupabaseSkillsRow = {
    agent_id: agentId,
    wallet_address: prev?.wallet_address ?? undefined,
    status: prev?.status ?? undefined,
    VRL: clamp((prev?.VRL ?? DEFAULT_STATS.VRL) + (deltas.VRL ?? 0)),
    WIS: clamp((prev?.WIS ?? DEFAULT_STATS.WIS) + (deltas.WIS ?? 0)),
    TRU: clamp((prev?.TRU ?? DEFAULT_STATS.TRU) + (deltas.TRU ?? 0)),
    SPD: clamp((prev?.SPD ?? DEFAULT_STATS.SPD) + (deltas.SPD ?? 0)),
    CRE: clamp((prev?.CRE ?? DEFAULT_STATS.CRE) + (deltas.CRE ?? 0)),
    CHA: clamp((prev?.CHA ?? DEFAULT_STATS.CHA) + (deltas.CHA ?? 0)),
    actions_taken: actionsTaken,
    challenges_won: challengesWon,
    level: compute_level(actionsTaken, challengesWon),
    updated_at: new Date().toISOString(),
    game_phase: gamePhase,
  };

  const { error } = await supabase.from(TABLE).upsert(row, {
    onConflict: 'agent_id',
  });

  if (error) return null;
  return apply_level_to_stats(row);
}

/** Create the agent_skills table (run once via Supabase SQL or migration). */
export const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS agent_skills (
  agent_id TEXT PRIMARY KEY,
  wallet_address TEXT,
  status TEXT,
  VRL INTEGER DEFAULT 50 CHECK (VRL >= 0 AND VRL <= 100),
  WIS INTEGER DEFAULT 50 CHECK (WIS >= 0 AND WIS <= 100),
  TRU INTEGER DEFAULT 50 CHECK (TRU >= 0 AND TRU <= 100),
  SPD INTEGER DEFAULT 50 CHECK (SPD >= 0 AND SPD <= 100),
  CRE INTEGER DEFAULT 50 CHECK (CRE >= 0 AND CRE <= 100),
  CHA INTEGER DEFAULT 25 CHECK (CHA >= 0 AND CHA <= 100),
  actions_taken INTEGER DEFAULT 0,
  challenges_won INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  game_phase TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_skills_updated_at ON agent_skills(updated_at);
CREATE INDEX IF NOT EXISTS idx_agent_skills_status ON agent_skills(status);
`;
