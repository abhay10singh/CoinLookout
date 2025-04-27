
import { unstable_cache as cache } from 'next/cache';

/**
 * Represents a cryptocurrency raw data structure from CoinGecko API.
 */
export interface CryptoCurrency {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null; // Price can sometimes be null
  market_cap: number | null; // Market cap can sometimes be null
  market_cap_rank: number | null;
  fully_diluted_valuation: number | null;
  total_volume: number | null; // Volume can sometimes be null
  high_24h: number | null;
  low_24h: number | null;
  price_change_24h: number | null;
  price_change_percentage_24h: number | null; // Percentage change can be null
  market_cap_change_24h: number | null;
  market_cap_change_percentage_24h: number | null;
  circulating_supply: number | null; // Circulating supply can be null
  total_supply: number | null;
  max_supply: number | null;
  ath: number | null;
  ath_change_percentage: number | null;
  ath_date: string | null;
  atl: number | null;
  atl_change_percentage: number | null;
  atl_date: string | null;
  roi: null | { times: number; currency: string; percentage: number };
  last_updated: string | null;
  sparkline_in_7d?: { // Optional sparkline data
    price?: number[] | null; // Price array within sparkline can be null
  } | null; // sparkline_in_7d itself can be null
}

/**
 * Represents the mapped and cleaned cryptocurrency data used in the application.
 * Fields are guaranteed to be non-null where sensible defaults can be applied.
 */
export interface MappedCryptoCurrency {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number; // Defaults to 0 if null
  priceChange24h: number; // Defaults to 0 if null
  marketCap: number; // Defaults to 0 if null
  volume24h: number; // Defaults to 0 if null
  circulatingSupply: number; // Defaults to 0 if null
  sparkline: number[]; // Defaults to empty array if null/undefined
}


const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/coins/markets';
const VS_CURRENCY = 'usd';
const ORDER = 'market_cap_desc';
const PER_PAGE = 100; // Fetch top 100 coins
const PAGE = 1;
const SPARKLINE = true; // Enable sparkline data

const fetchCryptoData = cache(
    async (): Promise<MappedCryptoCurrency[]> => {
        console.log(`[${new Date().toISOString()}] Fetching fresh data from CoinGecko API...`);
        const params = new URLSearchParams({
            vs_currency: VS_CURRENCY,
            order: ORDER,
            per_page: PER_PAGE.toString(),
            page: PAGE.toString(),
            sparkline: SPARKLINE.toString(),
            price_change_percentage: '24h', // Request 24h percentage change
        });

        const url = `${COINGECKO_API_URL}?${params.toString()}`;
        let response: Response | null = null; // Initialize response to null

        try {
            response = await fetch(url, {
                // Use Next.js fetch caching (revalidate every 60 seconds)
                 next: { revalidate: 60 }
            });

            if (!response.ok) {
                // Log detailed error response if possible
                let errorBody = '';
                 try {
                     errorBody = await response.text();
                 } catch (textError) {
                     // Ignore if reading text fails
                 }
                console.error(`[${new Date().toISOString()}] CoinGecko API Error ${response.status}: ${response.statusText}. URL: ${url}. Body: ${errorBody}`);
                // Instead of throwing, return empty array to signal failure gracefully
                 return [];
                // throw new Error(`Failed to fetch data from CoinGecko API: ${response.status} ${response.statusText}`);
            }

            const data: CryptoCurrency[] = await response.json();

            // Map the raw API data to our simplified MappedCryptoCurrency structure
            // Provide default values for potentially null fields
            return data
                .filter(coin => coin.id && coin.symbol && coin.name) // Basic filtering for essential data
                .map((coin) => ({
                    id: coin.id,
                    symbol: coin.symbol,
                    name: coin.name,
                    image: coin.image || '', // Default image if null
                    currentPrice: coin.current_price ?? 0,
                    priceChange24h: coin.price_change_percentage_24h ?? 0,
                    marketCap: coin.market_cap ?? 0,
                    volume24h: coin.total_volume ?? 0,
                    circulatingSupply: coin.circulating_supply ?? 0,
                    sparkline: coin.sparkline_in_7d?.price?.filter(p => typeof p === 'number') ?? [], // Ensure sparkline is an array of numbers
            }));

        } catch (error) {
             // Catch network errors or JSON parsing errors
             console.error(`[${new Date().toISOString()}] Error fetching or processing crypto data from ${url}:`, error);
             // Optionally check the response status if available
             if (response) {
                 console.error(`[${new Date().toISOString()}] Response status was: ${response.status} ${response.statusText}`);
             }
             // Return an empty array on any fetch/processing error
             return [];
        }
    },
    ['crypto-data'], // Cache key parts
    {
        revalidate: 60, // Revalidate cache every 60 seconds
         tags: ['coingecko'], // Tag for on-demand revalidation if needed
    }
);


/**
 * Asynchronously retrieves cryptocurrency data, utilizing caching.
 * Returns an empty array if fetching or processing fails.
 * @returns A promise that resolves to an array of MappedCryptoCurrency objects.
 */
export async function getCryptoCurrencies(): Promise<MappedCryptoCurrency[]> {
    // fetchCryptoData handles its own errors and returns [] on failure
    return fetchCryptoData();
}
