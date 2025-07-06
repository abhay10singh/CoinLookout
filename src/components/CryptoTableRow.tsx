import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Star, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SparklineChart } from '@/components/sparkline-chart';
import type { MappedCryptoCurrency } from '@/services/coin-gecko';

interface CryptoTableRowProps {
  crypto: MappedCryptoCurrency;
  isFavorite: boolean;
  toggleFavorite: (id: string) => void;
  formatCurrency: (value: number | null | undefined) => string;
  formatLargeNumber: (value: number | null | undefined) => string;
  formatPercentage: (value: number | null | undefined) => string;
}

export function CryptoTableRow({
  crypto,
  isFavorite,
  toggleFavorite,
  formatCurrency,
  formatLargeNumber,
  formatPercentage,
}: CryptoTableRowProps) {
  const priceChange = crypto.priceChange24h;
  const isPositiveChange = (priceChange ?? 0) >= 0;
  const changeColor = isPositiveChange ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

  return (
    <tr data-state={isFavorite ? 'selected' : undefined} className="hover:bg-muted/50 transition-colors duration-150 h-[60px]">
      <td className="text-center px-2 sticky left-0 bg-card z-10 group-data-[state=selected]:bg-muted">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleFavorite(crypto.id)}
          className={cn("h-8 w-8 rounded-full", isFavorite ? 'text-yellow-400 hover:text-yellow-500' : 'text-muted-foreground hover:text-foreground')}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star className={cn("h-5 w-5 transition-transform duration-200", isFavorite && 'fill-current scale-110')} />
        </Button>
      </td>
      <td className="sticky left-[50px] bg-card z-10 pl-4 pr-2 group-data-[state=selected]:bg-muted">
        <div className="flex items-center gap-3">
          <Image
            src={crypto.image}
            alt={`${crypto.name} logo`}
            width={24}
            height={24}
            className="rounded-full"
            unoptimized
          />
          <div>
            <div className="font-medium">{crypto.name}</div>
            <div className="text-xs text-muted-foreground uppercase">{crypto.symbol}</div>
          </div>
        </div>
      </td>
      <td className="text-right font-mono px-2">{formatCurrency(crypto.currentPrice)}</td>
      <td className={cn("text-right font-mono px-2", changeColor)}>
        {priceChange !== null && priceChange !== undefined ? (
          <>
            {isPositiveChange ? <ArrowUp className="inline h-3 w-3 mr-1" /> : <ArrowDown className="inline h-3 w-3 mr-1" />}
            {formatPercentage(priceChange)}
          </>
        ) : (
          'N/A'
        )}
      </td>
      <td className="text-right font-mono px-2">{formatLargeNumber(crypto.marketCap)}</td>
      <td className="text-right font-mono px-2">{formatLargeNumber(crypto.volume24h)}</td>
      <td className="text-right font-mono px-2">
        {crypto.circulatingSupply ? crypto.circulatingSupply.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 'N/A'}
        {crypto.circulatingSupply ? <span className="ml-1 text-muted-foreground text-xs">{crypto.symbol.toUpperCase()}</span> : ''}
      </td>
      <td className="text-center px-2">
        <SparklineChart data={crypto.sparkline} className="w-full h-10" />
      </td>
    </tr>
  );
}
