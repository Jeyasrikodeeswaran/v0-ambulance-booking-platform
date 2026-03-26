'use client';

import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Users as UsersIcon, Phone, Mail, CheckCircle, Clock } from 'lucide-react';

interface User {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  role: string;
  is_verified: boolean;
  created_at: string;
}

interface UserTableProps {
  users: User[];
  isLoading?: boolean;
}

export function UserTable({ users, isLoading }: UserTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"></div>
        <p className="mt-4 text-sm text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center flex flex-col items-center">
        <UsersIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground">No users found</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1">There are no users matching your current search criteria.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-6 py-3 text-left font-semibold text-foreground">Name</th>
            <th className="px-6 py-3 text-left font-semibold text-foreground">Contact</th>
            <th className="px-6 py-3 text-left font-semibold text-foreground">Role</th>
            <th className="px-6 py-3 text-left font-semibold text-foreground">Registered Date</th>
            <th className="px-6 py-3 text-center font-semibold text-foreground">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-muted/50 transition-colors">
              <td className="px-6 py-4">
                <div className="font-semibold text-foreground">{user.full_name}</div>
                <div className="text-xs text-muted-foreground font-mono mt-1">{user.id.slice(0, 8)}...</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    {user.phone}
                  </div>
                  {user.email && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge variant="outline" className="capitalize select-none">{user.role}</Badge>
              </td>
              <td className="px-6 py-4 text-muted-foreground text-sm">
                {format(new Date(user.created_at), 'MMM dd, yyyy')}
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-center">
                  {user.is_verified ? (
                    <div className="flex items-center gap-1.5 text-green-600 dark:text-green-500">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs font-medium">Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-500">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs font-medium">Pending</span>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
