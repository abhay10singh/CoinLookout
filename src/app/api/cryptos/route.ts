
import { NextResponse } from 'next/server';
import { getCryptoCurrencies } from '@/services/coin-gecko';
import type { MappedCryptoCurrency } from '@/services/coin-gecko';

export const dynamic = 'force-dynamic'; 


export async function GET() {
  try {
    const data: MappedCryptoCurrency[] = await getCryptoCurrencies();

    
    if (!data || data.length === 0) {

        console.warn('API route /api/cryptos received empty data from getCryptoCurrencies service.');

    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API route /api/cryptos error:', error);
    
    return NextResponse.json({ message: 'Failed to fetch cryptocurrency data.' }, { status: 500 });
  }
}
