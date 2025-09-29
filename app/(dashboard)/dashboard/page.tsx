import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, FileText, Shield, DollarSign } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch key metrics
  const [accountsResult, opportunitiesResult, policiesResult] = await Promise.all([
    supabase.from('accounts').select('id', { count: 'exact', head: true }),
    supabase.from('opportunities').select('id, stage', { count: 'exact', head: true }),
    supabase.from('policies').select('id, premium, status').eq('status', 'active'),
  ])

  const totalAccounts = accountsResult.count || 0
  const totalOpportunities = opportunitiesResult.count || 0
  const activePolicies = policiesResult.data?.length || 0
  const totalPremium = policiesResult.data?.reduce((sum, p) => sum + (Number(p.premium) || 0), 0) || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to ContractorNerd CRM</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAccounts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Opportunities</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOpportunities}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePolicies}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Premium</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalPremium.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Renewals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No upcoming renewals</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}