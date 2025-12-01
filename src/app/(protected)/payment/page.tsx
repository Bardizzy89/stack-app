import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, CreditCard, CheckCircle2 } from 'lucide-react'

interface PaymentPageProps {
  searchParams: Promise<{ stack_id?: string }>
}

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const params = await searchParams
  const stackId = params.stack_id

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Main Card */}
        <Card className="bg-white/80 backdrop-blur-xl shadow-2xl border-slate-200">
          <CardHeader className="text-center pb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-6 mx-auto">
              <CreditCard className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-slate-900">Payment Coming Soon</CardTitle>
            <CardDescription className="text-lg mt-3">
              Your tech stack has been saved successfully! Payment integration will be added in a future update.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Stack ID Display */}
            {stackId && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Stack ID</p>
                    <p className="font-mono text-sm font-semibold text-slate-900">{stackId}</p>
                  </div>
                  <Badge className="bg-green-600">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Saved
                  </Badge>
                </div>
              </div>
            )}

            {/* What You Get */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-4 text-lg">What You'll Get After Payment:</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 mt-0.5">✓</span>
                  <span className="font-medium">Complete tech stack comparison analysis (generating now!)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-3 mt-0.5">✓</span>
                  <span>Gap detection showing missing critical categories</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-3 mt-0.5">✓</span>
                  <span>Redundancy analysis identifying wasteful tool overlap</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-3 mt-0.5">✓</span>
                  <span>Outdated tool detection with modern replacements</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-3 mt-0.5">✓</span>
                  <span>Cost savings calculation (monthly + annual)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-3 mt-0.5">✓</span>
                  <span>Tech health score (0-100) and detailed breakdown</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-3 mt-0.5">✓</span>
                  <span>Prioritized action items to optimize your stack</span>
                </li>
              </ul>
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  <strong>Note:</strong> Your comparison analysis is being generated in the background. Check your dashboard in 30-60 seconds to view your results!
                </p>
              </div>
            </div>

            {/* Payment Coming Soon */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-4 text-lg">Payment Integration Coming Soon:</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start">
                  <span className="text-slate-400 mr-3 mt-0.5">○</span>
                  <span>Stripe integration for secure payment processing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-slate-400 mr-3 mt-0.5">○</span>
                  <span>One-time payment of $149 for full access</span>
                </li>
                <li className="flex items-start">
                  <span className="text-slate-400 mr-3 mt-0.5">○</span>
                  <span>Downloadable PDF report</span>
                </li>
              </ul>
            </div>

            {/* Current Status */}
            <div className="border-t pt-8">
              <h3 className="font-semibold text-slate-900 mb-4 text-lg">What You've Completed:</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-600 rounded-full">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Business Profile</p>
                    <p className="text-sm text-slate-600">Your company information is saved</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-600 rounded-full">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Current Tech Stack</p>
                    <p className="text-sm text-slate-600">Your tools have been parsed and saved</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-slate-300 rounded-full">
                    <span className="text-sm font-semibold text-slate-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Payment</p>
                    <p className="text-sm text-slate-600">Coming soon - Stripe integration in progress</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-slate-300 rounded-full">
                    <span className="text-sm font-semibold text-slate-600">4</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Optimal Stack Results</p>
                    <p className="text-sm text-slate-600">Available after payment</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button className="flex-1" variant="outline" asChild>
                <Link href="/dashboard">Return to Dashboard</Link>
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                disabled
              >
                Proceed to Payment (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
