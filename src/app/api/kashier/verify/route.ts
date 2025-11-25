import { NextRequest, NextResponse } from 'next/server';
import { completeTransactionByOrderId } from '@/services/wallet';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const merchantOrderId = searchParams.get('merchantOrderId') || searchParams.get('orderId') || '';

    if (!merchantOrderId) {
      return NextResponse.json({ success: false, message: 'Missing merchantOrderId' }, { status: 400 });
    }

    try {
      await completeTransactionByOrderId(merchantOrderId);
      return NextResponse.json({ success: true, message: 'Transaction verified and completed (if pending)' });
    } catch (err: any) {
      console.error('Error verifying transaction by order id:', merchantOrderId, err);
      return NextResponse.json({ success: false, message: err?.message || 'Verification failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('Kashier verify endpoint error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
