import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, XCircle, AlertCircle, Ban } from 'lucide-react'

interface Quote {
  id: string
  carrier_name: string
  product_line: string
  status: string
  quote_number: string | null
  premium: number | null
  outcome: string | null
  decline_reason: string | null
  error_message: string | null
  submission_method: string | null
  quoted_at: string | null
}

interface QuoteAttemptsPanelProps {
  quotes: Quote[]
}

const outcomeIcons = {
  quoted: CheckCircle2,
  declined: XCircle,
  error: AlertCircle,
  no_offer: Ban,
}

const outcomeColors = {
  quoted: 'text-green-600',
  declined: 'text-red-600',
  error: 'text-orange-600',
  no_offer: 'text-gray-600',
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

export function QuoteAttemptsPanel({ quotes }: QuoteAttemptsPanelProps) {
  if (quotes.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No quotes submitted yet for this opportunity.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {quotes.map((quote) => {
        const OutcomeIcon = quote.outcome ? outcomeIcons[quote.outcome as keyof typeof outcomeIcons] : null
        const outcomeColor = quote.outcome ? outcomeColors[quote.outcome as keyof typeof outcomeColors] : ''

        return (
          <Card key={quote.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {OutcomeIcon && (
                    <OutcomeIcon className={`h-5 w-5 mt-0.5 ${outcomeColor}`} />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/quotes/${quote.id}`}
                        className="font-medium hover:underline"
                      >
                        {quote.carrier_name}
                      </Link>
                      <Badge variant="outline" className="text-xs">
                        {quote.product_line}
                      </Badge>
                      {quote.submission_method && (
                        <Badge variant="outline" className="text-xs">
                          {quote.submission_method === 'api' ? 'API' : 'Agent'}
                        </Badge>
                      )}
                    </div>

                    {quote.quote_number && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Quote #: {quote.quote_number}
                      </p>
                    )}

                    {quote.premium && (
                      <p className="text-sm font-medium mt-1">
                        ${Number(quote.premium).toLocaleString()} premium
                      </p>
                    )}

                    {quote.decline_reason && (
                      <p className="text-sm text-red-600 mt-2">
                        <strong>Declined:</strong> {quote.decline_reason}
                      </p>
                    )}

                    {quote.error_message && (
                      <p className="text-sm text-orange-600 mt-2">
                        <strong>Error:</strong> {quote.error_message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Badge className={statusColors[quote.status as keyof typeof statusColors] || 'bg-gray-500'}>
                    {quote.status.replace('_', ' ')}
                  </Badge>
                  {quote.quoted_at && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(quote.quoted_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}