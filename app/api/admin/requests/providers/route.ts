import { NextResponse } from 'next/server';
import { fetchProviders } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const providers = await fetchProviders();
    return NextResponse.json(providers || []);
  } catch (error) {
    console.error('Error fetching providers:', error);
    // Return empty array instead of error to prevent frontend crashes
    return NextResponse.json([]);
  }
}
