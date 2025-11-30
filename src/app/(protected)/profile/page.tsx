import { getBusinessProfile } from '@/app/actions/business-profile'
import { BusinessProfileForm } from '@/components/business-profile/BusinessProfileForm'
import { ProgressIndicator } from '@/components/shared/ProgressIndicator'
import { Card } from '@/components/ui/card'

export default async function ProfilePage() {
  const existingProfile = await getBusinessProfile()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={1} stepName="Business Profile" />

        {/* Form Card */}
        <Card className="p-8 bg-white/80 backdrop-blur-xl shadow-2xl border-slate-200">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900">
              {existingProfile ? 'Edit Your Profile' : 'Tell us about your business'}
            </h3>
            <p className="text-slate-600 mt-1">
              {existingProfile
                ? 'Update your business information below.'
                : 'This helps us provide personalized recommendations for your tech stack.'}
            </p>
          </div>

          <BusinessProfileForm existingProfile={existingProfile} />
        </Card>

        {/* Info Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            All information is encrypted and kept secure. We never share your data.
          </p>
        </div>
      </div>
    </div>
  )
}
