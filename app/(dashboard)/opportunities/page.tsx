import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

const stageColors = {
  intake: 'bg-gray-500',
  quote: 'bg-blue-500',
  uw_review: 'bg-yellow-500',
  bind: 'bg-green-500',
  lost: 'bg-red-500',
}

const stageLabels = {
  intake: 'Intake',
  quote: 'Quote',
  uw_review: 'UW Review',
  bind: 'Bind',
  lost: 'Lost',
}

export default async function OpportunitiesPage() {
  const supabase = await createClient()

  const { data: opportunities } = await supabase
    .from('opportunities')
    .select(`
      *,
      account:accounts(name),
      owner:profiles(full_name)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Opportunities</h1>
          <p className="text-muted-foreground">Manage your sales pipeline</p>
        </div>
        <Link href="/opportunities/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Opportunity
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Product Lines</TableHead>
              <TableHead>Expected Premium</TableHead>
              <TableHead>Close Date</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {opportunities && opportunities.length > 0 ? (
              opportunities.map((opp) => (
                <TableRow key={opp.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/opportunities/${opp.id}`}
                      className="hover:underline"
                    >
                      {opp.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {opp.account ? (
                      <Link
                        href={`/accounts/${opp.account_id}`}
                        className="hover:underline text-sm"
                      >
                        {opp.account.name}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={stageColors[opp.stage as keyof typeof stageColors]}>
                      {stageLabels[opp.stage as keyof typeof stageLabels]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {opp.product_lines?.map((line: string) => (
                        <Badge key={line} variant="outline" className="text-xs">
                          {line}
                        </Badge>
                      )) || '—'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {opp.expected_premium
                      ? `$${Number(opp.expected_premium).toLocaleString()}`
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {opp.close_date
                      ? format(new Date(opp.close_date), 'MMM d, yyyy')
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {opp.owner?.full_name || '—'}
                  </TableCell>
                  <TableCell>
                    <Link href={`/opportunities/${opp.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No opportunities found. Create your first opportunity to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}