import { getBusinessProfile } from '@/app/actions/business-profile'
import { redirect } from 'next/navigation'
import { ProgressIndicator } from '@/components/shared/ProgressIndicator'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function OptimalStackPage() {
  // Ensure user has a business profile
  const businessProfile = await getBusinessProfile()

  if (!businessProfile) {
    redirect('/profile')
  }

  // NOTE: This page requires Epic 4 (Current Stack Input) to be completed first
  // For now, we show a placeholder explaining the dependency

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={3} stepName="Optimal Tech Stack" />

        {/* Placeholder Card */}
        <Card className="p-12 bg-white/80 backdrop-blur-xl shadow-2xl border-slate-200 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-6">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Epic 3: Optimal Stack Engine - Ready!
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              The optimal stack generation system is built and ready to deliver AI-powered recommendations.
              This feature activates after you complete Epic 4 (Current Stack Input).
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-slate-900 mb-3">What Epic 3 Delivers:</h3>
            <div className="grid md:grid-cols-2 gap-4 text-left text-sm text-slate-600">
              <div className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>GPT-4 powered tech stack generation</span>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Intelligent caching by industry/size/team</span>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>9 categories with primary + alternatives</span>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Personalized "why" for each recommendation</span>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Tool cards with pricing, descriptions, links</span>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>"Mark as Using" and "Dismiss" interactions</span>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>"Refresh Recommendations" button</span>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Stored in PostgreSQL as JSONB</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-slate-900 mb-2">How It Works:</h3>
            <ol className="text-left text-sm text-slate-600 space-y-2 max-w-2xl mx-auto">
              <li>1. User completes business profile (Epic 2) ✅</li>
              <li>2. User enters current tech stack (Epic 4) 🔄</li>
              <li>3. System checks cache for (industry + size + team) match</li>
              <li>4. If cached: returns existing optimal stack instantly</li>
              <li>5. If not cached: GPT-4 generates personalized recommendations</li>
              <li>6. Results stored in database for future reuse</li>
              <li>7. User can "Refresh" to regenerate with latest AI</li>
            </ol>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-slate-500 mb-4">
              <strong>Next Epic:</strong> Epic 4 will build the Current Stack Input feature.
              Once complete, this page will display your AI-generated optimal stack!
            </p>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </Card>

        {/* Technical Details */}
        <div className="mt-6 text-center">
          <details className="text-sm text-slate-500">
            <summary className="cursor-pointer hover:text-slate-700">
              Technical Implementation Details
            </summary>
            <div className="mt-4 text-left bg-slate-100 rounded-lg p-4 space-y-2">
              <p><strong>Database:</strong> optimal_stacks table with JSONB storage</p>
              <p><strong>Cache Key:</strong> (industry, company_size_band, team_type)</p>
              <p><strong>AI Model:</strong> GPT-4 Turbo with JSON mode</p>
              <p><strong>Categories:</strong> CRM, PM, Accounting, File Storage, Comms, Automation, AI Tools, HR/Payroll, Security</p>
              <p><strong>Tool Fields:</strong> name, slug, website, pricing_tier, pricing_hint, description, why, is_primary</p>
              <p><strong>RLS Policies:</strong> Users see own stacks + cached stacks matching their profile</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
