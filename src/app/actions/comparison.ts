'use server'

import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import type {
  ComparisonSummary,
  GapAnalysis,
  RedundancyAnalysis,
  StackAnalysis,
  MissingCategory,
  RedundantSet,
  OutdatedTool,
  CostSavingsBreakdown,
  ActionItem,
  VisualizationData,
  ArchitectureLayer,
  OverlapMapData,
  GenerateComparisonResult,
  GetComparisonResult,
} from '@/lib/types/comparison'
import type { OptimalStack, ToolCategory } from '@/lib/types/optimal-stack'
import type { StackItem } from '@/lib/types/current-stack'
import {
  gapAnalysisSchema,
  redundancyAnalysisSchema,
  stackAnalysisSchema,
} from '@/lib/validations/comparison'
import { getStackWithItems } from './current-stack'
import { getBusinessProfile } from './business-profile'
import { calculateTechHealthScore as calculateScore } from '@/lib/scoring/calculator'
import { saveScoreRecord } from './scoring'
import type { ScoreCalculationInput } from '@/lib/types/scores'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// =============================================
// STAPP-22: GAP DETECTION LOGIC
// =============================================

/**
 * Detect missing categories by comparing current stack vs optimal stack
 * Uses GPT-4 Turbo to assess severity of each gap
 */
export async function detectGaps(
  currentItems: StackItem[],
  optimalStack: OptimalStack,
  industry: string,
  companySize: string,
  teamType: string
): Promise<GapAnalysis> {
  try {
    // Extract categories from current stack
    const currentCategories = [...new Set(currentItems.map((item) => item.category).filter(cat => cat !== 'other'))] as ToolCategory[]

    // Extract categories from optimal stack
    const optimalCategories = Object.keys(optimalStack.categories) as ToolCategory[]

    // Find missing categories
    const missingCats = optimalCategories.filter((cat) => !currentCategories.includes(cat))

    if (missingCats.length === 0) {
      return {
        missing_categories: [],
        gap_score: 20,
        total_penalty: 0,
      }
    }

    // Use GPT to assess severity of each gap
    const systemPrompt = `You are a tech stack analysis expert. Assess the severity of missing software categories for a business.

Business Profile:
- Industry: ${industry}
- Company Size: ${companySize}
- Team Type: ${teamType}

For each missing category, determine:
1. Severity level (critical, important, or nice-to-have)
2. Brief reasoning (2-3 sentences)
3. Penalty points: critical (-5), important (-3), nice-to-have (-1)

Return ONLY valid JSON matching this structure:
{
  "missing_categories": [
    {
      "category": "crm",
      "category_name": "CRM",
      "severity": "critical",
      "reasoning": "...",
      "penalty": -5
    }
  ]
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Analyze these missing categories: ${missingCats.join(', ')}\n\nReturn JSON with severity assessment for each.`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error('No content from OpenAI')
    }

    const parsed = JSON.parse(content)
    const validation = gapAnalysisSchema.safeParse({
      missing_categories: parsed.missing_categories,
      gap_score: 20 + parsed.missing_categories.reduce((sum: number, cat: MissingCategory) => sum + cat.penalty, 0),
      total_penalty: parsed.missing_categories.reduce((sum: number, cat: MissingCategory) => sum + cat.penalty, 0),
    })

    if (!validation.success) {
      console.error('Gap analysis validation error:', validation.error)
      throw new Error('Invalid gap analysis format')
    }

    return validation.data
  } catch (error) {
    console.error('Error detecting gaps:', error)
    // Return safe default
    return {
      missing_categories: [],
      gap_score: 15,
      total_penalty: -5,
    }
  }
}

// =============================================
// STAPP-23: REDUNDANCY DETECTION LOGIC
// =============================================

/**
 * Detect redundant tools (same-category and cross-category)
 * Uses GPT-4 Turbo to assess functional overlap
 */
