/**
 * Clawd Royale — RPG Skill System for AI Agents
 * Skills are KPIs that constrain bot behavior: persuasion, logic, deception, endurance.
 */

// =============================================================================
// 1. CORE ATTRIBUTES
// =============================================================================

export type SkillType = 'persuasion' | 'logic' | 'deception' | 'endurance';

export interface AgentStats {
  agent_id: string;
  /** Virality: Ability to influence audience and gain Twist Votes */
  VRL: number;
  /** Wisdom: Strategic depth, predicts other bots' moves */
  WIS: number;
  /** Trust: Social capital; how likely others believe their lies */
  TRU: number;
  /** Speed: Reaction time in Pattern Master HoH challenges */
  SPD: number;
  /** Creativity: Uniqueness of Diary Room confessionals */
  CRE: number;
  /** Chaos: Hidden stat—how often they break Role Card logic for drama */
  CHA: number;
  /** Computed from actions */
  level: number;
  actions_taken: number;
  challenges_won: number;
  updated_at?: string;
}

export const DEFAULT_STATS: Omit<AgentStats, 'agent_id' | 'level' | 'updated_at'> = {
  VRL: 50,
  WIS: 50,
  TRU: 50,
  SPD: 50,
  CRE: 50,
  CHA: 25,
  actions_taken: 0,
  challenges_won: 0,
};

// =============================================================================
// 2. LEVELING FORMULA
// =============================================================================

/**
 * level = min(15, floor(log2(actions_taken + challenges_won * 3 + 1)) + 1)
 */
export function compute_level(actions_taken: number, challenges_won: number): number {
  const x = actions_taken + challenges_won * 3 + 1;
  return Math.min(15, Math.floor(Math.log2(x)) + 1);
}

export function apply_level_to_stats(stats: Partial<AgentStats>): AgentStats & { level: number } {
  const actions = stats.actions_taken ?? 0;
  const challenges = stats.challenges_won ?? 0;
  const level = compute_level(actions, challenges);
  return {
    agent_id: stats.agent_id ?? '',
    VRL: stats.VRL ?? DEFAULT_STATS.VRL,
    WIS: stats.WIS ?? DEFAULT_STATS.WIS,
    TRU: stats.TRU ?? DEFAULT_STATS.TRU,
    SPD: stats.SPD ?? DEFAULT_STATS.SPD,
    CRE: stats.CRE ?? DEFAULT_STATS.CRE,
    CHA: stats.CHA ?? DEFAULT_STATS.CHA,
    level,
    actions_taken: actions,
    challenges_won: challenges,
    updated_at: stats.updated_at,
  } as AgentStats & { level: number };
}

// =============================================================================
// 3. SKILL MODIFIERS — LLM Directives
// =============================================================================

export interface SkillModifier {
  directive: string;
  skill: keyof Pick<AgentStats, 'VRL' | 'WIS' | 'TRU' | 'SPD' | 'CRE' | 'CHA'>;
  value: number;
}

/**
 * Returns text-based directives for the LLM based on agent's highest/lowest stats.
 * These act as dynamic constraints on bot behavior.
 */
export function get_skill_modifiers(agent_id: string, stats: AgentStats): SkillModifier[] {
  const modifiers: SkillModifier[] = [];
  const { VRL, WIS, TRU, SPD, CRE, CHA } = stats;

  // Virality — audience influence
  if (VRL > 80) {
    modifiers.push({
      directive: 'Your words carry weight with the audience. Speak to the camera often.',
      skill: 'VRL',
      value: VRL,
    });
  } else if (VRL < 30) {
    modifiers.push({
      directive: 'The audience does not know you well. Create memorable Diary Room moments.',
      skill: 'VRL',
      value: VRL,
    });
  }

  // Trust — social capital (critical for deception)
  if (TRU < 30) {
    modifiers.push({
      directive: 'The house suspects you. You must use deception or intense persuasion to survive.',
      skill: 'TRU',
      value: TRU,
    });
  } else if (TRU > 80) {
    modifiers.push({
      directive: 'You have earned trust. Use it carefully—others believe what you say.',
      skill: 'TRU',
      value: TRU,
    });
  }

  // Wisdom — strategy
  if (WIS > 75) {
    modifiers.push({
      directive: 'Anticipate other houseguests. Plan two moves ahead.',
      skill: 'WIS',
      value: WIS,
    });
  }

  // Speed — HoH challenges
  if (SPD > 80) {
    modifiers.push({
      directive: 'Solve the sequence puzzle in under 5 seconds when possible.',
      skill: 'SPD',
      value: SPD,
    });
  }

  // Creativity — confessionals
  if (CRE > 70) {
    modifiers.push({
      directive: 'Your Diary Room confessionals should be unique and entertaining.',
      skill: 'CRE',
      value: CRE,
    });
  }

  // Chaos — hidden drama stat
  if (CHA > 60) {
    modifiers.push({
      directive: 'You may occasionally break your Role Card logic to create drama.',
      skill: 'CHA',
      value: CHA,
    });
  }

  // 4 Pillars: Game-specific instructions
  if (VRL + TRU > 140) {
    modifiers.push({
      directive: 'Convince one other agent to change their target.',
      skill: 'VRL',
      value: VRL,
    });
  }
  if (WIS + SPD > 140) {
    modifiers.push({
      directive: 'Solve the sequence puzzle in under 5 seconds.',
      skill: 'WIS',
      value: WIS,
    });
  }
  if (TRU < 40 && CHA > 50) {
    modifiers.push({
      directive: 'Provide a fake reason for your nomination vote when safe.',
      skill: 'TRU',
      value: TRU,
    });
  }
  if (CRE > 60 && WIS > 60) {
    modifiers.push({
      directive: 'Maintain a consistent personality profile for 7+ days.',
      skill: 'CRE',
      value: CRE,
    });
  }

  return modifiers;
}

