'use client';

import { format } from 'date-fns';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  booking_id: string;
  provider_id: string;
  timestamp: string;
}

interface AuditTimelineProps {
  logs: AuditLog[];
  isLoading?: boolean;
}

const actionConfig = {
  accept_request: {
    label: 'Request Accepted',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  reject_request: {
    label: 'Request Rejected',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  cancel_request: {
    label: 'Request Cancelled',
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
};

export function AuditTimeline({ logs, isLoading }: AuditTimelineProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-border border-t-primary"></div>
        <p className="mt-3 text-sm text-muted-foreground">Loading audit history...</p>
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <Clock className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">No actions recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log, index) => {
        const config =
          actionConfig[log.action as keyof typeof actionConfig] || {
            label: log.action.replace(/_/g, ' '),
            icon: Clock,
            color: 'text-gray-600',
            bgColor: 'bg-gray-100',
          };

        const Icon = config.icon;

        return (
          <div key={log.id} className="flex gap-4">
            {/* Timeline line */}
            {index !== logs.length - 1 && (
              <div className="absolute left-6 top-16 h-8 w-px bg-border" />
            )}

            {/* Timeline dot */}
            <div className={`rounded-full p-2 ${config.bgColor} flex-shrink-0`}>
              <Icon className={`h-4 w-4 ${config.color}`} />
            </div>

            {/* Content */}
            <div className="flex-1 rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-foreground">{config.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(log.timestamp), 'PPpp')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
