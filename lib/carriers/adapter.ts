import { CarrierAdapter, QuoteRequest, QuoteResponse } from '@/lib/types'

/**
 * Base Carrier Adapter Interface
 *
 * All carrier integrations should implement this interface.
 * Carriers can be integrated via:
 * 1. Direct API calls (supportsAPI = true)
 * 2. Browserbase automation (supportsAPI = false)
 */

export abstract class BaseCarrierAdapter implements CarrierAdapter {
  abstract name: string
  abstract supportsAPI: boolean

  /**
   * Submit a quote request to the carrier
   * @param request - The quote request data
   * @returns Promise<QuoteResponse> - The quote response from the carrier
   */
  abstract submitQuote(request: QuoteRequest): Promise<QuoteResponse>

  /**
   * Check the status of a previously submitted quote
   * @param quote_id - The ID of the quote to check
   * @returns Promise<QuoteResponse> - Updated quote information
   */
  abstract checkQuoteStatus(quote_id: string): Promise<QuoteResponse>

  /**
   * Retrieve the quote document (PDF) URL
   * @param quote_id - The ID of the quote
   * @returns Promise<string | null> - URL to the quote document or null if not available
   */
  abstract retrieveQuoteDocument(quote_id: string): Promise<string | null>
}

/**
 * Factory function to get the appropriate carrier adapter
 * @param carrierName - The name of the carrier
 * @returns CarrierAdapter instance
 */
export function getCarrierAdapter(carrierName: string): CarrierAdapter {
  switch (carrierName.toLowerCase()) {
    case 'btis':
      // Dynamic import to avoid loading all adapters
      const { BTISAdapter } = require('./btis')
      return new BTISAdapter()

    case 'coterie':
      const { CoterieAdapter } = require('./coterie')
      return new CoterieAdapter()

    default:
      throw new Error(`No adapter found for carrier: ${carrierName}`)
  }
}

/**
 * Get all supported carriers
 */
export function getSupportedCarriers(): string[] {
  return ['btis', 'coterie']
}