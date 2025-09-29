import { createClient } from '@/lib/supabase/server'
import { BrowserbaseSession } from '@/lib/types'

/**
 * Browserbase Service
 *
 * Handles automation of carrier portal interactions via Browserbase.
 * Used for carriers that don't have API integrations.
 */

interface BrowserbaseRunOptions {
  carrier_name: string
  quote_id: string
  portal_url: string
  credentials?: {
    username: string
    password: string
  }
  form_data: Record<string, any>
}

/**
 * Start a Browserbase automation session
 */
export async function startBrowserbaseSession(
  options: BrowserbaseRunOptions
): Promise<BrowserbaseSession> {
  const { carrier_name, quote_id, portal_url, credentials, form_data } = options

  try {
    // TODO: Implement actual Browserbase API call
    // This is a placeholder implementation
    console.log('Starting Browserbase session:', {
      carrier_name,
      quote_id,
      portal_url,
    })

    const supabase = await createClient()

    // Create browserbase_run record
    const { data: run, error } = await supabase
      .from('browserbase_runs')
      .insert({
        carrier_name,
        quote_id,
        status: 'running',
        input_data: {
          portal_url,
          has_credentials: !!credentials,
          form_fields: Object.keys(form_data),
        },
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // TODO: Make actual Browserbase API call
    // const browserbaseResponse = await fetch('https://api.browserbase.com/v1/sessions', {
    //   method: 'POST',
    //   headers: {
    //     'X-API-Key': process.env.BROWSERBASE_API_KEY!,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     projectId: process.env.BROWSERBASE_PROJECT_ID,
    //     url: portal_url,
    //     // Add automation script/configuration
    //   }),
    // })

    // Simulate session ID for now
    const session_id = `bb_${Date.now()}`

    // Update run with session ID
    await supabase
      .from('browserbase_runs')
      .update({
        browserbase_session_id: session_id,
      })
      .eq('id', run.id)

    return {
      session_id,
      carrier_name,
      quote_id,
      status: 'running',
      started_at: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error starting Browserbase session:', error)
    throw error
  }
}

/**
 * Check the status of a Browserbase session
 */
export async function checkBrowserbaseStatus(
  session_id: string
): Promise<BrowserbaseSession> {
  try {
    // TODO: Implement actual Browserbase API call to check status
    console.log('Checking Browserbase session status:', session_id)

    const supabase = await createClient()

    // Get run from database
    const { data: run } = await supabase
      .from('browserbase_runs')
      .select('*')
      .eq('browserbase_session_id', session_id)
      .single()

    if (!run) {
      throw new Error('Browserbase run not found')
    }

    // TODO: Check actual Browserbase API for status
    // const response = await fetch(`https://api.browserbase.com/v1/sessions/${session_id}`, {
    //   headers: {
    //     'X-API-Key': process.env.BROWSERBASE_API_KEY!,
    //   },
    // })

    return {
      session_id,
      carrier_name: run.carrier_name,
      quote_id: run.quote_id,
      status: run.status,
      started_at: run.started_at,
      completed_at: run.completed_at,
      screenshot_urls: run.screenshot_urls,
      logs: run.logs,
      error_message: run.error_message,
    }
  } catch (error) {
    console.error('Error checking Browserbase status:', error)
    throw error
  }
}

/**
 * Retry a failed Browserbase session
 */
export async function retryBrowserbaseSession(
  run_id: string
): Promise<BrowserbaseSession> {
  const supabase = await createClient()

  // Get original run
  const { data: originalRun } = await supabase
    .from('browserbase_runs')
    .select('*')
    .eq('id', run_id)
    .single()

  if (!originalRun) {
    throw new Error('Original run not found')
  }

  // Increment retry count
  const newRetryCount = (originalRun.retry_count || 0) + 1

  // Start new session with same parameters
  const newSession = await startBrowserbaseSession({
    carrier_name: originalRun.carrier_name,
    quote_id: originalRun.quote_id,
    portal_url: originalRun.input_data?.portal_url,
    form_data: originalRun.input_data?.form_data || {},
  })

  // Update retry count
  await supabase
    .from('browserbase_runs')
    .update({ retry_count: newRetryCount })
    .eq('browserbase_session_id', newSession.session_id)

  return newSession
}

/**
 * Complete a Browserbase session (called by webhook or polling)
 */
export async function completeBrowserbaseSession(
  session_id: string,
  result: {
    status: 'success' | 'error'
    output_data?: Record<string, any>
    screenshot_urls?: string[]
    logs?: string
    error_message?: string
  }
): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('browserbase_runs')
    .update({
      status: result.status,
      output_data: result.output_data,
      screenshot_urls: result.screenshot_urls,
      logs: result.logs,
      error_message: result.error_message,
      completed_at: new Date().toISOString(),
    })
    .eq('browserbase_session_id', session_id)
}

/**
 * Get all Browserbase runs for a quote
 */
export async function getBrowserbaseRunsForQuote(quote_id: string) {
  const supabase = await createClient()

  const { data: runs } = await supabase
    .from('browserbase_runs')
    .select('*')
    .eq('quote_id', quote_id)
    .order('started_at', { ascending: false })

  return runs || []
}