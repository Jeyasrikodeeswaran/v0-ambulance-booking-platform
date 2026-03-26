'use client';

import { useEffect, useState } from 'react';
import { ProviderTable } from '@/components/admin/provider-table';
import { Search } from 'lucide-react';

export default function AllProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchProviders = async (searchQuery: string, pageNum: number) => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        pageSize: '20',
      });
      
      if (searchQuery) queryParams.set('search', searchQuery);

      const res = await fetch(`/api/admin/providers?${queryParams}`);
      if (!res.ok) throw new Error('Failed to fetch all providers');
      const data = await res.json();
      
      setProviders(data.providers || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const handler = setTimeout(() => {
      fetchProviders(search, page);
    }, 400);

    return () => clearTimeout(handler);
  }, [search, page]);

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">All Providers</h1>
        <p className="mt-2 text-muted-foreground">Comprehensive directory of all ambulance service providers registered on the platform.</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
             <input
              type="text"
              placeholder="Search providers..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // reset to first page on search
              }}
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <ProviderTable
          providers={providers}
          isLoading={isLoading}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              Page <span className="font-semibold text-foreground">{page}</span> of{' '}
              <span className="font-semibold text-foreground">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
