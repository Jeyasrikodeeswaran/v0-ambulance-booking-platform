'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface RequestFiltersProps {
  onFiltersChange: (filters: Record<string, string>) => void;
  providers: Array<{ id: string; name: string }>;
}

export function RequestFilters({ onFiltersChange, providers }: RequestFiltersProps) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [provider, setProvider] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = () => {
    const filters: Record<string, string> = {};
    if (search) filters.search = search;
    if (status) filters.status = status;
    if (provider) filters.provider_id = provider;
    onFiltersChange(filters);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setProvider('');
    onFiltersChange({});
  };

  const hasActiveFilters = search || status || provider;

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by location..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            onFiltersChange({ search: e.target.value });
          }}
          className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm placeholder-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>

      {/* Basic Filters */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Status Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Status</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              handleFilterChange();
            }}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Provider Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Provider</label>
          <select
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value);
              handleFilterChange();
            }}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="">All Providers</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Advanced Toggle */}
        <div className="flex items-end">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            <Filter className="h-4 w-4" />
            Advanced
          </button>
        </div>
      </div>

      {/* Active Filters Display & Clear */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          {search && (
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
              <span>{`Location: ${search}`}</span>
            </div>
          )}
          {status && (
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
              <span>{`Status: ${status}`}</span>
            </div>
          )}
          {provider && (
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
              <span>{`Provider: ${provider}`}</span>
            </div>
          )}
          <button
            onClick={handleClearFilters}
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}
