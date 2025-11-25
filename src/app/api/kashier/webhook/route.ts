import { NextRequest, NextResponse } from 'next/server';
import { validateKashierSignature, getKashierConfig } from '@/lib/kashier';
import { getTransactionByReferenceId, completeTransaction, completeTransactionByOrderId, updateTransactionStatus } from '@/services/wallet';
import type { KashierPaymentResponse } from '@/lib/kashier';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as KashierPaymentResponse;
    const config = getKashierConfig();

    console.log('Kashier webhook received:', body);

    // Validate signature using API KEY
    const isValid = validateKashierSignature(body, config.apiKey);

    if (!isValid) {
      console.error('Invalid Kashier signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Parse metadata to get transactionId
    const merchantOrderId = body.merchantOrderId;
    
    // Find transaction by merchant order ID
    const transaction = await getTransactionByReferenceId(merchantOrderId);
    
    if (!transaction) {
      console.error('Transaction not found for order:', merchantOrderId);
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Update transaction status based on payment status
    if (body.paymentStatus === 'SUCCESS' || body.paymentStatus === 'CAPTURED') {
      console.log('Payment successful:', {
        merchantOrderId,
        transactionId: transaction.id,
        kashierTransactionId: body.transactionId,
        amount: body.amount,
        currency: body.currency,
      });

      // Complete transaction and update wallet balance
      await completeTransaction(transaction.id, body);

      return NextResponse.json({ 
        success: true,
        message: 'Payment processed successfully'
      });
    } else if (body.paymentStatus === 'FAILED' || body.paymentStatus === 'DECLINED') {
      console.log('Payment failed:', {
        merchantOrderId,
        transactionId: transaction.id,
        paymentStatus: body.paymentStatus,
      });

      // Update transaction status to failed (wallet balance stays unchanged)
      await updateTransactionStatus(transaction.id, 'failed', {
        errorMessage: `Payment ${body.paymentStatus}`,
        paymentGatewayResponse: body,
      });

      return NextResponse.json({
        success: true,
        message: 'Payment failure recorded'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook received'
    });
  } catch (error) {
    console.error('Kashier webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Also handle GET requests for redirect callbacks
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const paymentData = {
    paymentStatus: searchParams.get('paymentStatus') || '',
    cardDataToken: searchParams.get('cardDataToken') || undefined,
    maskedCard: searchParams.get('maskedCard') || undefined,
    merchantOrderId: searchParams.get('merchantOrderId') || '',
    orderId: searchParams.get('orderId') || '',
    cardBrand: searchParams.get('cardBrand') || undefined,
    orderReference: searchParams.get('orderReference') || '',
    transactionId: searchParams.get('transactionId') || '',
    amount: searchParams.get('amount') || '',
    currency: searchParams.get('currency') || '',
    signature: searchParams.get('signature') || '',
  };

  console.log('Kashier callback received (GET):', paymentData);

  // Validate signature using API KEY
  const config = getKashierConfig();
  const isValid = validateKashierSignature(paymentData as KashierPaymentResponse, config.apiKey);

  if (!isValid) {
    console.error('Invalid Kashier signature in callback');
  }

  // Try to complete the transaction if payment was successful
  if (paymentData.paymentStatus === 'SUCCESS' || paymentData.paymentStatus === 'CAPTURED') {
    try {
      console.log('GET callback: Attempting to complete transaction for order:', paymentData.merchantOrderId);
      await completeTransactionByOrderId(paymentData.merchantOrderId, paymentData);
      console.log('GET callback: Transaction completed successfully');
    } catch (error) {
      console.error('Error completing transaction in GET callback:', error);
    }
  }

  // Redirect to wallet page with status
  // Prefer using the configured return URL from env; fall back to /wallet
  const baseReturn = process.env.NEXT_PUBLIC_KASHIER_RETURN_URL || `${request.nextUrl.origin}/wallet`;
  try {
    const redirectUrl = new URL(baseReturn);
    redirectUrl.searchParams.set('payment', paymentData.paymentStatus === 'SUCCESS' || paymentData.paymentStatus === 'CAPTURED' ? 'success' : 'failed');
    redirectUrl.searchParams.set('merchantOrderId', paymentData.merchantOrderId);
    if (paymentData.transactionId) {
      redirectUrl.searchParams.set('kashierTxId', paymentData.transactionId);
    }
    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    // If the configured return URL is not a valid absolute URL, fallback to relative wallet path
    const redirectUrl = new URL('/wallet', request.url);
    redirectUrl.searchParams.set('payment', paymentData.paymentStatus === 'SUCCESS' || paymentData.paymentStatus === 'CAPTURED' ? 'success' : 'failed');
    redirectUrl.searchParams.set('merchantOrderId', paymentData.merchantOrderId);
    if (paymentData.transactionId) {
      redirectUrl.searchParams.set('kashierTxId', paymentData.transactionId);
    }
    return NextResponse.redirect(redirectUrl);
  }
}
