'use client';

import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

interface Provider {
  id: string;
  company_name: string;
  owner_name: string;
  phone: string;
  email: string;
  address: string;
  service_area: string;
  license_number: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface ProviderTableProps {
  providers: Provider[];
  isLoading?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isProcessing?: string | null;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  },
};

export function ProviderTable({ providers, isLoading, onApprove, onReject, isProcessing }: ProviderTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"></div>
        <p className="mt-4 text-sm text-muted-foreground">Loading providers...</p>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center flex flex-col items-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground">No providers found</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1">There are no providers matching your current search criteria.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-6 py-3 text-left font-semibold text-foreground">Company</th>
            <th className="px-6 py-3 text-left font-semibold text-foreground">Owner / Contact</th>
            <th className="px-6 py-3 text-left font-semibold text-foreground">License</th>
            <th className="px-6 py-3 text-left font-semibold text-foreground">Area</th>
            <th className="px-6 py-3 text-left font-semibold text-foreground">Status</th>
            {(onApprove || onReject) && <th className="px-6 py-3 text-center font-semibold text-foreground">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {providers.map((provider) => {
            const statusInfo = statusConfig[provider.status as keyof typeof statusConfig];
            const StatusIcon = statusInfo.icon;

            return (
              <tr key={provider.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-foreground">{provider.company_name}</div>
                  <div className="text-xs text-muted-foreground mt-1 text-ellipsis max-w-[150px] overflow-hidden whitespace-nowrap" title={provider.address}>
                    {provider.address}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-foreground font-medium">{provider.owner_name}</div>
                  <div className="text-xs text-muted-foreground mt-1 tracking-wide">{provider.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <code className="text-xs font-mono bg-muted px-2 py-1 rounded text-foreground">{provider.license_number}</code>
                </td>
                <td className="px-6 py-4 text-muted-foreground text-sm">
                  {provider.service_area}
                </td>
                <td className="px-6 py-4">
                  <div className="inline-flex items-center gap-1.5">
                    <StatusIcon className="h-4 w-4" />
                    <Badge className={`text-xs ${statusInfo.className}`}>{statusInfo.label}</Badge>
                  </div>
                </td>
                {(onApprove || onReject) && (
                  <td className="px-6 py-4">
                    {provider.status === 'pending' ? (
                      <div className="flex gap-2 justify-center">
                        {onApprove && (
                          <button
                            onClick={() => onApprove(provider.id)}
                            disabled={isProcessing === provider.id}
                            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded transition-colors disabled:opacity-50"
                            title="Approve Provider"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {onReject && (
                          <button
                            onClick={() => onReject(provider.id)}
                            disabled={isProcessing === provider.id}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors disabled:opacity-50"
                            title="Reject Provider"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-xs text-muted-foreground italic">Processed</div>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
