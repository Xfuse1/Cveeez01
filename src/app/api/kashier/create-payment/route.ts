import { NextRequest, NextResponse } from 'next/server';
import { generateKashierHash, createKashierPaymentUrl, getKashierConfig } from '@/lib/kashier';
import { createTransaction } from '@/services/wallet';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, description, orderId } = body;

    console.log('Kashier payment request:', { userId, amount, description });

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
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9004'}/wallet?payment=success&transactionId=${transactionId}`;
    const failureUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9004'}/wallet?payment=failed&transactionId=${transactionId}`;
    
    const order = {
      amount: amount.toString(),
      currency: config.currency,
      merchantOrderId: merchantOrderId,
      mid: config.merchantId,
      merchantRedirect: successUrl,
      display: 'en' as const,
      failureRedirect: failureUrl,
      redirectMethod: 'get' as const,
      allowedMethods: 'card',
      defaultMethod: 'card',
      brandColor: 'rgba(45, 164, 78, 0.9)',
      metaData: JSON.stringify({
        userId: userId,
        transactionId: transactionId,
        description: description || 'Wallet Top-up',
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
