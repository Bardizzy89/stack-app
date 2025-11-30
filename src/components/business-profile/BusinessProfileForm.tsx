'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { businessProfileSchema, BusinessProfileFormData, BusinessProfile } from '@/lib/validations/business-profile'
import {
  INDUSTRY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  TEAM_TYPE_OPTIONS,
  REVENUE_BAND_OPTIONS,
  US_STATES,
} from '@/lib/constants/business-options'
import { createBusinessProfile, updateBusinessProfile } from '@/app/actions/business-profile'

interface BusinessProfileFormProps {
  existingProfile?: BusinessProfile | null
}

export function BusinessProfileForm({ existingProfile }: BusinessProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditMode = !!existingProfile

  const form = useForm<BusinessProfileFormData>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      company_name: existingProfile?.company_name || '',
      industry: existingProfile?.industry || undefined,
      company_size: existingProfile?.company_size || undefined,
      state: existingProfile?.state || undefined,
      team_type: existingProfile?.team_type || undefined,
      revenue_band: existingProfile?.revenue_band || undefined,
    },
  })

  const onSubmit = async (data: BusinessProfileFormData) => {
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value)
        }
      })

      const result = isEditMode
        ? await updateBusinessProfile(formData)
        : await createBusinessProfile(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(
          isEditMode
            ? 'Profile updated successfully!'
            : 'Profile created successfully!'
        )
        // Redirect is handled in server action
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Company Name */}
        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Acme Corporation"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Industry */}
        <FormField
          control={form.control}
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Industry</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {INDUSTRY_OPTIONS.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Company Size and Team Type - 2 columns on desktop */}
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="company_size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Size</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COMPANY_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="team_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TEAM_TYPE_OPTIONS.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* State and Revenue Band - 2 columns on desktop */}
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[300px]">
                    {US_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="revenue_band"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Revenue Band <span className="text-slate-400">(Optional)</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select revenue band" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {REVENUE_BAND_OPTIONS.map((band) => (
                      <SelectItem key={band} value={band}>
                        {band}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Saving...'
              : isEditMode
              ? 'Update Profile'
              : 'Save & Continue'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
