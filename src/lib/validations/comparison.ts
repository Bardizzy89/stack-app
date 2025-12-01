import { z } from 'zod'

/**
 * Zod validation schemas for Comparison Engine (Epic 5)
 */

// =============================================
// GAP DETECTION SCHEMAS
// =============================================

const gapSeverityEnum = z.enum(['critical', 'important', 'nice-to-have'])

const toolCategoryEnum = z.enum([
  'crm',
  'project_management',
  'accounting',
  'file_storage',
  'communications',
  'automation',
  'ai_tools',
  'hr_payroll',
  'security',
])

export const missingCategorySchema = z.object({
  category: toolCategoryEnum,
  category_name: z.string(),
  severity: gapSeverityEnum,
  reasoning: z.string().min(10).max(500),
  penalty: z.number().int().min(-5).max(0),
})

export const gapAnalysisSchema = z.object({
  missing_categories: z.array(missingCategorySchema),
  gap_score: z.number().int().min(0).max(20),
  total_penalty: z.number().int().min(-100).max(0),
})

// =============================================
// REDUNDANCY DETECTION SCHEMAS
// =============================================

const redundancySeverityEnum = z.enum(['acceptable', 'mild', 'wasteful', 'severe'])

export const redundantSetSchema = z.object({
  tools: z.array(z.string()).min(2),
  category: z.union([toolCategoryEnum, z.literal('cross-category')]),
  severity: redundancySeverityEnum,
  overlap_reason: z.string().min(10).max(500),
  functional_overlap_percentage: z.number().min(0).max(100).optional(),
  monthly_waste: z.number().min(0),
  recommended_action: z.string().min(10).max(300),
})

export const redundancyAnalysisSchema = z.object({
  items: z.array(redundantSetSchema),
  redundancy_score: z.number().int().min(0).max(20),
  total_redundancy_savings: z.number().min(0),
  by_severity: z.object({
    acceptable: z.number().int().min(0),
    mild: z.number().int().min(0),
    wasteful: z.number().int().min(0),
    severe: z.number().int().min(0),
  }),
})

// =============================================
// OUTDATED TOOL DETECTION SCHEMAS
// =============================================

const issueTypeEnum = z.enum(['outdated', 'overpriced', 'free_alternative', 'better_fit'])
const confidenceEnum = z.enum(['high', 'medium', 'low'])

export const outdatedToolSchema = z.object({
  tool: z.string(),
  category: toolCategoryEnum,
  issue_type: issueTypeEnum,
  issue: z.string().min(10).max(500),
  current_cost: z.number().min(0),
  recommended_replacement: z.string(),
  replacement_cost: z.number().min(0),
  replacement_website: z.string().url().optional(),
  monthly_savings: z.number(),
  annual_savings: z.number(),
  confidence: confidenceEnum,
  additional_benefits: z.array(z.string()).optional(),
})

export const stackAnalysisSchema = z.object({
  outdated_tools: z.array(outdatedToolSchema),
  total_outdated_savings: z.number().min(0),
  by_issue_type: z.object({
    outdated: z.number().int().min(0),
    overpriced: z.number().int().min(0),
    free_alternative: z.number().int().min(0),
    better_fit: z.number().int().min(0),
  }),
})

// =============================================
// COST SAVINGS SCHEMAS
// =============================================

export const costSavingsBreakdownSchema = z.object({
  redundancy_savings: z.number().min(0),
  outdated_savings: z.number().min(0),
  overpriced_savings: z.number().min(0),
  free_tier_savings: z.number().min(0),
  total_monthly_savings: z.number().min(0),
  total_annual_savings: z.number().min(0),
})

// =============================================
// VISUALIZATION DATA SCHEMAS
// =============================================

export const overlapMapDataSchema = z.object({
  categories: z.record(
    toolCategoryEnum,
    z.object({
      tools: z.array(z.string()),
      has_redundancy: z.boolean(),
      redundancy_severity: redundancySeverityEnum.optional(),
      total_monthly_cost: z.number().min(0),
    })
  ),
})

export const architectureLayerSchema = z.object({
  layer: z.string(),
  category: toolCategoryEnum,
  primary: z.string().nullable(),
  secondary: z.array(z.string()),
  redundant: z.array(z.string()),
  missing: z.boolean(),
  recommended: z.string(),
})

// =============================================
// ACTION ITEMS SCHEMAS
// =============================================

const actionTypeEnum = z.enum(['remove', 'replace', 'add', 'optimize'])
const priorityEnum = z.enum(['high', 'medium', 'low'])

export const actionItemSchema = z.object({
  id: z.string(),
  action: z.string().min(10).max(300),
  type: actionTypeEnum,
  tool: z.string(),
  replacement: z.string().optional(),
  monthly_savings: z.number().min(0),
  annual_savings: z.number().min(0),
  priority: priorityEnum,
  category: toolCategoryEnum,
})

// =============================================
// COMPARISON SUMMARY SCHEMA (MAIN)
// =============================================

export const comparisonSummarySchema = z.object({
  // Core analyses
  gaps: gapAnalysisSchema,
  redundancy: redundancyAnalysisSchema,
  stack_analysis: stackAnalysisSchema,

  // Visualizations
  overlap_map: overlapMapDataSchema,
  architecture_layers: z.array(architectureLayerSchema),

  // Aggregated metrics
  tech_health_score: z.number().int().min(0).max(100),
  total_monthly_savings: z.number().min(0),
  total_annual_savings: z.number().min(0),
  savings_breakdown: costSavingsBreakdownSchema,

  // Narrative and recommendations
  narrative_summary: z.string().min(50).max(2000),
  action_items: z.array(actionItemSchema),
  key_findings: z.array(z.string()).min(1).max(10),

  // Metadata
  generated_at: z.string(),
  stack_id: z.string().uuid(),
  comparison_method: z.string(),
})

// =============================================
// GPT INPUT VALIDATION SCHEMAS
// =============================================

export const gapDetectionInputSchema = z.object({
  current_categories: z.array(toolCategoryEnum),
  optimal_categories: z.array(toolCategoryEnum),
  industry: z.string(),
  company_size: z.string(),
  team_type: z.string(),
})

export const redundancyDetectionInputSchema = z.object({
  tools_by_category: z.record(toolCategoryEnum, z.array(z.string())),
  industry: z.string(),
  company_size: z.string(),
})

export const outdatedToolInputSchema = z.object({
  tool_name: z.string(),
  category: toolCategoryEnum,
  current_cost: z.number().nullable(),
  optimal_recommendations: z.array(z.string()),
})

// =============================================
// TYPE EXPORTS
// =============================================

export type MissingCategoryInput = z.infer<typeof missingCategorySchema>
export type GapAnalysisInput = z.infer<typeof gapAnalysisSchema>
export type RedundantSetInput = z.infer<typeof redundantSetSchema>
export type RedundancyAnalysisInput = z.infer<typeof redundancyAnalysisSchema>
export type OutdatedToolInput = z.infer<typeof outdatedToolSchema>
export type StackAnalysisInput = z.infer<typeof stackAnalysisSchema>
export type ComparisonSummaryInput = z.infer<typeof comparisonSummarySchema>
