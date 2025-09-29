import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, Ban, FileText } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

const outcomeIcons = {
  quoted: CheckCircle2,
  declined: XCircle,
  error: AlertCircle,
  no_offer: Ban,
}

const outcomeColors = {
  quoted: 'text-green-600 bg-green-50',
  declined: 'text-red-600 bg-red-50',
  error: 'text-orange-600 bg-orange-50',
  no_offer: 'text-gray-600 bg-gray-50',
}

const statusColors = {
  draft: 'bg-gray-500',
  submitted_api: 'bg-blue-500',
  submitted_agent: 'bg-blue-500',
  awaiting_uw: 'bg-yellow-500',
  quoted: 'bg-green-500',
  accepted: 'bg-green-600',
  rejected: 'bg-red-500',
  expired: 'bg-gray-400',
}

export default async function QuoteDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: quote } = await supabase
    .from('quotes')
    .select(`
      *,
      opportunity:opportunities(
        id,
        name,
        account:accounts(id, name)
      ),
      browserbase_runs(*)
    `)
    .eq('id', params.id)
    .single()

  if (!quote) {
    notFound()
  }

  const OutcomeIcon = quote.outcome
    ? outcomeIcons[quote.outcome as keyof typeof outcomeIcons]
    : null

  const browserbaseRuns = quote.browserbase_runs || []

  return (
    <div className="space-y-6">
      <div>
        <Link href="/quotes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quotes
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            {OutcomeIcon && (
              <OutcomeIcon
                className={`h-8 w-8 ${outcomeColors[quote.outcome as keyof typeof outcomeColors]?.split(' ')[0]}`}
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">{quote.carrier_name}</h1>
              <p className="text-muted-foreground">{quote.product_line}</p>
            </div>
          </div>
          {quote.opportunity && (
            <div className="mt-2">
              <Link
                href={`/opportunities/${quote.opportunity.id}`}
                className="text-sm hover:underline"
              >
                {quote.opportunity.name}
              </Link>
              {quote.opportunity.account && (
                <span className="text-sm text-muted-foreground">
                  {' · '}
                  <Link
                    href={`/accounts/${quote.opportunity.account.id}`}
                    className="hover:underline"
                  >
                    {quote.opportunity.account.name}
                  </Link>
                </span>
              )}
            </div>
          )}
        </div>
        <Badge
          className={
            statusColors[quote.status as keyof typeof statusColors] || 'bg-gray-500'
          }
        >
          {quote.status.replace('_', ' ')}
        </Badge>
      </div>

      {quote.outcome && (quote.decline_reason || quote.error_message) && (
        <Card className={outcomeColors[quote.outcome as keyof typeof outcomeColors]}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              {OutcomeIcon && <OutcomeIcon className="h-5 w-5 mt-0.5" />}
              <div>
                <p className="font-semibold">
                  {quote.outcome === 'declined' && 'Quote Declined'}
                  {quote.outcome === 'error' && 'Error During Quote'}
                  {quote.outcome === 'no_offer' && 'No Offer'}
                </p>
                <p className="text-sm mt-1">
                  {quote.decline_reason || quote.error_message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quote Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {quote.quote_number && (
                <div>
                  <p className="text-sm text-muted-foreground">Quote Number</p>
                  <p className="font-medium mt-1">{quote.quote_number}</p>
                </div>
              )}

              {quote.premium && (
                <div>
                  <p className="text-sm text-muted-foreground">Premium</p>
                  <p className="text-xl font-bold mt-1">
                    ${Number(quote.premium).toLocaleString()}
                  </p>
                </div>
              )}

              {quote.effective_date && (
                <div>
                  <p className="text-sm text-muted-foreground">Effective Date</p>
                  <p className="font-medium mt-1">
                    {format(new Date(quote.effective_date), 'MMM d, yyyy')}
                  </p>
                </div>
              )}

              {quote.expiration_date && (
                <div>
                  <p className="text-sm text-muted-foreground">Expiration Date</p>
                  <p className="font-medium mt-1">
                    {format(new Date(quote.expiration_date), 'MMM d, yyyy')}
                  </p>
                </div>
              )}

              {quote.submission_method && (
                <div>
                  <p className="text-sm text-muted-foreground">Submission Method</p>
                  <p className="font-medium mt-1">
                    {quote.submission_method === 'api' ? 'API' : 'Browserbase Agent'}
                  </p>
                </div>
              )}

              {quote.submitted_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Submitted At</p>
                  <p className="font-medium mt-1">
                    {format(new Date(quote.submitted_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              )}

              {quote.quoted_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Quoted At</p>
                  <p className="font-medium mt-1">
                    {format(new Date(quote.quoted_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              )}
            </div>

            {quote.quote_document_url && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Quote Document</p>
                <a
                  href={quote.quote_document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <FileText className="h-4 w-4" />
                  View Quote Document
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quote.created_at && (
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm font-medium">
                  {format(new Date(quote.created_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            )}
            {quote.submitted_at && (
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="text-sm font-medium">
                  {format(new Date(quote.submitted_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            )}
            {quote.quoted_at && (
              <div>
                <p className="text-sm text-muted-foreground">Quoted</p>
                <p className="text-sm font-medium">
                  {format(new Date(quote.quoted_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="coverage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="coverage">Coverage Details</TabsTrigger>
          <TabsTrigger value="browserbase">
            Browserbase Runs ({browserbaseRuns.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="coverage">
          <Card>
            <CardHeader>
              <CardTitle>Coverage Details</CardTitle>
            </CardHeader>
            <CardContent>
              {quote.coverage_details ? (
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(quote.coverage_details, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No coverage details available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="browserbase">
          {browserbaseRuns.length > 0 ? (
            <div className="space-y-3">
              {browserbaseRuns.map((run: any) => (
                <Card key={run.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">
                          Session: {run.browserbase_session_id || 'N/A'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Started: {format(new Date(run.started_at), 'MMM d, yyyy h:mm a')}
                        </p>
                        {run.completed_at && (
                          <p className="text-sm text-muted-foreground">
                            Completed: {format(new Date(run.completed_at), 'MMM d, yyyy h:mm a')}
                          </p>
                        )}
                        {run.error_message && (
                          <p className="text-sm text-red-600 mt-2">
                            Error: {run.error_message}
                          </p>
                        )}
                      </div>
                      <Badge>{run.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  No Browserbase runs for this quote
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}