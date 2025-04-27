
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
import type { MappedCryptoCurrency } from '@/services/coin-gecko'; // Keep type import
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
    // But ensure loading indicator is active if cryptos array is empty
    if (cryptos.length === 0 && !isLoading) setIsLoading(true);

    try {
      setError(null); // Clear previous errors

      // Fetch data from the internal API route
      const response = await fetch('/api/cryptos');

      if (!response.ok) {
        // Try to get error message from response body
        let errorMsg = `Error: ${response.status} ${response.statusText}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
        } catch (jsonError) {
            // Ignore if response is not JSON
        }
        throw new Error(errorMsg);
      }

      const data: MappedCryptoCurrency[] = await response.json();

      if (data && data.length > 0) {
          setCryptos(data);
      } else {
          // Data is empty or null, might be an issue upstream handled by API route
          // Only show error if it's the initial load failure and no data exists yet
          if (cryptos.length === 0) {
              setError("No cryptocurrency data available at the moment.");
          }
          // Keep existing data if this was a refresh that returned empty
          setCryptos(prevCryptos => data && data.length > 0 ? data : prevCryptos);
      }

    } catch (err) {
      console.error("Error fetching crypto data:", err);
      // Show error message only if it's the initial load or if the fetch explicitly fails
      // and we don't have any existing data to show.
      if (cryptos.length === 0) {
          setError(err instanceof Error ? err.message : "Failed to load cryptocurrency data. Please try refreshing.");
      }
      // Optionally: Display a non-blocking error using a toast notification for refresh failures
    } finally {
        // Always ensure loading state is turned off after fetch attempt
        setIsLoading(false);
    }
  }, [cryptos.length, isLoading]); // Added isLoading to dependencies

  // Initial data fetch and interval refresh
  React.useEffect(() => {
    fetchData(); // Initial fetch
    const intervalId = setInterval(fetchData, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [fetchData]); // fetchData is memoized, so this runs once on mount and sets up interval

  // Sorting logic - applied to the main 'cryptos' state
  const sortedCryptos = React.useMemo(() => {
    let sortableItems = [...cryptos];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        // Ensure values exist, default numeric to 0 and string to ''
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
    // Favorite items should float to the top, regardless of sorting, but maintain internal sort order
    return sortableItems.sort((a, b) => {
        const aIsFavorite = favorites.includes(a.id);
        const bIsFavorite = favorites.includes(b.id);
        if (aIsFavorite && !bIsFavorite) return -1;
        if (!aIsFavorite && bIsFavorite) return 1;
        return 0; // Keep original sort order among favorites/non-favorites
    });
  }, [cryptos, sortConfig, favorites]);


  // Filtering logic based on search term - applied to the sorted list
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
    // Note: Sorting logic will automatically re-apply due to 'favorites' dependency in useMemo
  };

  const requestSort = (key: keyof MappedCryptoCurrency) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    // If same key, toggle direction, otherwise default to descending for market cap/volume, ascending for others
    if (sortConfig.key === key) {
        direction = sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
    } else {
        // Default sort directions for specific columns
        direction = ['marketCap', 'volume24h'].includes(key) ? 'descending' : 'ascending';
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
       {/* Display error prominently only if loading failed AND there's no data */}
       {error && cryptos.length === 0 && !isLoading && (
          <div className="p-4 text-destructive bg-destructive/10 rounded-md m-4 text-center">{error}</div>
        )}

        <Table>
          <TableHeader>
            <TableRow className="border-b-0 bg-muted/30"> {/* Slightly different header background */}
              <TableHead className="w-[50px] text-center px-2 sticky left-0 z-20 bg-muted/30"></TableHead> {/* Favorite Star - Sticky */}
              <TableHead className="sticky left-[50px] bg-muted/30 z-20 w-[180px] cursor-pointer pl-4 pr-2 py-3 group" onClick={() => requestSort('name')}>
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
            {/* Show skeleton only on initial load OR if loading is true and there's no data yet */}
            {isLoading && cryptos.length === 0 ? (
              Array.from({ length: 15 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`} className="h-[60px]">
                  <TableCell className="px-2 sticky left-0 bg-card z-10"> {/* Sticky Skeleton Cell */}
                        <Skeleton className="h-5 w-5 rounded-full mx-auto" />
                   </TableCell>
                  <TableCell className="sticky left-[50px] bg-card z-10 pl-4 pr-2"> {/* Sticky Skeleton Cell */}
                     <div className="flex items-center gap-3"> {/* Adjusted gap */}
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
                 // Ensure priceChange is treated as a number, default to 0 if null/undefined
                 const isPositiveChange = (priceChange ?? 0) >= 0;
                 const changeColor = isPositiveChange ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

                 return (
                <TableRow key={crypto.id} data-state={isFavorite ? 'selected' : undefined} className="hover:bg-muted/50 transition-colors duration-150 h-[60px]">
                   <TableCell className="text-center px-2 sticky left-0 bg-card z-10 group-data-[state=selected]:bg-muted"> {/* Sticky Favorite Cell */}
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
                   <TableCell className="sticky left-[50px] bg-card z-10 pl-4 pr-2 group-data-[state=selected]:bg-muted"> {/* Sticky Name Cell */}
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
                     {priceChange !== null && priceChange !== undefined ? (
                         <>
                            {isPositiveChange ? <ArrowUp className="inline h-3 w-3 mr-1" /> : <ArrowDown className="inline h-3 w-3 mr-1" />}
                             {formatPercentage(priceChange)}
                         </>
                     ) : (
                         'N/A'
                     )}
                   </TableCell>
                  <TableCell className="text-right font-mono px-2">{formatLargeNumber(crypto.marketCap)}</TableCell>
                  <TableCell className="text-right font-mono px-2">{formatLargeNumber(crypto.volume24h)}</TableCell>
                  <TableCell className="text-right font-mono px-2">
                    {crypto.circulatingSupply ? crypto.circulatingSupply.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 'N/A'}
                    {crypto.circulatingSupply ? <span className="ml-1 text-muted-foreground text-xs">{crypto.symbol.toUpperCase()}</span> : ''}
                  </TableCell>
                   <TableCell className="text-center px-2">
                     <SparklineChart data={crypto.sparkline} className="w-full h-10" />
                   </TableCell>
                </TableRow>
              )})
            ) : (
              // Show 'No results' only if not loading and there was no error, or if error occurred but we have no data
              !isLoading && (
                <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    {/* Don't show "No results" if there's an error message already */}
                    {error && cryptos.length === 0 ? '' : 'No results found.'}
                    </TableCell>
                </TableRow>
               )
            )}
          </TableBody>
        </Table>
      </div>
       {/* Add Pagination or Infinite Scroll later if needed */}
    </div>
  );
}

