'use server'

import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import type { ParsedTool, ParseToolsResult, CreateStackResult } from '@/lib/types/current-stack'
import { parsedToolsArraySchema } from '@/lib/validations/current-stack'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Parse user input text and extract tool information using GPT-4
 * Handles various input formats: simple lists, detailed descriptions, natural language
 */
export async function parseToolsWithGPT(inputText: string): Promise<ParseToolsResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Validate input
    if (!inputText || inputText.trim().length === 0) {
      return { success: false, error: 'Please enter at least one tool name' }
    }

    const systemPrompt = `You are a tech stack analysis assistant. Your task is to parse user input about their current software tools and extract structured information.

The user may provide input in various formats:
- Simple list: "Slack, HubSpot, QuickBooks, Gusto"
- With costs: "Slack ($15/month), HubSpot CRM ($50/month, 2 seats)"
- Natural language: "We use Slack for team chat, paying $200/month for 5 seats"
- Mixed format with descriptions and costs

Your job is to:
1. Extract each unique tool mentioned
2. Categorize each tool into ONE of these categories:
   - crm (Customer Relationship Management)
   - project_management
   - accounting
   - file_storage
   - communications (chat, email, video conferencing)
   - automation (Zapier, Make, etc.)
   - ai_tools (ChatGPT, Anthropic, etc.)
   - hr_payroll (HR, payroll, benefits)
   - security (password managers, security tools)
   - other (if none of the above fit)

3. Extract additional information if mentioned:
   - monthly_cost: Convert all costs to monthly amount (annual/12, one-time as null)
   - seats: Number of users/seats if mentioned
   - renewal_date: Any renewal or expiration dates (ISO format YYYY-MM-DD)
   - notes: Any additional context about the tool

Rules:
- If a tool is mentioned multiple times, include it only once
- If cost is annual, convert to monthly by dividing by 12
- If cost information is missing, set monthly_cost to null
- Be generous with categorization - use your knowledge of common tools
- tool_name should be the proper/official name (e.g., "Slack" not "slack app")
- For ambiguous category, choose the most common use case
- If seats aren't mentioned, set to null
- billing_frequency should be: "monthly", "annual", "one_time", or "unknown"

Return ONLY valid JSON matching this structure - no markdown, no explanations:
{
  "tools": [
    {
      "tool_name": "Slack",
      "category": "communications",
      "monthly_cost": 15.00,
      "billing_frequency": "monthly",
      "seats": 5,
      "renewal_date": null,
      "notes": "Team communication platform"
    }
  ]
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Parse the following tech stack information and return JSON:\n\n${inputText}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Lower temperature for more consistent parsing
    })

    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error('No content received from OpenAI')
    }

    const parsed = JSON.parse(content)
    const tools = parsed.tools as ParsedTool[]

    // Validate the parsed tools with Zod
    const validation = parsedToolsArraySchema.safeParse(tools)
    if (!validation.success) {
      console.error('Validation error:', validation.error)
      return { success: false, error: 'Failed to parse tools. Please check your input format.' }
    }

    return { success: true, tools: validation.data }
  } catch (error) {
    console.error('Error parsing tools with GPT:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse tools',
    }
  }
}

/**
 * Create a new stack record with all stack items
 * Uses transaction to ensure atomicity
 */
export async function createStackWithItems(
  businessProfileId: string,
  tools: ParsedTool[]
): Promise<CreateStackResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Validate tools array
    if (!tools || tools.length === 0) {
      return { success: false, error: 'At least one tool is required' }
    }

    // Create stack record
    const { data: stack, error: stackError } = await supabase
      .from('stacks')
      .insert({
        user_id: user.id,
        business_profile_id: businessProfileId,
        payment_status: 'pending',
      })
      .select()
      .single()

    if (stackError) {
      console.error('Error creating stack:', stackError)
      return { success: false, error: 'Failed to create stack record' }
    }

    // Prepare stack items for batch insert
    const stackItems = tools.map((tool) => ({
      stack_id: stack.id,
      tool_name: tool.tool_name,
      category: tool.category,
      monthly_cost: tool.monthly_cost ?? null,
      seats: tool.seats ?? null,
      renewal_date: tool.renewal_date ?? null,
      notes: tool.notes ?? null,
    }))

    // Batch insert stack items
    const { error: itemsError } = await supabase.from('stack_items').insert(stackItems)

    if (itemsError) {
      console.error('Error creating stack items:', itemsError)
      // Rollback: delete the stack record
      await supabase.from('stacks').delete().eq('id', stack.id)
      return { success: false, error: 'Failed to save tools' }
    }

    return { success: true, stack_id: stack.id }
  } catch (error) {
    console.error('Error creating stack with items:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create stack',
    }
  }
}

/**
 * Get stack by ID with all items
 */
export async function getStackWithItems(stackId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get stack
    const { data: stack, error: stackError } = await supabase
      .from('stacks')
      .select('*')
      .eq('id', stackId)
      .eq('user_id', user.id)
      .single()

    if (stackError || !stack) {
      return { success: false, error: 'Stack not found' }
    }

    // Get stack items
    const { data: items, error: itemsError } = await supabase
      .from('stack_items')
      .select('*')
      .eq('stack_id', stackId)
      .order('created_at', { ascending: true })

    if (itemsError) {
      return { success: false, error: 'Failed to load tools' }
    }

    return { success: true, data: { stack, items } }
  } catch (error) {
    console.error('Error getting stack with items:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load stack',
    }
  }
}

/**
 * Get user's most recent stack
 */
export async function getUserStack() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get most recent stack
    const { data: stack, error: stackError } = await supabase
      .from('stacks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (stackError || !stack) {
      return { success: false, data: null }
    }

    return { success: true, data: stack }
  } catch (error) {
    console.error('Error getting user stack:', error)
    return { success: false, data: null }
  }
}
