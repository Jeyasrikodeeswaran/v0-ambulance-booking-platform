import { NextResponse } from 'next/server';
import { fetchAdminStats } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const stats = await fetchAdminStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
