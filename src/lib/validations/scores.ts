// =============================================
// EPIC 6: TECH HEALTH SCORING SYSTEM - VALIDATION
// =============================================

import { z } from 'zod'

/**
 * Component scores validation
 */
export const componentScoresSchema = z.object({
  gap_score: z.number().int().min(0).max(20),
  redundancy_score: z.number().int().min(0).max(20),
  outdated_score: z.number().int().min(0).max(20),
  cost_efficiency_score: z.number().int().min(0).max(40),
})

/**
 * Score breakdown validation
 */
export const scoreBreakdownSchema = componentScoresSchema.extend({
  total_monthly_spend: z.number().min(0),
  total_monthly_savings: z.number().min(0),
  cost_savings_ratio: z.number().min(0).max(1),

  gap_penalty: z.number().int().min(0).max(20),
  redundancy_penalty: z.number().int().min(0).max(20),
  outdated_penalty: z.number().int().min(0).max(20),
  cost_penalty: z.number().int().min(0).max(40),

  missing_categories_count: z.number().int().min(0),
  redundant_sets_count: z.number().int().min(0),
  outdated_tools_count: z.number().int().min(0),

  formula: z.string(),
  algorithm_version: z.string(),
})

/**
 * Score metadata validation
 */
export const scoreMetadataSchema = z.object({
  algorithm_version: z.string(),
  triggered_by: z.enum(['comparison_engine', 'manual_rerun']),
  comparison_summary_id: z.string().uuid().optional(),
  execution_time_ms: z.number().optional(),
  model_used: z.string().optional(),
})

/**
 * Full score record validation
 */
export const scoreRecordSchema = componentScoresSchema.extend({
  id: z.string().uuid(),
  stack_id: z.string().uuid(),
  tech_health_score: z.number().int().min(0).max(100),
  total_monthly_savings: z.number().min(0),
  total_annual_savings: z.number().min(0),
  score_breakdown: scoreBreakdownSchema,
  metadata: scoreMetadataSchema,
  created_at: z.string(),
  updated_at: z.string(),
})

/**
 * Score calculation input validation
 */
export const scoreCalculationInputSchema = z.object({
  stack_id: z.string().uuid(),
  gap_score: z.number().int().min(0).max(20),
  redundancy_score: z.number().int().min(0).max(20),
  outdated_tools_count: z.number().int().min(0),
  total_monthly_spend: z.number().min(0),
  total_monthly_savings: z.number().min(0),
  total_annual_savings: z.number().min(0),
  missing_categories_count: z.number().int().min(0),
  redundant_sets_count: z.number().int().min(0),
})

/**
 * Calculated score validation
 */
export const calculatedScoreSchema = componentScoresSchema.extend({
  tech_health_score: z.number().int().min(0).max(100),
  score_breakdown: scoreBreakdownSchema,
})