export async function detectRedundancy(
  currentItems: StackItem[],
  industry: string,
  companySize: string
): Promise<RedundancyAnalysis> {
  try {
    // Group tools by category
    const toolsByCategory: Record<string, string[]> = {}
    currentItems.forEach((item) => {
      if (!toolsByCategory[item.category]) {
        toolsByCategory[item.category] = []
      }
      toolsByCategory[item.category].push(item.tool_name)
    })

    // Find categories with multiple tools (potential redundancy)
    const categoriesWithMultipleTools = Object.entries(toolsByCategory)
      .filter(([_, tools]) => tools.length > 1)

    if (categoriesWithMultipleTools.length === 0 && currentItems.length < 2) {
      return {
        items: [],
        redundancy_score: 20,
        total_redundancy_savings: 0,
        by_severity: { acceptable: 0, mild: 0, wasteful: 0, severe: 0 },
      }
    }

    // Prepare tool list with costs for GPT
    const toolsWithCosts = currentItems.map((item) => ({
      name: item.tool_name,
      category: item.category,
      monthly_cost: item.monthly_cost || 0,
    }))

    const systemPrompt = `You are a tech stack redundancy analyst. Identify redundant tools and assess overlap severity.

Business Profile:
- Industry: ${industry}
- Company Size: ${companySize}

Analyze BOTH:
1. Same-category redundancy (multiple tools in one category)
2. Cross-category functional overlap (tools that serve similar functions across categories)

For each redundant set, determine:
- Severity: acceptable (complementary use), mild (<$20/mo), wasteful ($20-$100/mo), severe (>$100/mo or 3+ tools)
- Overlap reasoning
- Monthly waste (sum of redundant tool costs)
- Recommended action

Return ONLY valid JSON:
{
  "redundant_sets": [
    {
      "tools": ["Tool A", "Tool B"],
      "category": "communications",
      "severity": "wasteful",
      "overlap_reason": "...",
      "functional_overlap_percentage": 80,
      "monthly_waste": 45,
      "recommended_action": "Keep Slack, remove Teams"
    }
  ]
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Analyze these tools for redundancy:\n${JSON.stringify(toolsWithCosts, null, 2)}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error('No content from OpenAI')
    }

    const parsed = JSON.parse(content)
    const redundantSets: RedundantSet[] = parsed.redundant_sets || []

    // Calculate savings (only wasteful and severe)
    const totalSavings = redundantSets
      .filter((set) => set.severity === 'wasteful' || set.severity === 'severe')
      .reduce((sum, set) => sum + set.monthly_waste, 0)

    // Calculate score
    const severityCounts = {
      acceptable: redundantSets.filter((s) => s.severity === 'acceptable').length,
      mild: redundantSets.filter((s) => s.severity === 'mild').length,
      wasteful: redundantSets.filter((s) => s.severity === 'wasteful').length,
      severe: redundantSets.filter((s) => s.severity === 'severe').length,
    }

    const redundancyScore = Math.max(
      0,
      20 - severityCounts.mild * 2 - severityCounts.wasteful * 5 - severityCounts.severe * 10
    )

    const analysis: RedundancyAnalysis = {
      items: redundantSets,
      redundancy_score: redundancyScore,
      total_redundancy_savings: totalSavings,
      by_severity: severityCounts,
    }

    const validation = redundancyAnalysisSchema.safeParse(analysis)
    if (!validation.success) {
      console.error('Redundancy analysis validation error:', validation.error)
      throw new Error('Invalid redundancy analysis format')
    }

    return validation.data
  } catch (error) {
    console.error('Error detecting redundancy:', error)
    return {
      items: [],
      redundancy_score: 18,
      total_redundancy_savings: 0,
      by_severity: { acceptable: 0, mild: 0, wasteful: 0, severe: 0 },
    }
  }
}

// =============================================
// STAPP-24: OUTDATED TOOL DETECTION / STACK ANALYSIS
// =============================================

/**
 * Analyze each current tool for outdated/overpriced issues
 * Uses GPT-4 Turbo to find cheaper/free alternatives
 */
export async function analyzeOutdatedTools(
  currentItems: StackItem[],
  optimalStack: OptimalStack
): Promise<StackAnalysis> {
  try {
    const outdatedTools: OutdatedTool[] = []

    // Analyze each tool
    for (const item of currentItems) {
      const category = item.category
      if (category === 'other') continue

      const optimalCategory = optimalStack.categories[category as ToolCategory]
      if (!optimalCategory) continue

      const optimalRecommendations = [
        optimalCategory.primary.name,
        ...(optimalCategory.alternatives?.map((a) => a.name) || []),
      ]

      const systemPrompt = `You are a tech stack pricing and modernization analyst.

Current Tool: ${item.tool_name}
Category: ${category}
Current Cost: $${item.monthly_cost || 0}/month
Optimal Recommendations: ${optimalRecommendations.join(', ')}

Analyze if this tool is:
1. Outdated (legacy tech, better modern options exist)
2. Overpriced (wrong pricing tier, could optimize)
3. Has a FREE alternative (mainstream free tier or freemium with good limits)
4. Better fit available (optimal stack suggests different tool)

If ANY issue found, return JSON with:
{
  "has_issue": true,
  "issue_type": "outdated|overpriced|free_alternative|better_fit",
  "issue": "description",
  "recommended_replacement": "Tool Name",
  "replacement_cost": 40,
  "replacement_website": "https://...",
  "monthly_savings": 60,
  "confidence": "high|medium|low",
  "additional_benefits": ["benefit 1", "benefit 2"]
}

If NO issues, return: { "has_issue": false }`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'system', content: systemPrompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      })

      const content = completion.choices[0].message.content
      if (!content) continue

      const result = JSON.parse(content)
      if (result.has_issue) {
        outdatedTools.push({
          tool: item.tool_name,
          category: category as ToolCategory,
          issue_type: result.issue_type,
          issue: result.issue,
          current_cost: item.monthly_cost || 0,
          recommended_replacement: result.recommended_replacement,
          replacement_cost: result.replacement_cost || 0,
          replacement_website: result.replacement_website,
          monthly_savings: result.monthly_savings || 0,
          annual_savings: (result.monthly_savings || 0) * 12,
          confidence: result.confidence || 'medium',
          additional_benefits: result.additional_benefits,
        })
      }
    }

    const totalSavings = outdatedTools.reduce((sum, tool) => sum + tool.monthly_savings, 0)

    const byIssueType = {
      outdated: outdatedTools.filter((t) => t.issue_type === 'outdated').length,
      overpriced: outdatedTools.filter((t) => t.issue_type === 'overpriced').length,
      free_alternative: outdatedTools.filter((t) => t.issue_type === 'free_alternative').length,
      better_fit: outdatedTools.filter((t) => t.issue_type === 'better_fit').length,
    }

    const analysis: StackAnalysis = {
      outdated_tools: outdatedTools,
      total_outdated_savings: totalSavings,
      by_issue_type: byIssueType,
    }

    const validation = stackAnalysisSchema.safeParse(analysis)
    if (!validation.success) {
      console.error('Stack analysis validation error:', validation.error)
      throw new Error('Invalid stack analysis format')
    }

    return validation.data
  } catch (error) {
    console.error('Error analyzing outdated tools:', error)
    return {
      outdated_tools: [],
      total_outdated_savings: 0,
      by_issue_type: { outdated: 0, overpriced: 0, free_alternative: 0, better_fit: 0 },
    }
  }
}

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Calculate aggregated cost savings from all analyses
 */
function calculateCostSavings(
  redundancy: RedundancyAnalysis,
  stackAnalysis: StackAnalysis
): CostSavingsBreakdown {
  const redundancySavings = redundancy.total_redundancy_savings

  const outdatedSavings = stackAnalysis.outdated_tools
    .filter((t) => t.issue_type === 'outdated' || t.issue_type === 'better_fit')
    .reduce((sum, t) => sum + t.monthly_savings, 0)

  const overpricedSavings = stackAnalysis.outdated_tools
    .filter((t) => t.issue_type === 'overpriced')
    .reduce((sum, t) => sum + t.monthly_savings, 0)

  const freeTierSavings = stackAnalysis.outdated_tools
    .filter((t) => t.issue_type === 'free_alternative')
    .reduce((sum, t) => sum + t.monthly_savings, 0)

  const totalMonthly = redundancySavings + outdatedSavings + overpricedSavings + freeTierSavings

  return {
    redundancy_savings: redundancySavings,
    outdated_savings: outdatedSavings,
    overpriced_savings: overpricedSavings,
    free_tier_savings: freeTierSavings,
    total_monthly_savings: totalMonthly,
    total_annual_savings: totalMonthly * 12,
  }
}

/**
 * Calculate overall tech health score (0-100)
 */
// =============================================
// TECH HEALTH SCORE CALCULATION
// =============================================
// Note: Score calculation moved to /src/app/actions/scoring.ts (Epic 6)
// This function now prepares input and delegates to the Epic 6 scoring system

/**
 * Generate visualization data structures
 */
function generateVisualizationData(
  currentItems: StackItem[],
  redundancy: RedundancyAnalysis
): VisualizationData {
  // Overlap map: group tools by category
  const categories: OverlapMapData['categories'] = {} as any

  currentItems.forEach((item) => {
    // Skip 'other' category as it's not in optimal stack categories
    if (item.category === 'other') return

    const cat = item.category as ToolCategory

    if (!categories[cat]) {
      categories[cat] = {
        tools: [],
        has_redundancy: false,
        total_monthly_cost: 0,
      }
    }

    categories[cat].tools.push(item.tool_name)
    categories[cat].total_monthly_cost += item.monthly_cost || 0
  })

  // Mark redundancy
  redundancy.items.forEach((redSet) => {
    if (redSet.category !== 'cross-category') {
      const cat = redSet.category as ToolCategory
      if (categories[cat]) {
        categories[cat].has_redundancy = true
        categories[cat].redundancy_severity = redSet.severity
      }
    }
  })

  const overlapMap: OverlapMapData = { categories }

  // Architecture layers: simplified for now
  const architectureLayers: ArchitectureLayer[] = Object.keys(categories).map((cat) => {
    const tools = categories[cat as ToolCategory].tools
    return {
      layer: cat,
      category: cat as ToolCategory,
      primary: tools[0] || null,
      secondary: tools.slice(1, 2),
      redundant: tools.slice(2),
      missing: tools.length === 0,
      recommended: `Optimal ${cat} tool`,
    }
  })

  return {
    overlap_map: overlapMap,
    architecture_layers: architectureLayers,
  }
}

/**
 * Generate prioritized action items
 */
function generateActionItems(
  redundancy: RedundancyAnalysis,
  stackAnalysis: StackAnalysis
): ActionItem[] {
  const actions: ActionItem[] = []

  // Redundancy actions
  redundancy.items
    .filter((set) => set.severity === 'wasteful' || set.severity === 'severe')
    .forEach((set, idx) => {
      actions.push({
        id: `redundancy-${idx}`,
        action: set.recommended_action,
        type: 'remove',
        tool: set.tools.join(', '),
        monthly_savings: set.monthly_waste,
        annual_savings: set.monthly_waste * 12,
        priority: set.severity === 'severe' ? 'high' : 'medium',
        category: set.category === 'cross-category' ? 'communications' : (set.category as ToolCategory),
      })
    })

  // Outdated tool actions
  stackAnalysis.outdated_tools.forEach((tool, idx) => {
    actions.push({
      id: `outdated-${idx}`,
      action: `Switch from ${tool.tool} to ${tool.recommended_replacement} - ${tool.issue}`,
      type: 'replace',
      tool: tool.tool,
      replacement: tool.recommended_replacement,
      monthly_savings: tool.monthly_savings,
      annual_savings: tool.annual_savings,
      priority: tool.monthly_savings > 50 ? 'high' : tool.monthly_savings > 20 ? 'medium' : 'low',
      category: tool.category,
    })
  })

  // Sort by savings (highest first)
  actions.sort((a, b) => b.monthly_savings - a.monthly_savings)

  return actions
}

/**
 * Generate narrative summary using GPT
 */
async function generateNarrativeSummary(
  gaps: GapAnalysis,
  redundancy: RedundancyAnalysis,
  stackAnalysis: StackAnalysis,
  savings: CostSavingsBreakdown
): Promise<string> {
  try {
    const systemPrompt = `You are a tech stack consultant writing an executive summary.

Given the analysis results, write a concise 2-3 paragraph summary highlighting:
1. Overall stack health
2. Key issues found (gaps, redundancies, outdated tools)
3. Savings opportunity
4. Top recommendations

Tone: Professional, actionable, optimistic.
Length: 150-300 words.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Analysis Results:
- Missing Categories: ${gaps.missing_categories.length}
- Redundant Tool Sets: ${redundancy.items.length}
- Outdated Tools: ${stackAnalysis.outdated_tools.length}
- Total Monthly Savings Potential: $${savings.total_monthly_savings.toFixed(2)}
- Total Annual Savings Potential: $${savings.total_annual_savings.toFixed(2)}

Write the executive summary.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 400,
    })

    return completion.choices[0].message.content || 'Analysis complete.'
  } catch (error) {
    console.error('Error generating narrative:', error)
    return 'Your tech stack analysis is complete. Review the findings below for detailed recommendations.'
  }
}

