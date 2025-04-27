import { CryptoTable } from '@/components/crypto-table';

export default async function Home() {
  // Initial data fetch can happen here if needed, or within the table component
  return (
      <CryptoTable />
  );
}
