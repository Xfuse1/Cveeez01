import { NextRequest, NextResponse } from 'next/server';
import { createTransaction } from '@/services/wallet';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, description } = body;

    if (!userId || !amount) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    // Generate a merchant order id for Kashier and store as referenceId on transaction
    const merchantOrderId = `kashier_${userId}_${Date.now()}`;

    // create a pending transaction linked to this merchantOrderId
    const transactionId = await createTransaction(
      userId,
      'deposit',
      amount,
      'kashier',
      description || 'Wallet Top-up',
      {
        referenceId: merchantOrderId,
        metadata: { merchantOrderId },
      }
    );

    if (!transactionId) {
      return NextResponse.json({ success: false, error: 'Failed to create transaction' }, { status: 500 });
    }

    // Build Kashier payment URL using configured env vars
    const kashierBase = process.env.NEXT_PUBLIC_KASHIER_BASE_URL || 'https://payments.kashier.io';
    const webhookUrl = process.env.NEXT_PUBLIC_KASHIER_WEBHOOK_URL || `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/kashier/webhook`;
    const returnUrl = process.env.NEXT_PUBLIC_KASHIER_RETURN_URL || `${process.env.NEXT_PUBLIC_APP_URL || ''}/wallet/return`;

    // Note: The exact Kashier API/URL parameters may vary; this endpoint builds a redirect URL
    // that includes merchantOrderId and callback parameters. Replace with real API integration as needed.
    const paymentUrl = `${kashierBase}/pay?merchantOrderId=${encodeURIComponent(merchantOrderId)}&successUrl=${encodeURIComponent(returnUrl)}&failureUrl=${encodeURIComponent(returnUrl + '?payment=failed')}&callbackUrl=${encodeURIComponent(webhookUrl)}`;

    return NextResponse.json({ success: true, paymentUrl, transactionId, merchantOrderId });
  } catch (error: any) {
    console.error('create-payment error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Internal error' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { generateKashierHash, createKashierPaymentUrl, getKashierConfig } from '@/lib/kashier';
import { createTransaction } from '@/services/wallet';
import { getAppOrigin } from '@/lib/safe-get-origin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, description, orderId, paymentMethod } = body;

    console.log('Kashier payment request:', { userId, amount, description, paymentMethod });

    if (!userId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields', details: { userId: !!userId, amount: !!amount } },
        { status: 400 }
      );
    }

    const config = getKashierConfig();
    console.log('Kashier config:', { 
      merchantId: config.merchantId,
      currency: config.currency,
      mode: config.mode,
      hasSecretKey: !!config.secretKey 
    });

    const merchantOrderId = orderId || `ORDER-${Date.now()}`;

    // Create pending transaction in database
    console.log('Creating transaction...');
    const transactionId = await createTransaction(
      userId,
      'deposit',
      parseFloat(amount),
      'kashier',
      description || 'Wallet Top-up',
      {
        referenceId: merchantOrderId,
        referenceType: 'wallet_topup',
        metadata: {
          orderId: merchantOrderId,
          kashierMerchantId: config.merchantId,
        },
      }
    );

    if (!transactionId) {
      console.error('Failed to create transaction in database');
      return NextResponse.json(
        { error: 'Failed to create transaction in database' },
        { status: 500 }
      );
    }

    console.log('Transaction created:', transactionId);

    // Generate Kashier hash using API KEY (not secret key)
    const hash = generateKashierHash(
      config.merchantId,
      merchantOrderId,
      amount.toString(),
      config.currency,
      config.apiKey
    );

    console.log('Hash generated:', hash);

    // Create Kashier order object
  const baseUrl = getAppOrigin();
  const successUrl = `${baseUrl}/wallet?payment=success&transactionId=${transactionId}`;
  const failureUrl = `${baseUrl}/wallet?payment=failed&transactionId=${transactionId}`;
  const webhookUrl = `${baseUrl}/api/kashier/webhook`;
    
    console.log('Kashier URLs:', {
      successUrl,
      failureUrl,
      webhookUrl,
    });
    
    // Determine allowed methods based on user selection
    const allowedMethods = paymentMethod === 'wallet' ? 'wallet' : 'card';
    const defaultMethod = paymentMethod === 'wallet' ? 'wallet' : 'card';
    
    const order = {
      amount: amount.toString(),
      currency: config.currency,
      merchantOrderId: merchantOrderId,
      mid: config.merchantId,
      merchantRedirect: successUrl,
      serverWebhook: webhookUrl,  // Add webhook URL here
      display: 'en' as const,
      failureRedirect: failureUrl,
      redirectMethod: 'get' as const,
      allowedMethods: allowedMethods,
      defaultMethod: defaultMethod,
      brandColor: 'rgba(45, 164, 78, 0.9)',
      metaData: JSON.stringify({
        userId: userId,
        transactionId: transactionId,
        description: description || 'Wallet Top-up',
        paymentMethod: paymentMethod || 'card',
      }),
    };

    // Generate payment URL
    const paymentUrl = createKashierPaymentUrl(order, hash, config);

    console.log('Payment URL generated:', paymentUrl);

    return NextResponse.json({
      success: true,
      transactionId,
      paymentUrl,
      orderId: merchantOrderId,
    });
  } catch (error) {
    console.error('Kashier payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
