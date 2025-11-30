// Optimal Tech Stack Types

export type PricingTier = 'low' | 'mid' | 'high' | 'enterprise'

export type ToolCategory =
  | 'crm'
  | 'project_management'
  | 'accounting'
  | 'file_storage'
  | 'communications'
  | 'automation'
  | 'ai_tools'
  | 'hr_payroll'
  | 'security'

export interface ToolRecommendation {
  name: string
  slug: string
  category: ToolCategory
  website: string
  pricing_tier: PricingTier
  pricing_hint?: string
  description: string
  why: string
  is_primary: boolean
}

export interface CategoryRecommendation {
  category_name: string
  is_optional: boolean
  primary: ToolRecommendation
  alternatives?: ToolRecommendation[]
}

export interface OptimalStack {
  industry: string
  company_size_band: string
  team_type: string
  generated_at: string
  categories: Record<ToolCategory, CategoryRecommendation>
}

// Database record type
export interface OptimalStackRecord {
  id: string
  stack_id: string | null
  user_id: string
  industry: string
  company_size_band: string
  team_type: string
  optimal_stack_json: OptimalStack
  version: number
  is_cached: boolean
  generated_at: string
  updated_at: string
}

// Payload for generating optimal stack
export interface GenerateOptimalStackPayload {
  industry: string
  company_size: string
  team_type: string
  user_id: string
  stack_id?: string
}

// Category display names mapping
export const CATEGORY_DISPLAY_NAMES: Record<ToolCategory, string> = {
  crm: 'CRM',
  project_management: 'Project Management',
  accounting: 'Accounting',
  file_storage: 'File Storage',
  communications: 'Communications',
  automation: 'Automation',
  ai_tools: 'AI Tools',
  hr_payroll: 'HR / Payroll',
  security: 'Security',
}

// All categories in recommended order
export const ALL_CATEGORIES: ToolCategory[] = [
  'crm',
  'project_management',
  'accounting',
  'file_storage',
  'communications',
  'automation',
  'ai_tools',
  'hr_payroll',
  'security',
]
