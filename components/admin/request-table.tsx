'use client';

import { format } from 'date-fns';
import { BookingRequest } from '@/lib/supabase/admin';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface RequestTableProps {
  requests: BookingRequest[];
  onSelectRequest: (request: BookingRequest) => void;
  isLoading?: boolean;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  },
  accepted: {
    label: 'Accepted',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  },
  cancelled: {
    label: 'Cancelled',
    icon: AlertCircle,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  },
};

export function RequestTable({ requests, onSelectRequest, isLoading }: RequestTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"></div>
        <p className="mt-4 text-sm text-muted-foreground">Loading requests...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">No requests found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-6 py-3 text-left font-semibold text-foreground">Request ID</th>
            <th className="px-6 py-3 text-left font-semibold text-foreground">User</th>
            <th className="px-6 py-3 text-left font-semibold text-foreground">Provider</th>
            <th className="px-6 py-3 text-left font-semibold text-foreground">Location</th>
            <th className="px-6 py-3 text-left font-semibold text-foreground">Requested</th>
            <th className="px-6 py-3 text-center font-semibold text-foreground">Status</th>
            <th className="px-6 py-3 text-center font-semibold text-foreground">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {requests.map((request) => {
            const statusInfo = statusConfig[request.status as keyof typeof statusConfig];
            const StatusIcon = statusInfo.icon;

            return (
              <tr
                key={request.id}
                className="hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onSelectRequest(request)}
              >
                <td className="px-6 py-4">
                  <code className="rounded bg-muted px-2 py-1 text-xs font-mono">
                    {request.id.slice(0, 8)}...
                  </code>
                </td>
                <td className="px-6 py-4">
                  <div className="text-foreground font-medium">{request.user?.name || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground">{request.user?.phone || 'N/A'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-foreground font-medium">{request.provider?.name || 'N/A'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <div className="truncate text-foreground text-sm">{request.pickup_location}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      → {request.dropoff_location}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {format(new Date(request.requested_at), 'MMM dd, HH:mm')}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex items-center gap-2">
                    <StatusIcon className="h-4 w-4" />
                    <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRequest(request);
                    }}
                    className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
