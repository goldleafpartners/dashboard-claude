import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Plus } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { StageProgress } from '@/components/opportunities/stage-progress'
import { QuoteAttemptsPanel } from '@/components/opportunities/quote-attempts-panel'

export default async function OpportunityDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: opportunity } = await supabase
    .from('opportunities')
    .select(`
      *,
      account:accounts(id, name, city, state),
      owner:profiles(full_name),
      quotes(*)
    `)
    .eq('id', params.id)
    .single()

  if (!opportunity) {
    notFound()
  }

  const quotes = opportunity.quotes || []

  return (
    <div className="space-y-6">
      <div>
        <Link href="/opportunities">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Opportunities
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{opportunity.name}</h1>
          {opportunity.account && (
            <Link
              href={`/accounts/${opportunity.account.id}`}
              className="text-muted-foreground hover:underline"
            >
              {opportunity.account.name}
            </Link>
          )}
        </div>
        <Link href={`/opportunities/${opportunity.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stage Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <StageProgress currentStage={opportunity.stage} />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Opportunity Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Product Lines</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {opportunity.product_lines?.map((line: string) => (
                    <Badge key={line} variant="outline">
                      {line}
                    </Badge>
                  )) || <p className="text-sm">—</p>}
                </div>
              </div>

              {opportunity.expected_premium && (
                <div>
                  <p className="text-sm text-muted-foreground">Expected Premium</p>
                  <p className="font-medium mt-1">
                    ${Number(opportunity.expected_premium).toLocaleString()}
                  </p>
                </div>
              )}

              {opportunity.probability !== null && (
                <div>
                  <p className="text-sm text-muted-foreground">Probability</p>
                  <p className="font-medium mt-1">{opportunity.probability}%</p>
                </div>
              )}

              {opportunity.close_date && (
                <div>
                  <p className="text-sm text-muted-foreground">Expected Close Date</p>
                  <p className="font-medium mt-1">
                    {format(new Date(opportunity.close_date), 'MMM d, yyyy')}
                  </p>
                </div>
              )}

              {opportunity.owner && (
                <div>
                  <p className="text-sm text-muted-foreground">Owner</p>
                  <p className="font-medium mt-1">{opportunity.owner.full_name}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium mt-1">
                  {format(new Date(opportunity.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            </div>

            {opportunity.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="mt-1">{opportunity.notes}</p>
              </div>
            )}

            {opportunity.stage === 'lost' && opportunity.lost_reason && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-900">Lost Reason</p>
                <p className="text-sm text-red-700 mt-1">{opportunity.lost_reason}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Quote Attempts</p>
              <p className="text-2xl font-bold">{quotes.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quoted</p>
              <p className="text-2xl font-bold text-green-600">
                {quotes.filter((q: any) => q.outcome === 'quoted').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Declined</p>
              <p className="text-2xl font-bold text-red-600">
                {quotes.filter((q: any) => q.outcome === 'declined').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="quotes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="quotes">
            Quote Attempts ({quotes.length})
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="quotes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Quote Attempts</h3>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Quote
            </Button>
          </div>
          <QuoteAttemptsPanel quotes={quotes} />
        </TabsContent>

        <TabsContent value="activity">
          <p className="text-sm text-muted-foreground">Activity timeline coming soon</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}