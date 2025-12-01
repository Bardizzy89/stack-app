import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/actions/auth'
import { getBusinessProfile } from '@/app/actions/business-profile'
import { getUserStack } from '@/app/actions/current-stack'
import { getComparisonSummary } from '@/app/actions/comparison'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Target, DollarSign } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if user has a business profile
  const businessProfile = await getBusinessProfile()

  // Redirect to profile creation if no profile exists
  if (!businessProfile) {
    redirect('/profile')
  }

  // Check if user has a current stack
  const stackResult = await getUserStack()
  const userStack = stackResult.success ? stackResult.data : null

  // Check if comparison is ready
  let comparisonReady = false
  let techHealthScore = 0
  let monthlySavings = 0

  if (userStack) {
    const comparisonResult = await getComparisonSummary(userStack.id)
    if (comparisonResult.success && comparisonResult.data) {
      comparisonReady = true
      techHealthScore = comparisonResult.data.tech_health_score
      monthlySavings = comparisonResult.data.total_monthly_savings
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
            <p className="text-slate-600">Welcome back, {businessProfile.company_name}!</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/profile">Edit Profile</Link>
            </Button>
            <form action={signOut}>
              <Button variant="outline" type="submit">
                Sign Out
              </Button>
            </form>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Business Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Business Profile</CardTitle>
                <Badge className="bg-green-600">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Complete
                </Badge>
              </div>
              <CardDescription>Your company information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-500">Industry:</span>{' '}
                  <span className="font-medium text-slate-900">{businessProfile.industry}</span>
                </div>
                <div>
                  <span className="text-slate-500">Company Size:</span>{' '}
                  <span className="font-medium text-slate-900">{businessProfile.company_size}</span>
                </div>
                <div>
                  <span className="text-slate-500">Team Type:</span>{' '}
                  <span className="font-medium text-slate-900">{businessProfile.team_type}</span>
                </div>
                <div>
                  <span className="text-slate-500">Location:</span>{' '}
                  <span className="font-medium text-slate-900">{businessProfile.state}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Stack Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Current Tech Stack</CardTitle>
                {userStack ? (
                  <Badge className="bg-green-600">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Complete
                  </Badge>
                ) : (
                  <Badge variant="secondary">Pending</Badge>
                )}
              </div>
              <CardDescription>
                {userStack ? 'Your tools have been saved' : 'Add your current tools'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userStack ? (
                <div className="space-y-3">
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="text-slate-500">Status:</span>{' '}
                      <span className="font-medium text-slate-900 capitalize">{userStack.payment_status}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Created:</span>{' '}
                      <span className="font-medium text-slate-900">
                        {new Date(userStack.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {userStack.payment_status === 'pending' && (
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                      asChild
                    >
                      <Link href={`/payment?stack_id=${userStack.id}`}>
                        Continue to Payment
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">
                    Add your current tools to get AI-powered recommendations and identify savings.
                  </p>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    asChild
                  >
                    <Link href="/current-stack">
                      Add Current Tools
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stack Analysis Results Card */}
          {comparisonReady && (
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-700" />
                    Your Results
                  </CardTitle>
                  <Badge className="bg-green-600">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Ready
                  </Badge>
                </div>
                <CardDescription className="text-green-700">Tech stack analysis complete</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white/60 rounded-lg">
                      <div
                        className={`text-3xl font-bold ${
                          techHealthScore >= 80
                            ? 'text-green-600'
                            : techHealthScore >= 60
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {techHealthScore}
                      </div>
                      <div className="text-xs text-slate-600 mt-1">Health Score</div>
                    </div>
                    <div className="text-center p-3 bg-white/60 rounded-lg">
                      <div className="flex items-center justify-center gap-1">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <span className="text-3xl font-bold text-green-600">
                          {monthlySavings.toFixed(0)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">Monthly Savings</div>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    asChild
                  >
                    <Link href="/results">
                      View Full Analysis
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
              <CardDescription>Track your optimization journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-slate-900">Business profile created</span>
                </div>
                <div className="flex items-center gap-2">
                  {userStack ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-slate-300" />
                  )}
                  <span className={userStack ? 'text-slate-900' : 'text-slate-500'}>Current stack added</span>
                </div>
                <div className="flex items-center gap-2">
                  {userStack?.payment_status === 'paid' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-slate-300" />
                  )}
                  <span
                    className={userStack?.payment_status === 'paid' ? 'text-slate-900' : 'text-slate-500'}
                  >
                    Payment completed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {userStack?.payment_status === 'paid' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-slate-300" />
                  )}
                  <span
                    className={userStack?.payment_status === 'paid' ? 'text-slate-900' : 'text-slate-500'}
                  >
                    Optimal stack generated
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