// =============================================
// STAPP-25: MAIN ORCHESTRATOR
// =============================================

/**
 * Generate complete comparison summary
 * This is the main entry point that orchestrates all analyses
 */
export async function generateComparisonSummary(stackId: string): Promise<GenerateComparisonResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // 1. Load required data
    const [stackResult, businessProfile] = await Promise.all([
      getStackWithItems(stackId),
      getBusinessProfile(),
    ])

    if (!stackResult.success || !stackResult.data || !businessProfile) {
      return { success: false, error: 'Failed to load stack or business profile' }
    }

    const { stack, items } = stackResult.data

    // Get optimal stack
    const { data: optimalStackRecord } = await supabase
      .from('optimal_stacks')
      .select('*')
      .eq('stack_id', stackId)
      .single()

    if (!optimalStackRecord) {
      return { success: false, error: 'Optimal stack not found. Generate optimal stack first.' }
    }

    const optimalStack: OptimalStack = optimalStackRecord.optimal_stack_json

    // 2. Run analyses in parallel
    const [gaps, redundancy, stackAnalysis] = await Promise.all([
      detectGaps(
        items,
        optimalStack,
        businessProfile.industry,
        businessProfile.company_size,
        businessProfile.team_type
      ),
      detectRedundancy(items, businessProfile.industry, businessProfile.company_size),
      analyzeOutdatedTools(items, optimalStack),
    ])

    // 3. Calculate metrics
    const savings = calculateCostSavings(redundancy, stackAnalysis)

    // Calculate total monthly spend from current stack
    const totalMonthlySpend = items.reduce((sum, item) => sum + (item.monthly_cost || 0), 0)

    // Prepare input for Epic 6 scoring system
    const scoreInput: ScoreCalculationInput = {
      stack_id: stackId,
      gap_score: gaps.gap_score,
      redundancy_score: redundancy.redundancy_score,
      outdated_tools_count: stackAnalysis.outdated_tools.length,
      total_monthly_spend: totalMonthlySpend,
      total_monthly_savings: savings.total_monthly_savings,
      total_annual_savings: savings.total_annual_savings,
      missing_categories_count: gaps.missing_categories.length,
      redundant_sets_count: redundancy.items.length,
    }

    // Calculate score using Epic 6 scoring system
    const calculatedScore = calculateScore(scoreInput)
    const techHealthScore = calculatedScore.tech_health_score

    // 4. Generate outputs
    const visualizations = generateVisualizationData(items, redundancy)
    const actionItems = generateActionItems(redundancy, stackAnalysis)
    const narrative = await generateNarrativeSummary(gaps, redundancy, stackAnalysis, savings)

    // 5. Extract key findings
    const keyFindings: string[] = []
    if (gaps.missing_categories.length > 0) {
      keyFindings.push(`${gaps.missing_categories.length} critical categories missing from your stack`)
    }
    if (redundancy.by_severity.wasteful + redundancy.by_severity.severe > 0) {
      keyFindings.push(
        `$${redundancy.total_redundancy_savings.toFixed(2)}/month wasted on redundant tools`
      )
    }
    if (stackAnalysis.outdated_tools.length > 0) {
      keyFindings.push(`${stackAnalysis.outdated_tools.length} tools can be modernized or optimized`)
    }
    if (savings.total_monthly_savings > 0) {
      keyFindings.push(`Potential savings: $${savings.total_monthly_savings.toFixed(2)}/month`)
    }
    if (keyFindings.length === 0) {
      keyFindings.push('Your tech stack is well-optimized!')
    }

    // 6. Build comparison summary
    const comparisonSummary: ComparisonSummary = {
      gaps,
      redundancy,
      stack_analysis: stackAnalysis,
      overlap_map: visualizations.overlap_map,
      architecture_layers: visualizations.architecture_layers,
      tech_health_score: techHealthScore,
      total_monthly_savings: savings.total_monthly_savings,
      total_annual_savings: savings.total_annual_savings,
      savings_breakdown: savings,
      narrative_summary: narrative,
      action_items: actionItems,
      key_findings: keyFindings,
      generated_at: new Date().toISOString(),
      stack_id: stackId,
      comparison_method: 'gpt-4-turbo',
    }

    // 7. Save to database (comparison summary + score record)
    const comparisonSummaryId = await saveComparisonSummary(
      stackId,
      comparisonSummary,
      techHealthScore,
      gaps.gap_score,
      redundancy.redundancy_score,
      savings
    )

    // 8. Save score record using Epic 6 scoring system (with historical tracking)
    await saveScoreRecord(stackId, calculatedScore, savings.total_monthly_savings, savings.total_annual_savings, {
      triggered_by: 'comparison_engine',
      comparison_summary_id: comparisonSummaryId,
      model_used: 'gpt-4-turbo-preview',
    })

    return { success: true, data: comparisonSummary }
  } catch (error) {
    console.error('Error generating comparison summary:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate comparison',
    }
  }
}

