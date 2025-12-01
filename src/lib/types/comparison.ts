/**
 * Type definitions for Comparison Engine (Epic 5)
 * Analyzes current stack vs optimal stack to identify gaps, redundancies, and savings opportunities
 */

import type { ToolCategory } from './optimal-stack'

// =============================================
// GAP DETECTION TYPES (STAPP-22)
// =============================================

export type GapSeverity = 'critical' | 'important' | 'nice-to-have'

export interface MissingCategory {
  category: ToolCategory
  category_name: string
  severity: GapSeverity
  reasoning: string
  penalty: number // Points deducted: critical (-5), important (-3), nice-to-have (-1)
}

export interface GapAnalysis {
  missing_categories: MissingCategory[]
  gap_score: number // 0-20, higher is better (20 = no gaps)
  total_penalty: number
}

// =============================================
// REDUNDANCY DETECTION TYPES (STAPP-23)
// =============================================

export type RedundancySeverity = 'acceptable' | 'mild' | 'wasteful' | 'severe'

export interface RedundantSet {
  tools: string[] // Array of tool names
  category: ToolCategory | 'cross-category'
  severity: RedundancySeverity
  overlap_reason: string // Explanation of why these tools are redundant
  functional_overlap_percentage?: number // 0-100, optional
  monthly_waste: number // Sum of costs for redundant tools
  recommended_action: string // e.g., "Keep Slack, remove Teams"
}

export interface RedundancyAnalysis {
  items: RedundantSet[]
  redundancy_score: number // 0-20, higher is better (20 = no redundancy)
  total_redundancy_savings: number // Total monthly savings from removing wasteful/severe redundancies
  by_severity: {
    acceptable: number
    mild: number
    wasteful: number
    severe: number
  }
}

// =============================================
// OUTDATED TOOL DETECTION TYPES (STAPP-24)
// =============================================

export type IssueType = 'outdated' | 'overpriced' | 'free_alternative' | 'better_fit'

export interface OutdatedTool {
  tool: string
  category: ToolCategory
  issue_type: IssueType
  issue: string // Human-readable description
  current_cost: number
  recommended_replacement: string
  replacement_cost: number
  replacement_website?: string
  monthly_savings: number
  annual_savings: number
  confidence: 'high' | 'medium' | 'low'
  additional_benefits?: string[] // e.g., ["Better integrations", "Modern UI"]
}

export interface StackAnalysis {
  outdated_tools: OutdatedTool[]
  total_outdated_savings: number // Monthly savings
  by_issue_type: {
    outdated: number
    overpriced: number
    free_alternative: number
    better_fit: number
  }
}

// =============================================
// COST SAVINGS TYPES
// =============================================

export interface CostSavingsBreakdown {
  redundancy_savings: number // From wasteful/severe redundancies
  outdated_savings: number // From replacing outdated tools
  overpriced_savings: number // From optimizing pricing tiers
  free_tier_savings: number // From switching to free alternatives
  total_monthly_savings: number // Sum of all above
  total_annual_savings: number // Monthly * 12
}

// =============================================
// VISUALIZATION DATA TYPES
// =============================================

/**
 * Top-down overlap map data
 * Groups tools by category and shows overlap areas
 */
export interface OverlapMapData {
  categories: Record<ToolCategory, {
    tools: string[]
    has_redundancy: boolean
    redundancy_severity?: RedundancySeverity
    total_monthly_cost: number
  }>
}

/**
 * Side-view architecture diagram data
 * Shows intentional stack layering
 */
export interface ArchitectureLayer {
  layer: string // e.g., "Communication", "CRM", "File Storage"
  category: ToolCategory
  primary: string | null // Main tool for this layer
  secondary: string[] // Acceptable secondary tools
  redundant: string[] // Tools flagged as redundant
  missing: boolean // True if this layer has no tools
  recommended: string // Optimal stack recommendation
}

export interface VisualizationData {
  overlap_map: OverlapMapData
  architecture_layers: ArchitectureLayer[]
}

// =============================================
// ACTION ITEMS & RECOMMENDATIONS
// =============================================

