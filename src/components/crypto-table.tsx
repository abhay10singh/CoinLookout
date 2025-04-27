'use client';

import * as React from 'react';
import Image from 'next/image'; // Import next/image
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  ArrowDown,
  ArrowUp,
  Search,
  Star,
} from 'lucide-react';
import type { MappedCryptoCurrency } from '@/services/coin-gecko'; // Use mapped type
import { getCryptoCurrencies } from '@/services/coin-gecko';
import { Skeleton } from '@/components/ui/skeleton';
import { FAVORITES_LOCAL_STORAGE_KEY, REFRESH_INTERVAL_MS } from '@/lib/constants';
import useLocalStorage from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';
import { SparklineChart } from '@/components/sparkline-chart'; // Import SparklineChart

// Define the type for sorting configuration
type SortConfig = {
  key: keyof MappedCryptoCurrency | null;
  direction: 'ascending' | 'descending';
};

export function CryptoTable() {
  const [cryptos, setCryptos] = React.useState<MappedCryptoCurrency[]>([]);
  const [filteredCryptos, setFilteredCryptos] = React.useState<MappedCryptoCurrency[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [favorites, setFavorites] = useLocalStorage<string[]>(FAVORITES_LOCAL_STORAGE_KEY, []);
  const [sortConfig, setSortConfig] = React.useState<SortConfig>({ key: 'marketCap', direction: 'descending' });
  const [error, setError] = React.useState<string | null>(null);


  const fetchData = React.useCallback(async () => {
    // Keep showing loading state for subsequent fetches unless it's the first load
    if (cryptos.length === 0) setIsLoading(true);
    try {
      setError(null); // Clear previous errors
      const data = await getCryptoCurrencies();
       if (data && data.length > 0) {
          setCryptos(data);
       } else if (cryptos.length === 0) { // Only show error if it's the initial load failure
           setError("No cryptocurrency data available at the moment.");
       }
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching crypto data:", err);
      // Show error message only if it's the initial load or if the fetch explicitly fails
      if (cryptos.length === 0) {
           setError("Failed to load cryptocurrency data. Please try refreshing.");
      }
      setIsLoading(false); // Ensure loading state is turned off even on error
    }
  }, [cryptos.length]); // Depend on cryptos.length to manage initial loading state

  // Initial data fetch and interval refresh
  React.useEffect(() => {
    fetchData(); // Initial fetch
    const intervalId = setInterval(fetchData, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [fetchData]); // fetchData is memoized, so this runs once on mount and sets up interval

  // Sorting logic
  const sortedCryptos = React.useMemo(() => {
    let sortableItems = [...cryptos];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        // Handle potential null/undefined values if necessary, though Mapped type tries to avoid this
        const aValue = a[sortConfig.key!] ?? (typeof a[sortConfig.key!] === 'number' ? 0 : '');
        const bValue = b[sortConfig.key!] ?? (typeof b[sortConfig.key!] === 'number' ? 0 : '');

        if (typeof aValue === 'number' && typeof bValue === 'number') {
           if (aValue < bValue) {
             return sortConfig.direction === 'ascending' ? -1 : 1;
           }
           if (aValue > bValue) {
             return sortConfig.direction === 'ascending' ? 1 : -1;
           }
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
            const comparison = aValue.localeCompare(bValue);
             return sortConfig.direction === 'ascending' ? comparison : -comparison;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [cryptos, sortConfig]);


  // Filtering logic based on search term
  React.useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = sortedCryptos.filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        crypto.symbol.toLowerCase().includes(lowerCaseSearchTerm)
    );
    setFilteredCryptos(filtered);
  }, [searchTerm, sortedCryptos]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prevFavorites) =>
      prevFavorites.includes(id)
        ? prevFavorites.filter((favId) => favId !== id)
        : [...prevFavorites, id]
    );
  };

  const requestSort = (key: keyof MappedCryptoCurrency) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
   };

   // Formatting functions
   const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return 'N/A';
     // Use compact notation for very small prices if needed
     if (value < 0.01 && value > 0) {
       return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumSignificantDigits: 2, maximumSignificantDigits: 4 }).format(value);
     }
     return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
   };

   const formatLargeNumber = (value: number | null | undefined): string => {
     if (value === null || value === undefined) return 'N/A';
     if (value >= 1e12) {
       return `$${(value / 1e12).toFixed(2)}T`;
     } else if (value >= 1e9) {
       return `$${(value / 1e9).toFixed(2)}B`;
     } else if (value >= 1e6) {
       return `$${(value / 1e6).toFixed(2)}M`;
     } else {
       return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
     }
   };

   const formatPercentage = (value: number | null | undefined): string => {
     if (value === null || value === undefined) return 'N/A';
     return `${value.toFixed(2)}%`;
   };


  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search coins by name or symbol..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 h-10 rounded-md border bg-card shadow-sm focus:ring-accent focus:border-accent transition-shadow duration-200 focus:shadow-md neumorphism-light dark:neumorphism-dark" // Applied neumorphism subtly
            aria-label="Search cryptocurrencies"
          />
        </div>
        {/* Potential Filters/Sorting Dropdowns here */}
      </div>
      <div className="rounded-lg border overflow-hidden shadow-sm bg-card neumorphism-light dark:neumorphism-dark">
       {error && <div className="p-4 text-destructive bg-destructive/10 rounded-md m-4 text-center">{error}</div>}
        <Table>
          <TableHeader>
            <TableRow className="border-b-0">
              <TableHead className="w-[50px] text-center px-2"></TableHead> {/* Favorite Star */}
              <TableHead className="sticky left-0 bg-card z-10 w-[180px] cursor-pointer pl-4 pr-2 py-3 group" onClick={() => requestSort('name')}>
                Name
                <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {sortConfig.key === 'name' ? (sortConfig.direction === 'ascending' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />) : <ArrowDown className="inline h-4 w-4 text-muted-foreground/50" />}
                </span>
              </TableHead>
              <TableHead className="w-[120px] text-right cursor-pointer px-2 py-3 group" onClick={() => requestSort('currentPrice')}>
                Price
                 <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {sortConfig.key === 'currentPrice' ? (sortConfig.direction === 'ascending' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />) : <ArrowDown className="inline h-4 w-4 text-muted-foreground/50" />}
                 </span>
              </TableHead>
              <TableHead className="w-[100px] text-right cursor-pointer px-2 py-3 group" onClick={() => requestSort('priceChange24h')}>
                24h %
                <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {sortConfig.key === 'priceChange24h' ? (sortConfig.direction === 'ascending' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />) : <ArrowDown className="inline h-4 w-4 text-muted-foreground/50" />}
                </span>
              </TableHead>
              <TableHead className="w-[160px] text-right cursor-pointer px-2 py-3 group" onClick={() => requestSort('marketCap')}>
                Market Cap
                <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     {sortConfig.key === 'marketCap' ? (sortConfig.direction === 'ascending' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />) : <ArrowDown className="inline h-4 w-4 text-muted-foreground/50" />}
                </span>
                </TableHead>
              <TableHead className="w-[160px] text-right cursor-pointer px-2 py-3 group" onClick={() => requestSort('volume24h')}>
                Volume (24h)
                 <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {sortConfig.key === 'volume24h' ? (sortConfig.direction === 'ascending' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />) : <ArrowDown className="inline h-4 w-4 text-muted-foreground/50" />}
                 </span>
                </TableHead>
              <TableHead className="w-[180px] text-right cursor-pointer px-2 py-3 group" onClick={() => requestSort('circulatingSupply')}>
                Circulating Supply
                <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {sortConfig.key === 'circulatingSupply' ? (sortConfig.direction === 'ascending' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />) : <ArrowDown className="inline h-4 w-4 text-muted-foreground/50" />}
                </span>
              </TableHead>
               <TableHead className="w-[120px] text-center px-2 py-3">7d Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && filteredCryptos.length === 0 ? ( // Show skeleton only on initial load
              Array.from({ length: 15 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`} className="h-[60px]">
                  <TableCell className="px-2"><Skeleton className="h-5 w-5 rounded-full mx-auto" /></TableCell>
                  <TableCell className="sticky left-0 bg-card z-10 pl-4 pr-2">
                     <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-full" />
                         <div className="flex-1 space-y-1.5">
                             <Skeleton className="h-4 w-3/4" />
                             <Skeleton className="h-3 w-1/2" />
                         </div>
                     </div>
                   </TableCell>
                  <TableCell className="text-right px-2"><Skeleton className="h-4 w-1/2 ml-auto" /></TableCell>
                  <TableCell className="text-right px-2"><Skeleton className="h-4 w-1/3 ml-auto" /></TableCell>
                  <TableCell className="text-right px-2"><Skeleton className="h-4 w-3/4 ml-auto" /></TableCell>
                  <TableCell className="text-right px-2"><Skeleton className="h-4 w-3/4 ml-auto" /></TableCell>
                  <TableCell className="text-right px-2"><Skeleton className="h-4 w-3/4 ml-auto" /></TableCell>
                   <TableCell className="text-center px-2"><Skeleton className="h-8 w-full" /></TableCell>
                </TableRow>
              ))
            ) : filteredCryptos.length > 0 ? (
              filteredCryptos.map((crypto) => {
                 const isFavorite = favorites.includes(crypto.id);
                 const priceChange = crypto.priceChange24h;
                 const isPositiveChange = priceChange >= 0;
                 const changeColor = isPositiveChange ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

                 return (
                <TableRow key={crypto.id} data-state={isFavorite ? 'selected' : undefined} className="hover:bg-muted/50 transition-colors duration-150 h-[60px]">
                  <TableCell className="text-center px-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(crypto.id)}
                      className={cn("h-8 w-8 rounded-full", isFavorite ? 'text-yellow-400 hover:text-yellow-500' : 'text-muted-foreground hover:text-foreground')}
                      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star className={cn("h-5 w-5 transition-transform duration-200", isFavorite && 'fill-current scale-110')} />
                    </Button>
                  </TableCell>
                   <TableCell className="sticky left-0 bg-card z-10 pl-4 pr-2">
                     <div className="flex items-center gap-3">
                        <Image
                            src={crypto.image}
                            alt={`${crypto.name} logo`}
                            width={24}
                            height={24}
                            className="rounded-full"
                            unoptimized // Use if images are SVGs or small PNGs that don't need optimization
                        />
                        <div>
                            <div className="font-medium">{crypto.name}</div>
                            <div className="text-xs text-muted-foreground uppercase">{crypto.symbol}</div>
                         </div>
                     </div>
                   </TableCell>
                  <TableCell className="text-right font-mono px-2">{formatCurrency(crypto.currentPrice)}</TableCell>
                   <TableCell className={cn("text-right font-mono px-2", changeColor)}>
                     {isPositiveChange ? <ArrowUp className="inline h-3 w-3 mr-1" /> : <ArrowDown className="inline h-3 w-3 mr-1" />}
                     {formatPercentage(priceChange)}
                   </TableCell>
                  <TableCell className="text-right font-mono px-2">{formatLargeNumber(crypto.marketCap)}</TableCell>
                  <TableCell className="text-right font-mono px-2">{formatLargeNumber(crypto.volume24h)}</TableCell>
                  <TableCell className="text-right font-mono px-2">
                    {crypto.circulatingSupply.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    <span className="ml-1 text-muted-foreground text-xs">{crypto.symbol.toUpperCase()}</span>
                  </TableCell>
                   <TableCell className="text-center px-2">
                     <SparklineChart data={crypto.sparkline} className="w-full h-10" />
                   </TableCell>
                </TableRow>
              )})
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  {isLoading ? 'Loading...' : 'No results found.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
       {/* Add Pagination or Infinite Scroll later if needed */}
    </div>
  );
}

