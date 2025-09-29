import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Plus, Mail, Phone, Globe, MapPin } from 'lucide-react'
import Link from 'next/link'

export default async function AccountDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: account } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!account) {
    notFound()
  }

  const [contactsResult, opportunitiesResult, policiesResult] = await Promise.all([
    supabase.from('contacts').select('*').eq('account_id', params.id),
    supabase.from('opportunities').select('*').eq('account_id', params.id),
    supabase.from('policies').select('*').eq('account_id', params.id),
  ])

  const contacts = contactsResult.data || []
  const opportunities = opportunitiesResult.data || []
  const policies = policiesResult.data || []

  return (
    <div className="space-y-6">
      <div>
        <Link href="/accounts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Accounts
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{account.name}</h1>
          {account.dba_name && (
            <p className="text-muted-foreground">DBA: {account.dba_name}</p>
          )}
        </div>
        <Link href={`/accounts/${account.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {account.industry && (
                <div>
                  <p className="text-sm text-muted-foreground">Industry</p>
                  <p className="font-medium">{account.industry}</p>
                </div>
              )}
              {account.naics_code && (
                <div>
                  <p className="text-sm text-muted-foreground">NAICS Code</p>
                  <p className="font-medium">{account.naics_code}</p>
                </div>
              )}
              {account.annual_revenue && (
                <div>
                  <p className="text-sm text-muted-foreground">Annual Revenue</p>
                  <p className="font-medium">
                    ${Number(account.annual_revenue).toLocaleString()}
                  </p>
                </div>
              )}
              {account.employee_count && (
                <div>
                  <p className="text-sm text-muted-foreground">Employees</p>
                  <p className="font-medium">{account.employee_count}</p>
                </div>
              )}
              {account.years_in_business && (
                <div>
                  <p className="text-sm text-muted-foreground">Years in Business</p>
                  <p className="font-medium">{account.years_in_business}</p>
                </div>
              )}
            </div>

            {account.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="mt-1">{account.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {account.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${account.email}`} className="text-sm hover:underline">
                  {account.email}
                </a>
              </div>
            )}
            {account.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${account.phone}`} className="text-sm hover:underline">
                  {account.phone}
                </a>
              </div>
            )}
            {account.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a
                  href={account.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline"
                >
                  {account.website}
                </a>
              </div>
            )}
            {(account.address_line1 || account.city) && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  {account.address_line1 && <p>{account.address_line1}</p>}
                  {account.address_line2 && <p>{account.address_line2}</p>}
                  {(account.city || account.state || account.zip) && (
                    <p>
                      {account.city}
                      {account.city && account.state && ', '}
                      {account.state} {account.zip}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contacts">
            Contacts ({contacts.length})
          </TabsTrigger>
          <TabsTrigger value="opportunities">
            Opportunities ({opportunities.length})
          </TabsTrigger>
          <TabsTrigger value="policies">
            Policies ({policies.length})
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Contacts</h3>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </div>
          {contacts.length > 0 ? (
            <div className="space-y-2">
              {contacts.map((contact) => (
                <Card key={contact.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">
                          {contact.first_name} {contact.last_name}
                        </p>
                        {contact.title && (
                          <p className="text-sm text-muted-foreground">{contact.title}</p>
                        )}
                        <div className="mt-2 space-y-1">
                          {contact.email && (
                            <p className="text-sm">{contact.email}</p>
                          )}
                          {contact.phone && (
                            <p className="text-sm">{contact.phone}</p>
                          )}
                        </div>
                      </div>
                      {contact.is_primary && (
                        <Badge>Primary</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No contacts yet</p>
          )}
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Opportunities</h3>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Opportunity
            </Button>
          </div>
          {opportunities.length > 0 ? (
            <div className="space-y-2">
              {opportunities.map((opp) => (
                <Card key={opp.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{opp.name}</p>
                        {opp.expected_premium && (
                          <p className="text-sm text-muted-foreground">
                            ${Number(opp.expected_premium).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <Badge>{opp.stage}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No opportunities yet</p>
          )}
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Policies</h3>
          </div>
          {policies.length > 0 ? (
            <div className="space-y-2">
              {policies.map((policy) => (
                <Card key={policy.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{policy.policy_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {policy.carrier_name} • {policy.product_line}
                        </p>
                        <p className="text-sm mt-1">
                          ${Number(policy.premium).toLocaleString()} premium
                        </p>
                      </div>
                      <Badge>{policy.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No policies yet</p>
          )}
        </TabsContent>

        <TabsContent value="activity">
          <p className="text-sm text-muted-foreground">Activity timeline coming soon</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}