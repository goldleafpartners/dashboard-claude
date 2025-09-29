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
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function AccountsPage() {
  const supabase = await createClient()

  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">Manage your client accounts</p>
        </div>
        <Link href="/accounts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Account
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts && accounts.length > 0 ? (
              accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/accounts/${account.id}`}
                      className="hover:underline"
                    >
                      {account.name}
                    </Link>
                  </TableCell>
                  <TableCell>{account.industry || '—'}</TableCell>
                  <TableCell>
                    {account.city && account.state
                      ? `${account.city}, ${account.state}`
                      : '—'}
                  </TableCell>
                  <TableCell>{account.email || '—'}</TableCell>
                  <TableCell>{account.phone || '—'}</TableCell>
                  <TableCell>
                    <Link href={`/accounts/${account.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No accounts found. Create your first account to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}