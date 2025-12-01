/**
 * Type definitions for Current Stack (Epic 4)
 * Represents user's existing tech stack before optimization
 */

// Billing frequency options
export type BillingFrequency = 'monthly' | 'annual' | 'one-time' | 'unknown';

// Tool categories matching optimal stack categories
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
  | 'other';

// Category display names for UI
export const TOOL_CATEGORY_LABELS: Record<ToolCategory, string> = {
  crm: 'CRM',
  project_management: 'Project Management',
  accounting: 'Accounting',
  file_storage: 'File Storage',
  communications: 'Communications',
  automation: 'Automation',
  ai_tools: 'AI Tools',
  hr_payroll: 'HR & Payroll',
  security: 'Security',
  other: 'Other',
};

// Billing frequency display names
export const BILLING_FREQUENCY_LABELS: Record<BillingFrequency, string> = {
  monthly: 'Monthly',
  annual: 'Annual',
  'one-time': 'One-time',
  unknown: 'Unknown',
};

/**
 * Tool parsed from user input by GPT
 * This matches the structure returned by the GPT parser
 */
export interface ParsedTool {
  tool_name: string;
  category: ToolCategory;
  monthly_cost?: number | null;
  billing_frequency?: BillingFrequency;
  seats?: number | null;
  renewal_date?: string | null; // ISO date string
  notes?: string | null;
}

/**
 * Tool item with ID after being saved to database
 * Matches the stack_items table structure
 */
export interface StackItem {
  id: string;
  stack_id: string;
  tool_name: string;
  category: ToolCategory;
  monthly_cost: number | null;
  seats: number | null;
  renewal_date: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Form data for editing a single tool
 */
export interface ToolFormData {
  tool_name: string;
  category: ToolCategory;
  monthly_cost?: string; // String for form input, converted to number on submit
  billing_frequency: BillingFrequency;
  seats?: string; // String for form input, converted to number on submit
  renewal_date?: string; // Date string or empty
  notes?: string;
}

/**
 * Result from GPT parsing
 */
export interface ParseToolsResult {
  success: boolean;
  tools?: ParsedTool[];
  error?: string;
}

/**
 * Result from creating stack with items
 */
export interface CreateStackResult {
  success: boolean;
  stack_id?: string;
  error?: string;
}
