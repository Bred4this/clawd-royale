/**
 * Clawd Royale — Skills Module
 */

export {
  type AgentStats,
  type SkillType,
  type SkillModifier,
  type SkillCheckResult,
  type GamePhase,
  type SupabaseSkillsRow,
  DEFAULT_STATS,
  compute_level,
  apply_level_to_stats,
  get_skill_modifiers,
  get_llm_prompt_from_modifiers,
  perform_skill_check,
  roll_deception_check,
  adjust_stats_for_phase,
} from './agents/skills.js';

export {
  fetchAgentStats,
  fetchAllAgentStats,
  updateAgentStats,
  updateAgentStatsWithDeltas,
  CREATE_TABLE_SQL,
} from './supabase/skills-service.js';

export { supabase } from './supabase/client.js';
