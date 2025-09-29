import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Validate required fields
    const {
      account_name,
      account_id,
      opportunity_name,
      opportunity_id,
      carrier_name,
      product_line,
      status,
      quote_number,
      premium,
      effective_date,
      expiration_date,
      coverage_details,
      submission_method,
      outcome,
      decline_reason,
      error_message,
    } = body

    if (!carrier_name || !product_line) {
      return NextResponse.json(
        { error: 'carrier_name and product_line are required' },
        { status: 400 }
      )
    }

    // Find or create account
    let accountId = account_id
    if (!accountId && account_name) {
      const { data: existingAccount } = await supabase
        .from('accounts')
        .select('id')
        .eq('name', account_name)
        .single()

      if (existingAccount) {
        accountId = existingAccount.id
      } else {
        const { data: newAccount, error: accountError } = await supabase
          .from('accounts')
          .insert({ name: account_name })
          .select('id')
          .single()

        if (accountError) throw accountError
        accountId = newAccount.id
      }
    }

    if (!accountId) {
      return NextResponse.json(
        { error: 'account_id or account_name is required' },
        { status: 400 }
      )
    }

    // Find or create opportunity
    let oppId = opportunity_id
    if (!oppId) {
      const { data: existingOpp } = await supabase
        .from('opportunities')
        .select('id')
        .eq('account_id', accountId)
        .eq('name', opportunity_name || `${account_name} - ${product_line}`)
        .single()

      if (existingOpp) {
        oppId = existingOpp.id
      } else {
        const { data: newOpp, error: oppError } = await supabase
          .from('opportunities')
          .insert({
            account_id: accountId,
            name: opportunity_name || `${account_name} - ${product_line}`,
            stage: 'quote',
            product_lines: [product_line],
          })
          .select('id')
          .single()

        if (oppError) throw oppError
        oppId = newOpp.id
      }
    }

    // Check if quote already exists (idempotency)
    if (quote_number) {
      const { data: existingQuote } = await supabase
        .from('quotes')
        .select('id')
        .eq('quote_number', quote_number)
        .single()

      if (existingQuote) {
        // Update existing quote
        const { data: updatedQuote, error: updateError } = await supabase
          .from('quotes')
          .update({
            status: status || 'draft',
            premium,
            effective_date,
            expiration_date,
            coverage_details,
            outcome,
            decline_reason,
            error_message,
            quoted_at: outcome === 'quoted' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingQuote.id)
          .select()
          .single()

        if (updateError) throw updateError

        return NextResponse.json({
          success: true,
          quote: updatedQuote,
          action: 'updated',
        })
      }
    }

    // Create new quote
    const { data: newQuote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        opportunity_id: oppId,
        carrier_name,
        product_line,
        status: status || 'draft',
        quote_number,
        premium,
        effective_date,
        expiration_date,
        coverage_details,
        submission_method,
        submitted_at: submission_method ? new Date().toISOString() : null,
        quoted_at: outcome === 'quoted' ? new Date().toISOString() : null,
        outcome,
        decline_reason,
        error_message,
      })
      .select()
      .single()

    if (quoteError) throw quoteError

    // Update opportunity stage if needed
    if (outcome === 'quoted') {
      await supabase
        .from('opportunities')
        .update({ stage: 'uw_review' })
        .eq('id', oppId)
    }

    return NextResponse.json({
      success: true,
      quote: newQuote,
      action: 'created',
    })
  } catch (error: any) {
    console.error('Error ingesting quote:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// GET endpoint to check API health
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/quotes/ingest',
    methods: ['POST'],
  })
}