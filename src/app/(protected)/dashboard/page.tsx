import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/actions/auth'
import { getBusinessProfile } from '@/app/actions/business-profile'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

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
          <Card>
            <CardHeader>
              <CardTitle>Business Profile</CardTitle>
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

          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>Complete your tech stack assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Add your current tools to get AI-powered recommendations and identify savings.
              </p>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700" asChild>
                <Link href="/current-stack">Add Current Tools</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Epic 2 Complete!</CardTitle>
              <CardDescription>Business profile created</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-slate-600">
                <p>✅ Profile form with validation</p>
                <p>✅ Saved to Supabase</p>
                <p>✅ Edit functionality</p>
                <p>✅ Progress indicator</p>
                <p>✅ Toast notifications</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
