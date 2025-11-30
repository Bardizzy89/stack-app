// Business Profile Form Options

export const INDUSTRY_OPTIONS = [
  'Professional Services',
  'Manufacturing',
  'Logistics / Supply Chain',
  'Healthcare',
  'Finance & Insurance',
  'Retail / E-commerce',
  'Construction',
  'Real Estate',
  'Hospitality / Travel',
  'Education / Nonprofit',
  'Technology',
  'Other',
] as const

export const COMPANY_SIZE_OPTIONS = [
  '1–10 employees',
  '11–50 employees',
  '51–200 employees',
  '201–500 employees',
  '500+ employees',
] as const

export const TEAM_TYPE_OPTIONS = [
  'Remote',
  'Hybrid',
  'In-Office',
  'Distributed (multi-location)',
] as const

export const REVENUE_BAND_OPTIONS = [
  '<$250K',
  '$250K–$1M',
  '$1M–$5M',
  '$5M–$10M',
  '$10M–$50M',
  '$50M+',
] as const

export const US_STATES = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
] as const

// Type exports for TypeScript
export type Industry = typeof INDUSTRY_OPTIONS[number]
export type CompanySize = typeof COMPANY_SIZE_OPTIONS[number]
export type TeamType = typeof TEAM_TYPE_OPTIONS[number]
export type RevenueBand = typeof REVENUE_BAND_OPTIONS[number]
export type USState = typeof US_STATES[number]
