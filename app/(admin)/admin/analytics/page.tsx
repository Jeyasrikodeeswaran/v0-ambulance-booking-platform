'use client';

import { useEffect, useState } from 'react';
import { Download, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { StatsCard } from '@/components/admin/stats-card';

interface AnalyticsStats {
  totalRequests: number;
  acceptanceRate: number;
  avgResponseTime: string;
  activeProviders: number;
  monthlyRevenue: number;
  requestsTrend: number;
  revenueGrowth: number;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats>({
    totalRequests: 0,
    acceptanceRate: 0,
    avgResponseTime: '0m',
    activeProviders: 0,
    monthlyRevenue: 0,
    requestsTrend: 0,
    revenueGrowth: 0,
  });

  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        const statsRes = await fetch('/api/admin/stats');
        const statsData = await statsRes.json();

        // Mock analytics data for demonstration
        setStats({
          totalRequests: statsData.total || 0,
          acceptanceRate: Math.round((statsData.accepted / (statsData.total || 1)) * 100) || 0,
          avgResponseTime: '15m',
          activeProviders: 5,
          monthlyRevenue: 45000,
          requestsTrend: 12,
          revenueGrowth: 8,
        });
      } catch (error) {
        console.error('[v0] Error loading analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [dateRange]);

  const handleExportData = async () => {
    try {
      const response = await fetch(
        `/api/admin/requests?page=1&pageSize=1000&status=&provider_id=&date_from=${dateRange.from}&date_to=${dateRange.to}`
      );
      const data = await response.json();

      // Convert to CSV
      const csv = [
        ['Request ID', 'User', 'Provider', 'Status', 'Date', 'Location'].join(','),
        ...data.requests.map((r: any) =>
          [
            r.id,
            r.user?.name || 'N/A',
            r.provider?.name || 'N/A',
            r.status,
            new Date(r.requested_at).toLocaleDateString(),
            `${r.pickup_location} → ${r.dropoff_location}`,
          ].join(',')
        ),
      ].join('\n');

      // Download CSV
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `requests-${dateRange.from}-to-${dateRange.to}.csv`;
      a.click();
    } catch (error) {
      console.error('[v0] Error exporting data:', error);
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics & Reports</h1>
        <p className="mt-2 text-muted-foreground">
          Comprehensive insights into platform performance and request metrics
        </p>
      </div>

      {/* Date Range & Export */}
      <div className="flex flex-col items-end gap-4 rounded-lg border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full gap-4 md:w-auto">
          <div className="flex-1 md:flex-initial">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">From</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex-1 md:flex-initial">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">To</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>
        <button
          onClick={handleExportData}
          className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export as CSV
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Requests"
          value={stats.totalRequests}
          icon={<TrendingUp className="h-6 w-6" />}
          trend={stats.requestsTrend}
          color="default"
        />
        <StatsCard
          label="Acceptance Rate"
          value={`${stats.acceptanceRate}%`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="success"
        />
        <StatsCard
          label="Avg Response Time"
          value={stats.avgResponseTime}
          icon={<Calendar className="h-6 w-6" />}
          color="warning"
        />
        <StatsCard
          label="Monthly Revenue"
          value={`₹${stats.monthlyRevenue.toLocaleString('en-IN')}`}
          icon={<TrendingUp className="h-6 w-6" />}
          trend={stats.revenueGrowth}
          color="success"
        />
      </div>

      {/* Performance Summary */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-bold text-foreground">Performance Summary</h2>
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Request Fulfillment Rate</p>
              <p className="text-xs text-muted-foreground">Percentage of accepted requests</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-32 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-green-600"
                  style={{ width: `${stats.acceptanceRate}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-foreground">{stats.acceptanceRate}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              <p className="text-sm font-medium text-foreground">Average Response Time</p>
              <p className="text-xs text-muted-foreground">Time taken to accept/reject requests</p>
            </div>
            <span className="text-sm font-semibold text-foreground">{stats.avgResponseTime}</span>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              <p className="text-sm font-medium text-foreground">Active Service Providers</p>
              <p className="text-xs text-muted-foreground">Providers with accepted requests</p>
            </div>
            <span className="text-sm font-semibold text-foreground">{stats.activeProviders}</span>
          </div>
        </div>
      </div>

      {/* Provider Performance */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-bold text-foreground">Provider Performance</h2>
        <div className="mt-6 space-y-3">
          {[
            { name: 'MediCare Ambulance', accepted: 28, rejected: 2, avgTime: '12m' },
            { name: 'RapidMed Services', accepted: 22, rejected: 5, avgTime: '18m' },
            { name: 'City Ambulance', accepted: 18, rejected: 3, avgTime: '15m' },
          ].map((provider) => (
            <div
              key={provider.name}
              className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{provider.name}</p>
                <p className="text-xs text-muted-foreground">
                  Acceptance Rate: {Math.round((provider.accepted / (provider.accepted + provider.rejected)) * 100)}%
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>{provider.accepted} accepted</p>
                <p>{provider.rejected} rejected</p>
                <p>Avg: {provider.avgTime}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
