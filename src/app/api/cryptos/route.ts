
import { NextResponse } from 'next/server';
import { getCryptoCurrencies } from '@/services/coin-gecko';
import type { MappedCryptoCurrency } from '@/services/coin-gecko';

export const dynamic = 'force-dynamic'; // Ensure the route is dynamic to reflect revalidation

/**
 * GET handler for fetching cryptocurrency market data.
 * Uses the CoinGecko service which includes server-side caching.
 */
export async function GET() {
  try {
    const data: MappedCryptoCurrency[] = await getCryptoCurrencies();

    // If data fetching resulted in an empty array due to an upstream error handled in the service
    if (!data || data.length === 0) {
        // Log the issue server-side
        console.warn('API route /api/cryptos received empty data from getCryptoCurrencies service.');
        // Return a specific status code or message if needed, or just empty array
        // return NextResponse.json({ message: "No data available from upstream source." }, { status: 503 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API route /api/cryptos error:', error);
    // Return a generic server error response
    return NextResponse.json({ message: 'Failed to fetch cryptocurrency data.' }, { status: 500 });
  }
}
