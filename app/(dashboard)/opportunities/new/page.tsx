'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

const PRODUCT_LINES = ['GL', 'WC', 'Surety', 'Excess Liability', 'Builders Risk', 'Auto', 'Umbrella']
const STAGES = ['intake', 'quote', 'uw_review', 'bind', 'lost']

export default function NewOpportunityPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: '',
    account_id: '',
    stage: 'intake',
    owner_id: '',
    expected_premium: '',
    probability: '',
    close_date: '',
    notes: '',
  })

  useEffect(() => {
    async function fetchData() {
      const [accountsResult, usersResult, currentUser] = await Promise.all([
        supabase.from('accounts').select('id, name').order('name'),
        supabase.from('profiles').select('id, full_name').order('full_name'),
        supabase.auth.getUser(),
      ])

      if (accountsResult.data) setAccounts(accountsResult.data)
      if (usersResult.data) setUsers(usersResult.data)
      if (currentUser.data.user) {
        setFormData(prev => ({ ...prev, owner_id: currentUser.data.user!.id }))
      }
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('opportunities')
        .insert({
          ...formData,
          product_lines: selectedProducts,
          expected_premium: formData.expected_premium ? parseFloat(formData.expected_premium) : null,
          probability: formData.probability ? parseInt(formData.probability) : null,
          close_date: formData.close_date || null,
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Opportunity created successfully')
      router.push(`/opportunities/${data.id}`)
    } catch (error) {
      console.error('Error creating opportunity:', error)
      toast.error('Failed to create opportunity')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const toggleProduct = (product: string) => {
    setSelectedProducts(prev =>
      prev.includes(product)
        ? prev.filter(p => p !== product)
        : [...prev, product]
    )
  }

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

      <div>
        <h1 className="text-3xl font-bold">New Opportunity</h1>
        <p className="text-muted-foreground">Create a new sales opportunity</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Opportunity Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Opportunity Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., ABC Construction - GL & WC Quote"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="account_id">Account *</Label>
                  <Select
                    value={formData.account_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, account_id: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stage">Stage</Label>
                  <Select
                    value={formData.stage}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, stage: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Product Lines *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {PRODUCT_LINES.map((product) => (
                    <Button
                      key={product}
                      type="button"
                      variant={selectedProducts.includes(product) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleProduct(product)}
                    >
                      {product}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="expected_premium">Expected Premium</Label>
                  <Input
                    id="expected_premium"
                    name="expected_premium"
                    type="number"
                    step="0.01"
                    value={formData.expected_premium}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="probability">Probability (%)</Label>
                  <Input
                    id="probability"
                    name="probability"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={handleChange}
                    placeholder="0-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="close_date">Expected Close Date</Label>
                  <Input
                    id="close_date"
                    name="close_date"
                    type="date"
                    value={formData.close_date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="owner_id">Owner</Label>
                <Select
                  value={formData.owner_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, owner_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || user.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/opportunities">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading || !formData.account_id || selectedProducts.length === 0}>
              {loading ? 'Creating...' : 'Create Opportunity'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}