export interface ActionItem {
  id: string
  action: string // Human-readable action description
  type: 'remove' | 'replace' | 'add' | 'optimize'
  tool: string
  replacement?: string
  monthly_savings: number
  annual_savings: number
  priority: 'high' | 'medium' | 'low' // Based on savings potential
  category: ToolCategory
}

// =============================================
// COMPARISON SUMMARY (STAPP-25)
// =============================================

export interface ComparisonSummary {
  // Core analyses
  gaps: GapAnalysis
  redundancy: RedundancyAnalysis
  stack_analysis: StackAnalysis

  // Visualizations
  overlap_map: OverlapMapData
  architecture_layers: ArchitectureLayer[]

  // Aggregated metrics
  tech_health_score: number // 0-100
  total_monthly_savings: number
  total_annual_savings: number
  savings_breakdown: CostSavingsBreakdown

  // Narrative and recommendations
  narrative_summary: string // AI-generated summary of findings
  action_items: ActionItem[]
  key_findings: string[] // Top 3-5 bullet points

  // Metadata
  generated_at: string // ISO timestamp
  stack_id: string
  comparison_method: 'gpt-4-turbo' // For future tracking
}

// =============================================
// DATABASE RECORD TYPE
// =============================================

export interface ComparisonSummaryRecord {
  id: string
  stack_id: string
  comparison_json: ComparisonSummary // Full JSONB data
  tech_health_score: number
  gaps_score: number
  redundancy_score: number
  total_monthly_savings: number
  total_annual_savings: number
  created_at: string
  updated_at: string
}

// =============================================
// API RESPONSE TYPES
// =============================================

export interface GenerateComparisonResult {
  success: boolean
  data?: ComparisonSummary
  error?: string
}

export interface GetComparisonResult {
  success: boolean
  data?: ComparisonSummaryRecord
  error?: string
}

// =============================================
// GPT PROMPT HELPERS
// =============================================

export interface GapDetectionInput {
  current_categories: ToolCategory[]
  optimal_categories: ToolCategory[]
  industry: string
  company_size: string
  team_type: string
}

export interface RedundancyDetectionInput {
  tools_by_category: Record<ToolCategory, string[]>
  industry: string
  company_size: string
}

export interface OutdatedToolInput {
  tool_name: string
  category: ToolCategory
  current_cost: number | null
  optimal_recommendations: string[] // Tools recommended in optimal stack
}

// =============================================
// DISPLAY HELPERS
// =============================================

export const GAP_SEVERITY_LABELS: Record<GapSeverity, string> = {
  critical: 'Critical',
  important: 'Important',
  'nice-to-have': 'Nice to Have',
}

export const GAP_SEVERITY_COLORS: Record<GapSeverity, string> = {
  critical: 'text-red-600 bg-red-50',
  important: 'text-orange-600 bg-orange-50',
  'nice-to-have': 'text-yellow-600 bg-yellow-50',
}

export const REDUNDANCY_SEVERITY_LABELS: Record<RedundancySeverity, string> = {
  acceptable: 'Acceptable',
  mild: 'Mild',
  wasteful: 'Wasteful',
  severe: 'Severe',
}

export const REDUNDANCY_SEVERITY_COLORS: Record<RedundancySeverity, string> = {
  acceptable: 'text-green-600 bg-green-50',
  mild: 'text-yellow-600 bg-yellow-50',
  wasteful: 'text-orange-600 bg-orange-50',
  severe: 'text-red-600 bg-red-50',
}

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  outdated: 'Outdated',
  overpriced: 'Overpriced',
  free_alternative: 'Free Alternative Available',
  better_fit: 'Better Fit Available',
}

export const ISSUE_TYPE_COLORS: Record<IssueType, string> = {
  outdated: 'text-orange-600 bg-orange-50',
  overpriced: 'text-red-600 bg-red-50',
  free_alternative: 'text-green-600 bg-green-50',
  better_fit: 'text-blue-600 bg-blue-50',
}

// =============================================
// UTILITY TYPES
// =============================================

export interface ToolWithCost {
  name: string
  category: ToolCategory
  monthly_cost: number | null
}

export interface CategoryComparison {
  category: ToolCategory
  current_tools: string[]
  optimal_primary: string
  optimal_alternatives: string[]
  has_gap: boolean
  has_redundancy: boolean
}
