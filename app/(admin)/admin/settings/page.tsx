'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);

  // Mock settings state
  const [settings, setSettings] = useState({
    platformFeePercentage: '5',
    baseFareBase: '500',
    approvalRequired: true,
    autoAssignWaitTime: '5',
    supportEmail: 'support@meditransit.com',
    supportPhone: '+91 800 123 4567'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // @ts-ignore
    const checked = type === 'checkbox' ? e.target.checked : undefined;
    
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      // alert('Settings saved successfully!');
    }, 1000);
  };

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto md:mx-0">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Platform Settings</h1>
        <p className="mt-2 text-muted-foreground">Configure global policies, fees, and general configurations.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Financial Settings */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2 mb-4">Financial & Fees</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Platform Fee (%)</label>
              <p className="text-xs text-muted-foreground mb-2">Commission taken on every successful ride.</p>
              <input 
                type="number" 
                name="platformFeePercentage"
                value={settings.platformFeePercentage}
                onChange={handleChange}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Default Base Fare (₹)</label>
              <p className="text-xs text-muted-foreground mb-2">Platform suggested minimum base trip fare.</p>
              <input 
                type="number" 
                name="baseFareBase"
                value={settings.baseFareBase}
                onChange={handleChange}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" 
              />
            </div>
          </div>
        </div>

        {/* Operational Settings */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2 mb-4">Operational Settings</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-foreground">Require Manual Provider Approval</label>
                <p className="text-xs text-muted-foreground">If disabled, providers bypass the "Pending" state when registering.</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input 
                  type="checkbox" 
                  name="approvalRequired"
                  checked={settings.approvalRequired}
                  onChange={handleChange}
                  className="peer sr-only" 
                />
                <div className="h-6 w-11 rounded-full bg-muted peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium text-foreground mb-1">Auto-assign Timeout (Minutes)</label>
              <p className="text-xs text-muted-foreground mb-2">Time before a broadcasted ride is unfulfilled.</p>
              <input 
                type="number" 
                name="autoAssignWaitTime"
                value={settings.autoAssignWaitTime}
                onChange={handleChange}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" 
              />
            </div>
          </div>
        </div>

        {/* Support Contact */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2 mb-4">Support Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Support Email</label>
              <input 
                type="email" 
                name="supportEmail"
                value={settings.supportEmail}
                onChange={handleChange}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" 
              />
            </div>
            <div>
               <label className="block text-sm font-medium text-foreground mb-1">Support Phone</label>
              <input 
                type="text" 
                name="supportPhone"
                value={settings.supportPhone}
                onChange={handleChange}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" 
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
           <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-70 min-w-[140px]"
          >
            {isSaving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
