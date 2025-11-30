import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
            <p className="text-slate-600">Welcome to The Stack App</p>
          </div>
          <form action={signOut}>
            <Button variant="outline" type="submit">
              Sign Out
            </Button>
          </form>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Welcome!</CardTitle>
              <CardDescription>Your account is active</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Logged in as: <span className="font-medium">{user?.email}</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>Complete your tech stack assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Start by creating your business profile to get personalized recommendations.
              </p>
              <Button className="w-full" disabled>
                Create Business Profile (Coming Soon)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Epic 1 Complete!</CardTitle>
              <CardDescription>Authentication is working</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-slate-600">
                <p>✅ Next.js 14 initialized</p>
                <p>✅ Supabase connected</p>
                <p>✅ Database schema created</p>
                <p>✅ Auth working</p>
                <p>✅ Routes protected</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
