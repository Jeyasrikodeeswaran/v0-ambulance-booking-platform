'use client';

import { useEffect, useState } from 'react';
import { BookingRequest } from '@/lib/supabase/admin';
import { RequestFilters } from '@/components/admin/request-filters';
import { RequestTable } from '@/components/admin/request-table';
import { RequestDetailsModal } from '@/components/admin/request-details-modal';
import { StatsCard } from '@/components/admin/stats-card';
import { Calendar, CheckCircle, Car, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface BookingsPageState {
  requests: BookingRequest[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading: boolean;
  filters: Record<string, string>;
  providers: Array<{ id: string; name: string }>;
  stats: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
}

export default function AdminBookingsPage() {
  const [state, setState] = useState<BookingsPageState>({
    requests: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
    isLoading: true,
    filters: {},
    providers: [],
    stats: { total: 0, pending: 0, accepted: 0, rejected: 0 },
  });

  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load providers and initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        // Fetch providers
        let providers: any[] = [];
        try {
          const providersRes = await fetch('/api/admin/requests/providers');
          const providersData = providersRes.ok ? await providersRes.json() : [];
          providers = Array.isArray(providersData) ? providersData : [];
        } catch (err) {
          console.error('[v0] Error fetching providers:', err);
          providers = [];
        }

        // Fetch stats
        let stats = { total: 0, pending: 0, accepted: 0, rejected: 0 };
        try {
          const statsRes = await fetch('/api/admin/stats');
          stats = statsRes.ok ? await statsRes.json() : stats;
        } catch (err) {
          console.error('[v0] Error fetching stats:', err);
        }

        setState((prev) => ({
          ...prev,
          providers: Array.isArray(providers) ? providers : [],
          stats,
        }));
      } catch (error) {
        console.error('[v0] Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, []);

  // Fetch requests when filters or page changes
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        const queryParams = new URLSearchParams({
          page: state.page.toString(),
          pageSize: state.pageSize.toString(),
          ...state.filters,
        });

        const res = await fetch(`/api/admin/requests?${queryParams}`);
        if (!res.ok) throw new Error('Failed to fetch requests');
        const data = await res.json();

        setState((prev) => ({
          ...prev,
          requests: data.requests || [],
          total: data.total || 0,
          totalPages: data.totalPages || 0,
          isLoading: false,
        }));
      } catch (error) {
        console.error('[v0] Error fetching requests:', error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchRequests();
  }, [state.page, state.filters]);

  const handleFiltersChange = (newFilters: Record<string, string>) => {
    setState((prev) => ({
      ...prev,
      filters: newFilters,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleSelectRequest = (request: BookingRequest) => {
    setSelectedRequest(request);
  };

  const handleAccept = async (id: string, notes?: string) => {
    try {
      setIsProcessing(true);
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept', notes }),
      });

      if (res.ok) {
        toast.success('Request accepted successfully');
        setState((prev) => ({
          ...prev,
          requests: prev.requests.map((r) =>
            r.id === id ? { ...r, status: 'accepted' as const } : r
          ),
        }));
        setSelectedRequest(null);
      } else {
        toast.error('Failed to accept request');
      }
    } catch (error) {
      console.error('[v0] Error accepting request:', error);
      toast.error('An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id: string, reason?: string) => {
    try {
      setIsProcessing(true);
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', notes: reason }),
      });

      if (res.ok) {
        toast.success('Request rejected successfully');
        setState((prev) => ({
          ...prev,
          requests: prev.requests.map((r) =>
            r.id === id ? { ...r, status: 'rejected' as const } : r
          ),
        }));
        setSelectedRequest(null);
      } else {
        toast.error('Failed to reject request');
      }
    } catch (error) {
      console.error('[v0] Error rejecting request:', error);
      toast.error('An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      setIsProcessing(true);
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });

      if (res.ok) {
        toast.success('Request cancelled successfully');
        setState((prev) => ({
          ...prev,
          requests: prev.requests.map((r) =>
            r.id === id ? { ...r, status: 'cancelled' as const } : r
          ),
        }));
        setSelectedRequest(null);
      } else {
        toast.error('Failed to cancel request');
      }
    } catch (error) {
      console.error('[v0] Error canceling request:', error);
      toast.error('An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">All Bookings</h1>
        <p className="mt-2 text-muted-foreground">Comprehensive history of all ambulance trips and requests.</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Bookings"
          value={state.stats.total}
          icon={<Calendar className="h-6 w-6" />}
          color="default"
        />
        <StatsCard
          label="Completed"
          value={state.stats.accepted}
          icon={<CheckCircle className="h-6 w-6" />}
          color="success"
        />
        <StatsCard
          label="Active Trips"
          value={state.stats.pending}
          icon={<Car className="h-6 w-6" />}
          color="warning"
        />
      </div>

      {/* Filters */}
      <RequestFilters
        providers={Array.isArray(state.providers) ? state.providers : []}
        onFiltersChange={handleFiltersChange}
      />

      {/* Requests Table */}
      <RequestTable
        requests={state.requests}
        onSelectRequest={handleSelectRequest}
        isLoading={state.isLoading}
      />

      {/* Pagination */}
      {state.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Page <span className="font-semibold text-foreground">{state.page}</span> of{' '}
            <span className="font-semibold text-foreground">{state.totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setState((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={state.page === 1}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  page: Math.min(prev.totalPages, prev.page + 1),
                }))
              }
              disabled={state.page === state.totalPages}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Request Details Modal */}
      <RequestDetailsModal
        request={selectedRequest}
        isLoading={false}
        onClose={() => setSelectedRequest(null)}
        onAccept={handleAccept}
        onReject={handleReject}
        onCancel={handleCancel}
        isProcessing={isProcessing}
      />
    </div>
  );
}
