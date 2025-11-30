import { z } from 'zod'
import {
  INDUSTRY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  TEAM_TYPE_OPTIONS,
  REVENUE_BAND_OPTIONS,
  US_STATES,
} from '@/lib/constants/business-options'

export const businessProfileSchema = z.object({
  company_name: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(120, 'Company name must be less than 120 characters')
    .trim(),
  industry: z.enum(INDUSTRY_OPTIONS, {
    required_error: 'Please select an industry',
  }),
  company_size: z.enum(COMPANY_SIZE_OPTIONS, {
    required_error: 'Please select a company size',
  }),
  state: z.enum(US_STATES, {
    required_error: 'Please select a state',
  }),
  team_type: z.enum(TEAM_TYPE_OPTIONS, {
    required_error: 'Please select a team type',
  }),
  revenue_band: z.enum(REVENUE_BAND_OPTIONS).optional(),
})

// Infer TypeScript type from schema
export type BusinessProfileFormData = z.infer<typeof businessProfileSchema>

// Type for database record (includes metadata)
export type BusinessProfile = BusinessProfileFormData & {
  id: string
  user_id: string
  created_at: string
  updated_at: string
}
