'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { BookingRequest } from '@/lib/supabase/admin';
import { X, Send, CheckCircle, XCircle, MapPin, Phone, Mail, User, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RequestDetailsModalProps {
  request: BookingRequest | null;
  auditLogs?: any[];
  isLoading?: boolean;
  onClose: () => void;
  onAccept: (id: string, notes?: string) => void;
  onReject: (id: string, reason?: string) => void;
  onCancel: (id: string) => void;
  isProcessing?: boolean;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
  completed: 'bg-blue-100 text-blue-800',
};

export function RequestDetailsModal({
  request,
  auditLogs,
  isLoading,
  onClose,
  onAccept,
  onReject,
  onCancel,
  isProcessing,
}: RequestDetailsModalProps) {
  const [actionNotes, setActionNotes] = useState('');
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  if (!request) return null;

  const handleActionSubmit = () => {
    if (!selectedAction) return;

    switch (selectedAction) {
      case 'accept':
        onAccept(request.id, actionNotes);
        break;
      case 'reject':
        onReject(request.id, actionNotes);
        break;
      case 'cancel':
        onCancel(request.id);
        break;
    }

    setActionNotes('');
    setSelectedAction(null);
  };

  const canPerformActions = request.status === 'pending';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-card shadow-lg">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Request Details</h2>
            <p className="text-xs text-muted-foreground">ID: {request.id}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg hover:bg-muted p-2 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"></div>
          </div>
        ) : (
          <div className="space-y-6 p-6">
            {/* Status Section */}
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <div>
                <p className="text-xs text-muted-foreground">Current Status</p>
                <p className="text-lg font-semibold text-foreground">
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </p>
              </div>
              <Badge className={statusColors[request.status as keyof typeof statusColors]}>
                {request.status.toUpperCase()}
              </Badge>
            </div>

            {/* Request Details Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* User Information */}
              <div className="space-y-4 rounded-lg border border-border p-4">
                <h3 className="flex items-center gap-2 font-semibold text-foreground">
                  <User className="h-4 w-4" />
                  User Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium text-foreground">{request.user?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      Email
                    </p>
                    <p className="font-medium text-foreground">{request.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      Phone
                    </p>
                    <p className="font-medium text-foreground">{request.user?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Provider Information */}
              <div className="space-y-4 rounded-lg border border-border p-4">
                <h3 className="flex items-center gap-2 font-semibold text-foreground">
                  <Truck className="h-4 w-4" />
                  Provider Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium text-foreground">{request.provider?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      Email
                    </p>
                    <p className="font-medium text-foreground">{request.provider?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      Phone
                    </p>
                    <p className="font-medium text-foreground">{request.provider?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-3 rounded-lg border border-border p-4">
              <h3 className="flex items-center gap-2 font-semibold text-foreground">
                <MapPin className="h-4 w-4" />
                Location Details
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Pickup Location</p>
                  <p className="font-medium text-foreground">{request.pickup_location}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Dropoff Location</p>
                  <p className="font-medium text-foreground">{request.dropoff_location}</p>
                </div>
              </div>
            </div>

            {/* Ambulance Information */}
            <div className="space-y-3 rounded-lg border border-border p-4">
              <h3 className="flex items-center gap-2 font-semibold text-foreground">
                <Truck className="h-4 w-4" />
                Ambulance Details
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Vehicle Name</p>
                  <p className="font-medium text-foreground">{request.ambulance?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">License Plate</p>
                  <p className="font-medium text-foreground">{request.ambulance?.license_plate || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-muted-foreground">Vehicle Type</p>
                  <p className="font-medium text-foreground">{request.ambulance?.vehicle_type || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Timing Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-xs text-muted-foreground">Requested At</p>
                <p className="font-medium text-foreground">
                  {format(new Date(request.requested_at), 'PPpp')}
                </p>
              </div>
            </div>

            {/* Notes */}
            {request.notes && (
              <div className="rounded-lg bg-muted p-4">
                <p className="text-xs text-muted-foreground mb-2">Notes</p>
                <p className="text-sm text-foreground">{request.notes}</p>
              </div>
            )}

            {/* Action Section */}
            {canPerformActions && (
              <div className="space-y-4 rounded-lg border border-border bg-muted/50 p-4">
                <h3 className="font-semibold text-foreground">Take Action</h3>

                {selectedAction ? (
                  <div className="space-y-3">
                    <textarea
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      placeholder={
                        selectedAction === 'accept'
                          ? 'Add acceptance notes (optional)...'
                          : selectedAction === 'reject'
                            ? 'Add rejection reason (required)...'
                            : 'Add cancellation reason (optional)...'
                      }
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleActionSubmit}
                        disabled={isProcessing || (selectedAction === 'reject' && !actionNotes)}
                        className="flex items-center gap-2 flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                      >
                        <Send className="h-4 w-4" />
                        Submit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAction(null);
                          setActionNotes('');
                        }}
                        className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedAction('accept')}
                      disabled={isProcessing}
                      className="flex items-center gap-2 flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => setSelectedAction('reject')}
                      disabled={isProcessing}
                      className="flex items-center gap-2 flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Status Info */}
            {!canPerformActions && (
              <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                This request is {request.status} and cannot be modified.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
