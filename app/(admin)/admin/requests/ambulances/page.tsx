'use client';

import { useEffect, useState } from 'react';
import { fetchAmbulanceRegistrations, updateAmbulanceRegistrationStatus } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Ambulance, 
  Check, 
  X, 
  Search, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  Info,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AmbulanceRegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReg, setSelectedReg] = useState<any | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAmbulanceRegistrations({ status: 'pending' });
      setRegistrations(data.registrations);
    } catch (error) {
      console.error('Failed to load registrations:', error);
      toast.error('Failed to load ambulance registrations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedReg || !actionType) return;

    try {
      setIsProcessing(true);
      await updateAmbulanceRegistrationStatus(selectedReg.id, actionType === 'approve' ? 'approved' : 'rejected');
      
      toast.success(`Ambulance registration ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
      
      // Refresh list
      setRegistrations(prev => prev.filter(r => r.id !== selectedReg.id));
      setSelectedReg(null);
      setActionType(null);
    } catch (error) {
      console.error(`Failed to ${actionType} registration:`, error);
      toast.error(`Failed to ${actionType} registration`);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredRegistrations = registrations.filter(reg => 
    reg.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.provider_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.driver_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ambulance Registrations</h1>
          <p className="text-muted-foreground">
            Review and approve new ambulance registration requests from providers
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Pending Requests</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by vehicle, provider, or driver..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4">
                <Ambulance className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No pending registrations</h3>
              <p className="text-sm text-muted-foreground">
                All ambulance registration requests have been processed.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ambulance Details</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Driver Info</TableHead>
                    <TableHead>Location & Specs</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-bold">{reg.vehicle_number}</span>
                          <Badge variant="outline" className="w-fit capitalize">
                            {reg.type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-primary">{reg.provider_name}</span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {reg.provider_phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1 text-sm">
                            <User className="h-3 w-3" />
                            {reg.driver_name}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {reg.driver_phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate max-w-[150px]">{reg.base_location}</span>
                          </div>
                          <div className="text-xs text-muted-foreground font-medium">
                            ₹{reg.base_charge} + ₹{reg.price_per_km}/km
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700"
                            onClick={() => {
                              setSelectedReg(reg);
                              setActionType('approve');
                            }}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:bg-red-50 hover:text-destructive"
                            onClick={() => {
                              setSelectedReg(reg);
                              setActionType('reject');
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog 
        open={selectedReg !== null} 
        onOpenChange={(open) => !open && setSelectedReg(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'approve' ? (
                <>
                  <Check className="h-5 w-5 text-green-600" />
                  Approve Registration
                </>
              ) : (
                <>
                  <X className="h-5 w-5 text-destructive" />
                  Reject Registration
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {actionType} the registration for vehicle 
              <span className="font-semibold text-foreground mx-1">{selectedReg?.vehicle_number}</span> 
              from <span className="font-semibold text-foreground">{selectedReg?.provider_name}</span>?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-start gap-3 rounded-lg bg-muted p-3 text-sm">
              <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">Registration Details</p>
                <ul className="mt-1 space-y-1 text-muted-foreground">
                  <li>• Type: <span className="capitalize">{selectedReg?.type}</span></li>
                  <li>• Driver: {selectedReg?.driver_name} ({selectedReg?.driver_phone})</li>
                  <li>• Location: {selectedReg?.base_location}</li>
                </ul>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReg(null)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              variant={actionType === 'approve' ? 'default' : 'destructive'} 
              onClick={handleAction} 
              disabled={isProcessing}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {actionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
