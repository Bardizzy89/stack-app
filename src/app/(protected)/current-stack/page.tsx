import { getBusinessProfile } from '@/app/actions/business-profile'
import { redirect } from 'next/navigation'
import { ProgressIndicator } from '@/components/shared/ProgressIndicator'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function CurrentStackPage() {
  // Ensure user has a business profile before accessing this page
  const businessProfile = await getBusinessProfile()

  if (!businessProfile) {
    redirect('/profile')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={2} stepName="Current Tech Stack" />

        {/* Placeholder Card */}
        <Card className="p-12 bg-white/80 backdrop-blur-xl shadow-2xl border-slate-200 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-6">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Tech Stack Assessment
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              This feature is coming in Epic 3! You'll be able to paste your current tools,
              get AI-powered analysis, and receive personalized recommendations.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-slate-900 mb-3">What's Coming:</h3>
            <ul className="text-left text-sm text-slate-600 space-y-2">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                Paste your current software/tools list
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                AI-powered parsing and categorization
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                Cost tracking and waste analysis
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                Identify redundancies and gaps
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                Get personalized optimization recommendations
              </li>
            </ul>
          </div>

          <Button variant="outline" asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </Card>
      </div>
    </div>
  )
}