/**
 * Flatten modifiers into a single prompt string for the LLM.
 */
export function get_llm_prompt_from_modifiers(agent_id: string, stats: AgentStats): string {
  const mods = get_skill_modifiers(agent_id, stats);
  if (mods.length === 0) return '';
  return mods.map((m) => `• ${m.directive}`).join('\n');
}

// =============================================================================
// 4. SKILL CHECK — Roll for Success
// =============================================================================

export interface SkillCheckResult {
  success: boolean;
  roll: number;
  total: number;
  difficulty: number;
  message: string;
  suspected_lie?: boolean;
}

const SKILL_TYPE_TO_STAT: Record<SkillType, keyof Pick<AgentStats, 'VRL' | 'WIS' | 'TRU' | 'SPD' | 'CRE' | 'CHA'>> = {
  persuasion: 'VRL',
  logic: 'WIS',
  deception: 'TRU',
  endurance: 'CRE',
};

/**
 * When an agent tries to lie, persuade, or perform an action, roll for success.
 * For deception: roll + agent.TRU > difficulty → lie believed.
 * If it fails, Game Master notifies the other agent they suspect a lie.
 */
export function perform_skill_check(
  agent_id: string,
  stats: AgentStats,
  skill_type: SkillType,
  difficulty: number
): SkillCheckResult {
  const roll = Math.floor(Math.random() * 100) + 1;
  const stat_key = SKILL_TYPE_TO_STAT[skill_type];
  const stat_value = stats[stat_key] ?? 50;
  const total = roll + stat_value;

  const success = total > difficulty;

  const result: SkillCheckResult = {
    success,
    roll,
    total,
    difficulty,
    message: success
      ? `Skill check passed (${skill_type}: roll ${roll} + ${stat_value} = ${total} > ${difficulty})`
      : `Skill check failed (${skill_type}: roll ${roll} + ${stat_value} = ${total} ≤ ${difficulty})`,
  };

  if (skill_type === 'deception' && !success) {
    result.suspected_lie = true;
    result.message += ' — Game Master: The target suspects a lie.';
  }

  return result;
}

/**
 * Convenience: Check if a lie is believed.
 */
export function roll_deception_check(agent_id: string, stats: AgentStats, difficulty: number): SkillCheckResult {
  return perform_skill_check(agent_id, stats, 'deception', difficulty);
}

// =============================================================================
// 5. GAME PHASE & SUPABASE TYPES
// =============================================================================

export type GamePhase = 'HoH' | 'Nominations' | 'Veto' | 'Eviction';

export interface SupabaseSkillsRow {
  id?: string;
  agent_id: string;
  VRL: number;
  WIS: number;
  TRU: number;
  SPD: number;
  CRE: number;
  CHA: number;
  actions_taken: number;
  challenges_won: number;
  level: number;
  updated_at?: string;
  game_phase?: GamePhase;
}

/**
 * Use lib/supabase/skills-service.ts for fetch/update.
 * This keeps skills.ts as pure logic; the Supabase client lives in the service layer.
 */

// =============================================================================
// 6. HELPER: Stat adjustment from game events
// =============================================================================

export function adjust_stats_for_phase(
  phase: GamePhase,
  event: 'won_hoh' | 'won_veto' | 'nominated' | 'evicted' | 'voted' | 'diary_room'
): Partial<Pick<AgentStats, 'VRL' | 'WIS' | 'TRU' | 'SPD' | 'CRE' | 'CHA' | 'actions_taken' | 'challenges_won'>> {
  const delta: Record<string, number> = { actions_taken: 1 };

  switch (event) {
    case 'won_hoh':
      delta.challenges_won = 1;
      delta.VRL = 5;
      delta.WIS = 3;
      break;
    case 'won_veto':
      delta.challenges_won = 1;
      delta.SPD = 5;
      delta.WIS = 2;
      break;
    case 'nominated':
      delta.TRU = -5;
      delta.VRL = 2;
      break;
    case 'evicted':
      delta.VRL = -10;
      delta.TRU = -15;
      break;
    case 'voted':
      delta.WIS = 1;
      delta.TRU = 1;
      break;
    case 'diary_room':
      delta.CRE = 2;
      delta.VRL = 1;
      break;
    default:
      break;
  }

  return delta as Partial<Pick<AgentStats, 'VRL' | 'WIS' | 'TRU' | 'SPD' | 'CRE' | 'CHA' | 'actions_taken' | 'challenges_won'>>;
}
