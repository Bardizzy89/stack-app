// =============================================
// EPIC 6: TECH HEALTH SCORING SYSTEM - TYPES
// =============================================

/**
 * Component scores that make up the Tech Health Score
 */
export interface ComponentScores {
  gap_score: number // 0-20: Quality of category coverage
  redundancy_score: number // 0-20: Absence of overlapping tools
  outdated_score: number // 0-20: Modernity of tool choices
  cost_efficiency_score: number // 0-40: Spending efficiency (largest weight)
}

/**
 * Detailed breakdown of how the score was calculated
 * Provides transparency into the scoring algorithm
 */
export interface ScoreBreakdown extends ComponentScores {
  // Input metrics
  total_monthly_spend: number
  total_monthly_savings: number
  cost_savings_ratio: number

  // Penalties applied
  gap_penalty: number // 20 - gap_score
  redundancy_penalty: number // 20 - redundancy_score
  outdated_penalty: number // 20 - outdated_score
  cost_penalty: number // 40 - cost_efficiency_score

  // Calculation details
  missing_categories_count: number
  redundant_sets_count: number
  outdated_tools_count: number

  // Formula used
  formula: string
  algorithm_version: string
}

/**
 * Metadata about the scoring run
 */
export interface ScoreMetadata {
  algorithm_version: string // e.g., "epic-6-v1.0"
  triggered_by: 'comparison_engine' | 'manual_rerun'
  comparison_summary_id?: string // Link to comparison record
  execution_time_ms?: number
  model_used?: string // e.g., "gpt-4-turbo-preview"
}

/**
 * Full score record as stored in database
 */
export interface ScoreRecord extends ComponentScores {
  id: string
  stack_id: string

  // Final score (0-100)
  tech_health_score: number

  // Cost savings
  total_monthly_savings: number
  total_annual_savings: number

  // Structured data
  score_breakdown: ScoreBreakdown
  metadata: ScoreMetadata

  // Timestamps
  created_at: string
  updated_at: string
}

/**
 * Input data needed to calculate a score
 */
export interface ScoreCalculationInput {
  stack_id: string
  gap_score: number
  redundancy_score: number
  outdated_tools_count: number
  total_monthly_spend: number
  total_monthly_savings: number
  total_annual_savings: number
  missing_categories_count: number
  redundant_sets_count: number
}

/**
 * Result of score calculation (before saving)
 */
export interface CalculatedScore extends ComponentScores {
  tech_health_score: number
  score_breakdown: ScoreBreakdown
}

/**
 * Interpretation labels for Tech Health Score ranges
 */
export type ScoreInterpretation =
  | 'critical'    // 0-39: Urgent attention needed
  | 'needs-work'  // 40-59: Significant issues
  | 'fair'        // 60-74: Room for improvement
  | 'good'        // 75-89: Generally healthy
  | 'excellent'   // 90-100: Optimal configuration

/**
 * Get human-readable interpretation of a score
 */
export function getScoreInterpretation(score: number): ScoreInterpretation {
  if (score >= 90) return 'excellent'
  if (score >= 75) return 'good'
  if (score >= 60) return 'fair'
  if (score >= 40) return 'needs-work'
  return 'critical'
}

/**
 * Get display text for score interpretation
 */
export function getScoreInterpretationText(score: number): string {
  const interpretation = getScoreInterpretation(score)

  const labels: Record<ScoreInterpretation, string> = {
    excellent: 'Excellent - Optimal Configuration',
    good: 'Good - Generally Healthy',
    fair: 'Fair - Room for Improvement',
    'needs-work': 'Needs Work - Significant Issues',
    critical: 'Critical - Urgent Attention Needed',
  }

  return labels[interpretation]
}

/**
 * Get color class for score display
 */
export function getScoreColor(score: number): string {
  const interpretation = getScoreInterpretation(score)

  const colors: Record<ScoreInterpretation, string> = {
    excellent: 'text-green-600',
    good: 'text-green-500',
    fair: 'text-yellow-600',
    'needs-work': 'text-orange-600',
    critical: 'text-red-600',
  }

  return colors[interpretation]
}

/**
 * Get background color class for score badges
 */
export function getScoreBgColor(score: number): string {
  const interpretation = getScoreInterpretation(score)

  const colors: Record<ScoreInterpretation, string> = {
    excellent: 'bg-green-100 text-green-800',
    good: 'bg-green-50 text-green-700',
    fair: 'bg-yellow-100 text-yellow-800',
    'needs-work': 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  }

  return colors[interpretation]
}
