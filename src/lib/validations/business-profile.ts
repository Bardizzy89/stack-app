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
  industry: z.enum(INDUSTRY_OPTIONS),
  company_size: z.enum(COMPANY_SIZE_OPTIONS),
  state: z.enum(US_STATES),
  team_type: z.enum(TEAM_TYPE_OPTIONS),
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
