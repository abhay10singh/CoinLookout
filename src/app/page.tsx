
import { Suspense } from 'react';
import { CryptoTable } from '@/components/crypto-table';
import { Skeleton } from '@/components/ui/skeleton'; 


function CryptoTableSkeleton() {
  return (
     <div className="w-full">
      {/* Skeleton for Search Bar */}
      <div className="flex items-center py-4 gap-4 mb-4">
        <Skeleton className="h-10 flex-1 rounded-md" />
      </div>
      {/* Skeleton for Table Container */}
      <Skeleton className="rounded-lg border h-[600px] w-full" />
    </div>
  );
}


export default function Home() {
  return (
    <Suspense fallback={<CryptoTableSkeleton />}>
      <CryptoTable />
    </Suspense>
  );
}