/**
 * Save comparison summary to database
 * Returns the comparison_summary ID for linking to score records
 */
async function saveComparisonSummary(
  stackId: string,
  comparison: ComparisonSummary,
  techHealthScore: number,
  gapsScore: number,
  redundancyScore: number,
  savings: CostSavingsBreakdown
): Promise<string> {
  const supabase = await createClient()

  // Upsert to comparison_summary table
  const { data: summaryData, error: summaryError } = await supabase
    .from('comparison_summary')
    .upsert(
      {
        stack_id: stackId,
        comparison_json: comparison as any,
        tech_health_score: techHealthScore,
        gaps_score: gapsScore,
        redundancy_score: redundancyScore,
        total_monthly_savings: savings.total_monthly_savings,
        total_annual_savings: savings.total_annual_savings,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'stack_id',
      }
    )
    .select('id')
    .single()

  if (summaryError) {
    throw new Error(`Failed to save comparison summary: ${summaryError.message}`)
  }

  // Note: Scores table is now updated via Epic 6 saveScoreRecord() function
  // This enables historical tracking instead of upsert behavior

  return summaryData.id
}

/**
 * Get comparison summary for a stack
 */
export async function getComparisonSummary(stackId: string): Promise<GetComparisonResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('comparison_summary')
      .select('*')
      .eq('stack_id', stackId)
      .single()

    if (error || !data) {
      return { success: false, error: 'Comparison summary not found' }
    }

    return { success: true, data: data as any }
  } catch (error) {
    console.error('Error getting comparison summary:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get comparison',
    }
  }
}
