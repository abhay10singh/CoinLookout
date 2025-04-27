import { unstable_cache as cache } from 'next/cache';

/**
 * Represents a cryptocurrency.
 */
export interface CryptoCurrency {
  id: string;
  symbol: string;
  name: string;
  image: string; // Added image URL
  current_price: number; // Renamed for API consistency
  market_cap: number; // Renamed for API consistency
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number; // Renamed for API consistency
  high_24h: number;
  low_24h: number;
  price_change_24h: number; // This is the absolute price change
  price_change_percentage_24h: number; // This is the percentage change
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number; // Renamed for API consistency
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: null | { times: number; currency: string; percentage: number };
  last_updated: string;
  sparkline_in_7d: { // Renamed for API consistency
    price: number[];
  };
}

// Use CoinGecko field names directly where possible for simplicity
// Map fields in the component if needed for different naming conventions
export interface MappedCryptoCurrency {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  priceChange24h: number; // This will be the percentage change
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  sparkline: number[];
}


const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/coins/markets';
const VS_CURRENCY = 'usd';
const ORDER = 'market_cap_desc';
const PER_PAGE = 100; // Fetch top 100 coins
const PAGE = 1;
const SPARKLINE = true; // Enable sparkline data

const fetchCryptoData = cache(
    async (): Promise<MappedCryptoCurrency[]> => {
        console.log('Fetching fresh data from CoinGecko API...');
        const params = new URLSearchParams({
            vs_currency: VS_CURRENCY,
            order: ORDER,
            per_page: PER_PAGE.toString(),
            page: PAGE.toString(),
            sparkline: SPARKLINE.toString(),
            price_change_percentage: '24h', // Request 24h percentage change
        });

        const url = `${COINGECKO_API_URL}?${params.toString()}`;

        try {
            const response = await fetch(url, {
                // Use Next.js fetch caching (revalidate every 60 seconds)
                 next: { revalidate: 60 }
            });

            if (!response.ok) {
                // Log detailed error response
                const errorBody = await response.text();
                console.error(`API Error ${response.status}: ${response.statusText}. Body: ${errorBody}`);
                throw new Error(`Failed to fetch data from CoinGecko API: ${response.statusText}`);
            }

            const data: CryptoCurrency[] = await response.json();

            // Map the raw API data to our simplified MappedCryptoCurrency structure
            return data.map((coin) => ({
                id: coin.id,
                symbol: coin.symbol,
                name: coin.name,
                image: coin.image,
                currentPrice: coin.current_price,
                priceChange24h: coin.price_change_percentage_24h || 0, // Use percentage change, default to 0 if null
                marketCap: coin.market_cap,
                volume24h: coin.total_volume,
                circulatingSupply: coin.circulating_supply,
                sparkline: coin.sparkline_in_7d?.price || [], // Ensure sparkline exists
            }));

        } catch (error) {
            console.error('Error fetching or processing crypto data:', error);
            // Re-throw the error or return an empty array / cached data
            // For now, let's return an empty array to avoid crashing the app
            // In a real app, better error handling (e.g., showing a message) is needed
             // throw error; // Re-throw if you want the component to handle it
             return []; // Return empty array on error
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
 * @returns A promise that resolves to an array of MappedCryptoCurrency objects.
 */
export async function getCryptoCurrencies(): Promise<MappedCryptoCurrency[]> {
    return fetchCryptoData();
}
