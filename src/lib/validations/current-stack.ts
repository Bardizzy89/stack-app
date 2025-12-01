import { z } from 'zod';

/**
 * Zod validation schemas for Current Stack (Epic 4)
 */

// Tool categories
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
  'other',
]);

// Billing frequency
const billingFrequencyEnum = z.enum(['monthly', 'annual', 'one-time', 'unknown']);

/**
 * Schema for a single parsed tool from GPT
 */
export const parsedToolSchema = z.object({
  tool_name: z.string().min(1, 'Tool name is required').max(100),
  category: toolCategoryEnum,
  monthly_cost: z.number().min(0).nullable().optional(),
  billing_frequency: billingFrequencyEnum.optional(),
  seats: z.number().int().min(1).nullable().optional(),
  renewal_date: z.string().nullable().optional(), // ISO date string
  notes: z.string().max(500).nullable().optional(),
});

/**
 * Schema for array of parsed tools
 */
export const parsedToolsArraySchema = z.array(parsedToolSchema).min(1, 'At least one tool is required');

/**
 * Schema for tool form input (used in edit/add dialogs)
 * This schema keeps string types for form inputs
 */
export const toolFormSchema = z.object({
  tool_name: z.string().min(1, 'Tool name is required').max(100, 'Tool name is too long'),
  category: toolCategoryEnum,
  monthly_cost: z.string().optional(),
  billing_frequency: billingFrequencyEnum,
  seats: z.string().optional(),
  renewal_date: z.string().optional(),
  notes: z.string().max(500, 'Notes are too long').optional(),
});

/**
 * Schema for parsing input text
 */
export const parseInputSchema = z.object({
  input_text: z.string().min(3, 'Please enter at least one tool name').max(10000, 'Input is too long'),
});

/**
 * Schema for creating stack with items
 */
export const createStackSchema = z.object({
  business_profile_id: z.string().uuid(),
  tools: parsedToolsArraySchema,
});

// Type exports for use in components
export type ParsedToolInput = z.infer<typeof parsedToolSchema>;
export type ToolFormInput = z.infer<typeof toolFormSchema>;
export type ParseInputData = z.infer<typeof parseInputSchema>;
export type CreateStackInput = z.infer<typeof createStackSchema>;
