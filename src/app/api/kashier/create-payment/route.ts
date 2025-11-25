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

    const merchantOrderId = orderId || `ORDER-${Date.now()}`;

    // Create pending transaction in database
    const transactionId = await createTransaction(
      userId,
      'deposit',
      typeof amount === 'number' ? amount : parseFloat(String(amount)),
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
      return NextResponse.json({ error: 'Failed to create transaction in database' }, { status: 500 });
    }

    // Generate Kashier hash using API KEY
    const hash = generateKashierHash(
      config.merchantId,
      merchantOrderId,
      String(amount),
      config.currency,
      config.apiKey
    );

    // Build URLs, prefer explicit env vars but fall back to app origin
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || getAppOrigin();
    const successUrl = process.env.NEXT_PUBLIC_KASHIER_RETURN_URL || `${baseUrl}/wallet?payment=success&transactionId=${transactionId}`;
    const failureUrl = `${(process.env.NEXT_PUBLIC_KASHIER_RETURN_URL || `${baseUrl}/wallet`)}?payment=failed&transactionId=${transactionId}`;
    const webhookUrl = process.env.NEXT_PUBLIC_KASHIER_WEBHOOK_URL || `${baseUrl}/api/kashier/webhook`;

    // Determine allowed methods based on user selection
    const allowedMethods = paymentMethod === 'wallet' ? 'wallet' : 'card';
    const defaultMethod = paymentMethod === 'wallet' ? 'wallet' : 'card';

    const order = {
      amount: String(amount),
      currency: config.currency,
      merchantOrderId,
      mid: config.merchantId,
      merchantRedirect: successUrl,
      serverWebhook: webhookUrl,
      display: 'en' as const,
      failureRedirect: failureUrl,
      redirectMethod: 'get' as const,
      allowedMethods,
      defaultMethod,
      brandColor: 'rgba(45, 164, 78, 0.9)',
      metaData: JSON.stringify({
        userId,
        transactionId,
        description: description || 'Wallet Top-up',
        paymentMethod: paymentMethod || 'card',
      }),
    };

    const paymentUrl = createKashierPaymentUrl(order, hash, config);

    return NextResponse.json({
      success: true,
      transactionId,
      paymentUrl,
      orderId: merchantOrderId,
    });
  } catch (error) {
    console.error('Kashier payment creation error:', error);
    return NextResponse.json({ error: 'Failed to create payment', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
