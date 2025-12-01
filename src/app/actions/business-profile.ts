'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { businessProfileSchema, BusinessProfile } from '@/lib/validations/business-profile'

export async function getBusinessProfile(): Promise<BusinessProfile | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return null
  }

  return data as BusinessProfile
}

export async function createBusinessProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'User not authenticated' }
  }

  // Parse and validate form data
  const rawData = {
    company_name: formData.get('company_name'),
    industry: formData.get('industry'),
    company_size: formData.get('company_size'),
    state: formData.get('state'),
    team_type: formData.get('team_type'),
    revenue_band: formData.get('revenue_band') || undefined,
  }

  // Validate with Zod
  const validation = businessProfileSchema.safeParse(rawData)

  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const validatedData = validation.data

  // Insert into database
  const { data, error } = await supabase
    .from('business_profiles')
    .insert({
      user_id: user.id,
      ...validatedData,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      // Unique constraint violation
      return { error: 'You already have a business profile. Please edit instead.' }
    }
    return { error: 'Failed to create profile. Please try again.' }
  }

  // Redirect to current stack page
  redirect('/current-stack')
}

export async function updateBusinessProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'User not authenticated' }
  }

  // Parse and validate form data
  const rawData = {
    company_name: formData.get('company_name'),
    industry: formData.get('industry'),
    company_size: formData.get('company_size'),
    state: formData.get('state'),
    team_type: formData.get('team_type'),
    revenue_band: formData.get('revenue_band') || undefined,
  }

  // Validate with Zod
  const validation = businessProfileSchema.safeParse(rawData)

  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const validatedData = validation.data

  // Update in database
  const { data, error } = await supabase
    .from('business_profiles')
    .update({
      ...validatedData,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: 'Failed to update profile. Please try again.' }
  }

  // Redirect to dashboard after update
  redirect('/dashboard')
}
