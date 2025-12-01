// =============================================
// EPIC 6: TECH HEALTH SCORING SYSTEM
// =============================================
// STAPP-26: Build Scoring Function
// STAPP-27: Save Score Record

'use server'

import { createClient } from '@/lib/supabase/server'
import type {
  ScoreRecord,
  CalculatedScore,
  ScoreMetadata,
} from '@/lib/types/scores'

const ALGORITHM_VERSION = 'epic-6-v1.0'

// Note: The pure calculation function (calculateTechHealthScore) is in
// @/lib/scoring/calculator.ts and should be imported from there directly.

// =============================================
// RESULT TYPES
// =============================================

interface SaveScoreResult {
  success: boolean
  data?: { id: string; score: ScoreRecord }
  error?: string
}

interface GetScoreResult {
  success: boolean
  data?: ScoreRecord | null
  error?: string
}

interface GetScoreHistoryResult {
  success: boolean
  data?: ScoreRecord[]
  error?: string
}

// =============================================
// STAPP-27: SAVE SCORE RECORD
// =============================================

/**
 * Save a new score record to the database
 *
 * IMPORTANT: This creates a NEW record (does not upsert)
 * to support historical tracking per Epic 6 requirements.
 *
 * @param stackId - UUID of the stack being scored
 * @param calculatedScore - The calculated score with breakdown
 * @param totalMonthlySavings - Total monthly savings amount
 * @param totalAnnualSavings - Total annual savings amount
 * @param metadata - Optional metadata about the scoring run
 * @returns SaveScoreResult with created score record ID
 */
export async function saveScoreRecord(
  stackId: string,
  calculatedScore: CalculatedScore,
  totalMonthlySavings: number,
  totalAnnualSavings: number,
  metadata?: Partial<ScoreMetadata>
): Promise<SaveScoreResult> {
  try {
    const supabase = await createClient()

    // Verify user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Verify stack ownership
    const { data: stack, error: stackError } = await supabase
      .from('stacks')
      .select('id, user_id')
      .eq('id', stackId)
      .single()

    if (stackError || !stack) {
      return { success: false, error: 'Stack not found' }
    }

    if (stack.user_id !== user.id) {
      return { success: false, error: 'Unauthorized: Stack does not belong to user' }
    }

    // Build complete metadata
    const scoreMetadata: ScoreMetadata = {
      algorithm_version: ALGORITHM_VERSION,
      triggered_by: metadata?.triggered_by || 'comparison_engine',
      comparison_summary_id: metadata?.comparison_summary_id,
      execution_time_ms: metadata?.execution_time_ms,
      model_used: metadata?.model_used || 'gpt-4-turbo-preview',
    }

    // Prepare score record for insertion
    const scoreRecord = {
      stack_id: stackId,
      tech_health_score: calculatedScore.tech_health_score,
      gap_score: calculatedScore.gap_score,
      gaps_score: calculatedScore.gap_score, // Also save to legacy column for compatibility
      redundancy_score: calculatedScore.redundancy_score,
      outdated_score: calculatedScore.outdated_score,
      cost_efficiency_score: calculatedScore.cost_efficiency_score,
      total_monthly_savings: totalMonthlySavings,
      total_annual_savings: totalAnnualSavings,
      score_breakdown: calculatedScore.score_breakdown,
      metadata: scoreMetadata,
    }

    // Insert new score record (INSERT, not UPSERT - for historical tracking)
    const { data: insertedScore, error: insertError } = await supabase
      .from('scores')
      .insert(scoreRecord)
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting score record:', insertError)
      return { success: false, error: `Failed to save score record: ${insertError.message}` }
    }

    return {
      success: true,
      data: {
        id: insertedScore.id,
        score: insertedScore as ScoreRecord,
      },
    }
  } catch (error) {
    console.error('Unexpected error saving score record:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error saving score record',
    }
  }
}

// =============================================
// HELPER: Get Latest Score for Stack
// =============================================

/**
 * Retrieve the most recent score record for a stack
 *
 * @param stackId - UUID of the stack
 * @returns GetScoreResult with latest score record or null if none exists
 */
export async function getLatestScore(stackId: string): Promise<GetScoreResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get latest score for this stack, ordered by created_at desc
    const { data: score, error } = await supabase
      .from('scores')
      .select('*')
      .eq('stack_id', stackId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Error fetching latest score:', error)
      return { success: false, error: `Failed to fetch score: ${error.message}` }
    }

    return { success: true, data: score as ScoreRecord | null }
  } catch (error) {
    console.error('Unexpected error fetching latest score:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error fetching score',
    }
  }
}

// =============================================
// HELPER: Get Score History for Stack
// =============================================

/**
 * Retrieve all score records for a stack (historical tracking)
 *
 * @param stackId - UUID of the stack
 * @param limit - Maximum number of records to return (default: 10)
 * @returns GetScoreHistoryResult with array of score records
 */
export async function getScoreHistory(
  stackId: string,
  limit: number = 10
): Promise<GetScoreHistoryResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get score history for this stack
    const { data: scores, error } = await supabase
      .from('scores')
      .select('*')
      .eq('stack_id', stackId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching score history:', error)
      return { success: false, error: `Failed to fetch score history: ${error.message}` }
    }

    return { success: true, data: (scores as ScoreRecord[]) || [] }
  } catch (error) {
    console.error('Unexpected error fetching score history:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error fetching score history',
    }
  }
}
