import { createClient } from '@/lib/supabase/server'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { CheckCircle2, XCircle, AlertCircle, Ban } from 'lucide-react'

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

export default async function QuotesPage() {
  const supabase = await createClient()

  const { data: quotes } = await supabase
    .from('quotes')
    .select(`
      *,
      opportunity:opportunities(
        id,
        name,
        account:accounts(id, name)
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quotes</h1>
          <p className="text-muted-foreground">All quote attempts across all opportunities</p>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead>Product Line</TableHead>
              <TableHead>Opportunity</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Premium</TableHead>
              <TableHead>Quote #</TableHead>
              <TableHead>Method</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes && quotes.length > 0 ? (
              quotes.map((quote) => {
                const OutcomeIcon = quote.outcome
                  ? outcomeIcons[quote.outcome as keyof typeof outcomeIcons]
                  : null

                return (
                  <TableRow key={quote.id}>
                    <TableCell>
                      {OutcomeIcon && (
                        <OutcomeIcon
                          className={`h-5 w-5 ${
                            outcomeColors[quote.outcome as keyof typeof outcomeColors]
                          }`}
                        />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link
                        href={`/quotes/${quote.id}`}
                        className="hover:underline"
                      >
                        {quote.carrier_name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{quote.product_line}</Badge>
                    </TableCell>
                    <TableCell>
                      {quote.opportunity ? (
                        <Link
                          href={`/opportunities/${quote.opportunity.id}`}
                          className="text-sm hover:underline"
                        >
                          {quote.opportunity.name}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      {quote.opportunity?.account ? (
                        <Link
                          href={`/accounts/${quote.opportunity.account.id}`}
                          className="text-sm hover:underline"
                        >
                          {quote.opportunity.account.name}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          statusColors[quote.status as keyof typeof statusColors] ||
                          'bg-gray-500'
                        }
                      >
                        {quote.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {quote.premium
                        ? `$${Number(quote.premium).toLocaleString()}`
                        : '—'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {quote.quote_number || '—'}
                    </TableCell>
                    <TableCell>
                      {quote.submission_method ? (
                        <Badge variant="outline" className="text-xs">
                          {quote.submission_method === 'api' ? 'API' : 'Agent'}
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No quotes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}