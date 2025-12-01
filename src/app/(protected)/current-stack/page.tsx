import { getBusinessProfile } from '@/app/actions/business-profile'
import { redirect } from 'next/navigation'
import { ProgressIndicator } from '@/components/shared/ProgressIndicator'
import { CurrentStackFlow } from '@/components/current-stack/CurrentStackFlow'

export default async function CurrentStackPage() {
  // Ensure user has a business profile before accessing this page
  const businessProfile = await getBusinessProfile()

  if (!businessProfile) {
    redirect('/profile')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={2} stepName="Current Tech Stack" />

        {/* Current Stack Flow */}
        <CurrentStackFlow businessProfileId={businessProfile.id} />
      </div>
    </div>
  )
}
