import { NextRequest, NextResponse } from 'next/server';
import { fetchAllProviders, updateProviderStatus } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters = {
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const result = await fetchAllProviders(filters, page, pageSize);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch providers' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await updateProviderStatus(id, status);
    
    return NextResponse.json({ success: true, provider: result });
  } catch (error) {
    console.error('Error updating provider status:', error);
    return NextResponse.json(
      { error: 'Failed to update provider status' },
      { status: 500 }
    );
  }
}
