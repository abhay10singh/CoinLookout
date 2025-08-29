
export interface CryptoNewsArticle {
  title: string;  // headline text
  url: string;    // link to the full article
  source: string; // where the article came from
  date: string;   // ISO date string (e.g. 2024-01-01T12:00:00.000Z)
}


export async function getCryptoNews(): Promise<CryptoNewsArticle[]> {
  const news: CryptoNewsArticle[] = [
    {
      title: 'Bitcoin price surges to new high',
      url: 'https://example.com/bitcoin-surge',
      source: 'CoinDesk',
      date: '2024-01-01T12:00:00.000Z',
    },
    {
      title: 'Ethereum upgrade complete',
      url: 'https://example.com/ethereum-upgrade',
      source: 'CoinTelegraph',
      date: '2024-01-02T12:00:00.000Z',
    },
  ];

  return news;
}
