'use server'

import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import type { OptimalStack, OptimalStackRecord } from '@/lib/types/optimal-stack'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Check if a cached optimal stack exists for the given criteria
 */
async function getCachedOptimalStack(
  industry: string,
  companySize: string,
  teamType: string
): Promise<OptimalStackRecord | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('optimal_stacks')
    .select('*')
    .eq('industry', industry)
    .eq('company_size_band', companySize)
    .eq('team_type', teamType)
    .eq('is_cached', true)
    .order('generated_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return null
  }

  return data as OptimalStackRecord
}

/**
 * Generate optimal stack using GPT-4
 */
async function generateOptimalStackWithGPT(
  industry: string,
  companySize: string,
  teamType: string
): Promise<OptimalStack> {
  const systemPrompt = `You are an expert technology consultant specializing in helping SMBs optimize their software stack.

Your task is to generate a comprehensive optimal tech stack recommendation for a business with the following profile:
- Industry: ${industry}
- Company Size: ${companySize}
- Team Type: ${teamType}

Generate recommendations for these 9 categories:
1. CRM
2. Project Management
3. Accounting
4. File Storage
5. Communications
6. Automation
7. AI Tools
8. HR / Payroll
9. Security

For each category, provide:
- 1 PRIMARY recommendation (is_primary: true)
- 0-2 ALTERNATIVES (is_primary: false)

Each tool must include:
- name: Tool name
- slug: URL-friendly slug
- category: One of: crm, project_management, accounting, file_storage, communications, automation, ai_tools, hr_payroll, security
- website: Full URL
- pricing_tier: One of: low, mid, high, enterprise
- pricing_hint: Brief pricing summary (e.g., "~$12/user/mo")
- description: One sentence describing what the tool does
- why: 1-2 sentences explaining why this tool is recommended for THIS specific industry, company size, and team type
- is_primary: true for primary recommendation, false for alternatives

Return ONLY valid JSON matching this exact structure - no markdown, no explanations:
{
  "industry": "${industry}",
  "company_size_band": "${companySize}",
  "team_type": "${teamType}",
  "generated_at": "${new Date().toISOString()}",
  "categories": {
    "crm": { ... },
    "project_management": { ... },
    ... (all 9 categories)
  }
}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Generate the optimal tech stack for ${industry} (${companySize}, ${teamType}). Return ONLY JSON.`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  })

  const content = completion.choices[0].message.content
  if (!content) {
    throw new Error('No content received from OpenAI')
  }

  return JSON.parse(content) as OptimalStack
}

/**
 * Save optimal stack to database
 */
async function saveOptimalStack(
  optimalStack: OptimalStack,
  userId: string,
  stackId?: string,
  isCached: boolean = true
): Promise<OptimalStackRecord> {
  const supabase = await createClient()

  const { data, error} = await supabase
    .from('optimal_stacks')
    .insert({
      user_id: userId,
      stack_id: stackId || null,
      industry: optimalStack.industry,
      company_size_band: optimalStack.company_size_band,
      team_type: optimalStack.team_type,
      optimal_stack_json: optimalStack,
      is_cached: isCached,
      version: 1,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to save optimal stack: ${error.message}`)
  }

  return data as OptimalStackRecord
}

/**
 * Get or generate optimal stack (with caching)
 * This is the main function to call from the UI
 */
export async function getOrGenerateOptimalStack(
  industry: string,
  companySize: string,
  teamType: string,
  stackId?: string
): Promise<{ success: boolean; data?: OptimalStackRecord; error?: string; fromCache?: boolean }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // First, check if this user already has an optimal stack for their current stack
    if (stackId) {
      const { data: existingStack } = await supabase
        .from('optimal_stacks')
        .select('*')
        .eq('user_id', user.id)
        .eq('stack_id', stackId)
        .single()

      if (existingStack) {
        return { success: true, data: existingStack as OptimalStackRecord, fromCache: false }
      }
    }

    // Check cache for matching (industry, size, team)
    const cachedStack = await getCachedOptimalStack(industry, companySize, teamType)

    if (cachedStack) {
      // Found a cached version - create a copy for this user
      const userStack = await saveOptimalStack(
        cachedStack.optimal_stack_json,
        user.id,
        stackId,
        false // This is a user's copy, not the cached master
      )

      return { success: true, data: userStack, fromCache: true }
    }

    // No cache found - generate with GPT
    const optimalStack = await generateOptimalStackWithGPT(industry, companySize, teamType)

    // Save as cached version (first one for this combination)
    const savedStack = await saveOptimalStack(optimalStack, user.id, stackId, true)

    return { success: true, data: savedStack, fromCache: false }
  } catch (error) {
    console.error('Error generating optimal stack:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate optimal stack',
    }
  }
}

/**
 * Regenerate optimal stack (creates new version)
 */
export async function regenerateOptimalStack(
  stackId: string
): Promise<{ success: boolean; data?: OptimalStackRecord; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get the existing optimal stack to get the criteria
    const { data: existingStack, error: fetchError } = await supabase
      .from('optimal_stacks')
      .select('*')
      .eq('stack_id', stackId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingStack) {
      return { success: false, error: 'Existing optimal stack not found' }
    }

    const existing = existingStack as OptimalStackRecord

    // Generate new optimal stack with GPT
    const optimalStack = await generateOptimalStackWithGPT(
      existing.industry,
      existing.company_size_band,
      existing.team_type
    )

    // Update existing record with new version
    const { data: updated, error: updateError } = await supabase
      .from('optimal_stacks')
      .update({
        optimal_stack_json: optimalStack,
        version: existing.version + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to update optimal stack: ${updateError.message}`)
    }

    return { success: true, data: updated as OptimalStackRecord }
  } catch (error) {
    console.error('Error regenerating optimal stack:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to regenerate optimal stack',
    }
  }
}

/**
 * Get optimal stack by ID
 */
export async function getOptimalStackById(id: string): Promise<OptimalStackRecord | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('optimal_stacks')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data as OptimalStackRecord
}
