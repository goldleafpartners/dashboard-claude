import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, FileText, Shield, DollarSign, CheckCircle2, Target } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch key metrics
  const [
    accountsResult,
    opportunitiesResult,
    policiesResult,
    quotesResult,
    recentOpportunities,
  ] = await Promise.all([
    supabase.from('accounts').select('id', { count: 'exact', head: true }),
    supabase.from('opportunities').select('id, stage'),
    supabase.from('policies').select('id, premium, status').eq('status', 'active'),
    supabase.from('quotes').select('id, outcome'),
    supabase
      .from('opportunities')
      .select(`
        *,
        account:accounts(id, name)
      `)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const totalAccounts = accountsResult.count || 0
  const allOpportunities = opportunitiesResult.data || []
  const totalOpportunities = allOpportunities.length
  const oppsByStage = allOpportunities.reduce((acc, opp) => {
    acc[opp.stage] = (acc[opp.stage] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const activePolicies = policiesResult.data?.length || 0
  const totalPremium = policiesResult.data?.reduce((sum, p) => sum + (Number(p.premium) || 0), 0) || 0

  const allQuotes = quotesResult.data || []
  const quotedCount = allQuotes.filter((q) => q.outcome === 'quoted').length

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
            <CardTitle>Pipeline by Stage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Intake</Badge>
              </div>
              <span className="text-2xl font-bold">{oppsByStage['intake'] || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Quote</Badge>
              </div>
              <span className="text-2xl font-bold">{oppsByStage['quote'] || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">UW Review</Badge>
              </div>
              <span className="text-2xl font-bold">{oppsByStage['uw_review'] || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Bind</Badge>
              </div>
              <span className="text-2xl font-bold">{oppsByStage['bind'] || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quote Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Quoted</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{quotedCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Total Attempts</span>
              </div>
              <span className="text-2xl font-bold">{allQuotes.length}</span>
            </div>
            {allQuotes.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">
                  {Math.round((quotedCount / allQuotes.length) * 100)}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOpportunities.data && recentOpportunities.data.length > 0 ? (
            <div className="space-y-3">
              {recentOpportunities.data.map((opp) => (
                <div key={opp.id} className="flex items-center justify-between">
                  <div>
                    <Link
                      href={`/opportunities/${opp.id}`}
                      className="font-medium hover:underline"
                    >
                      {opp.name}
                    </Link>
                    {opp.account && (
                      <p className="text-sm text-muted-foreground">
                        {opp.account.name}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline">{opp.stage}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No opportunities yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}