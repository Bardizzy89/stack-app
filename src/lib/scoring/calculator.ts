// =============================================
// EPIC 6: TECH HEALTH SCORE CALCULATOR
// =============================================
// Pure calculation functions (no server actions)

import type {
  ScoreCalculationInput,
  CalculatedScore,
  ScoreBreakdown,
} from '@/lib/types/scores'

const ALGORITHM_VERSION = 'epic-6-v1.0'

/**
 * Calculate Tech Health Score using Epic 6 formula
 *
 * Formula (weighted):
 *   tech_health_score =
 *     (gap_score / 20 * 20) +
 *     (redundancy_score / 20 * 20) +
 *     (outdated_score / 20 * 20) +
 *     (cost_efficiency_score / 40 * 40)
 *
 * Weights:
 *   - Gap Score: 20% (0-20 points)
 *   - Redundancy Score: 20% (0-20 points)
 *   - Outdated Score: 20% (0-20 points)
 *   - Cost Efficiency Score: 40% (0-40 points)
 *
 * @param input - Score calculation input data
 * @returns Calculated score with component breakdown
 */
export function calculateTechHealthScore(input: ScoreCalculationInput): CalculatedScore {
  // ========================================
  // STEP 1: Calculate Component Scores
  // ========================================

  // Gap Score (0-20): Already provided from gap analysis
  const gap_score = input.gap_score

  // Redundancy Score (0-20): Already provided from redundancy analysis
  const redundancy_score = input.redundancy_score

  // Outdated Score (0-20): Calculate based on number of outdated tools
  // Penalty: 5 points per outdated tool (max -20 penalty)
  const outdated_penalty = Math.min(20, input.outdated_tools_count * 5)
  const outdated_score = Math.max(0, 20 - outdated_penalty)

  // Cost Efficiency Score (0-40): Calculate based on savings ratio
  // Formula: 40 - (savings_ratio * 40)
  // - If no savings possible → score = 40 (perfect efficiency)
  // - If 100% waste → score = 0 (critical inefficiency)
  const cost_savings_ratio =
    input.total_monthly_spend > 0 ? input.total_monthly_savings / input.total_monthly_spend : 0

  // Clamp ratio to 0-1 range
  const clamped_ratio = Math.max(0, Math.min(1, cost_savings_ratio))

  const cost_efficiency_score = Math.round(40 - clamped_ratio * 40)

  // ========================================
  // STEP 2: Calculate Final Score (Weighted Sum)
  // ========================================

  // Since component scores are already in correct ranges,
  // the weighted sum is just the sum of all components
  const tech_health_score = Math.round(
    (gap_score / 20) * 20 +
      (redundancy_score / 20) * 20 +
      (outdated_score / 20) * 20 +
      (cost_efficiency_score / 40) * 40
  )

  // Ensure score is within 0-100 range
  const final_score = Math.max(0, Math.min(100, tech_health_score))

  // ========================================
  // STEP 3: Build Score Breakdown
  // ========================================

  const score_breakdown: ScoreBreakdown = {
    // Component scores
    gap_score,
    redundancy_score,
    outdated_score,
    cost_efficiency_score,

    // Input metrics
    total_monthly_spend: input.total_monthly_spend,
    total_monthly_savings: input.total_monthly_savings,
    cost_savings_ratio: clamped_ratio,

    // Penalties applied
    gap_penalty: 20 - gap_score,
    redundancy_penalty: 20 - redundancy_score,
    outdated_penalty: 20 - outdated_score,
    cost_penalty: 40 - cost_efficiency_score,

    // Calculation details
    missing_categories_count: input.missing_categories_count,
    redundant_sets_count: input.redundant_sets_count,
    outdated_tools_count: input.outdated_tools_count,

    // Formula used
    formula:
      '(gap_score/20 * 20) + (redundancy_score/20 * 20) + (outdated_score/20 * 20) + (cost_efficiency_score/40 * 40)',
    algorithm_version: ALGORITHM_VERSION,
  }

  // ========================================
  // STEP 4: Return Calculated Score
  // ========================================

  return {
    tech_health_score: final_score,
    gap_score,
    redundancy_score,
    outdated_score,
    cost_efficiency_score,
    score_breakdown,
  }
}
