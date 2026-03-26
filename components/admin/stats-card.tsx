'use client';

import { TrendingUp } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: number;
  color?: 'default' | 'success' | 'warning' | 'danger';
}

const colorStyles = {
  default: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
};

export function StatsCard({ label, value, icon, trend, color = 'default' }: StatsCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" />
              <span>{trend}% from last period</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`rounded-lg p-3 ${colorStyles[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
