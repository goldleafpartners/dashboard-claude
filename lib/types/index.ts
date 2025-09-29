// Common types used across the application

export interface QuoteRequest {
  account_id: string
  opportunity_id: string
  product_line: string
  effective_date: string
  expiration_date: string
  coverage_requirements: Record<string, unknown>
  applicant_data: Record<string, unknown>
}

export interface QuoteResponse {
  quote_id: string
  carrier_name: string
  product_line: string
  status: 'quoted' | 'declined' | 'error' | 'no_offer'
  quote_number?: string
  premium?: number
  effective_date?: string
  expiration_date?: string
  coverage_details?: Record<string, unknown>
  decline_reason?: string
  error_message?: string
  quote_document_url?: string
}

export interface CarrierAdapter {
  name: string
  supportsAPI: boolean
  submitQuote(request: QuoteRequest): Promise<QuoteResponse>
  checkQuoteStatus(quote_id: string): Promise<QuoteResponse>
  retrieveQuoteDocument(quote_id: string): Promise<string | null>
}

export interface BrowserbaseSession {
  session_id: string
  carrier_name: string
  quote_id: string
  status: 'running' | 'success' | 'error'
  started_at: string
  completed_at?: string
  screenshot_urls?: string[]
  logs?: string
  error_message?: string
}