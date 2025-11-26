import { NextRequest, NextResponse } from 'next/server';
import { generateKashierHash, createKashierPaymentUrl, getKashierConfig } from '@/lib/kashier';
import { createTransaction } from '@/services/wallet';
import { getAppOrigin } from '@/lib/safe-get-origin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, description, orderId, productId, productName, productPlan, productQuantity, productType } = body;

    console.log('Kashier payment request:', { userId, amount, description, productId, productName, productPlan, productQuantity, productType });

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
    // Determine a clear referenceType and include product metadata for data integrity
    let referenceType = 'wallet_topup';
    const desc = description || productName || 'Wallet Top-up';

    if (productType === 'cv' || /cv/i.test(String(productName || '') + String(description || ''))) {
      if (productPlan && /monthly|subscription/i.test(String(productPlan))) referenceType = 'cv_subscription';
      else referenceType = 'cv_purchase';
    }

    const transactionId = await createTransaction(
      userId,
      'deposit',
      parseFloat(amount),
      'kashier',
      desc,
      {
        referenceId: merchantOrderId,
        referenceType,
        metadata: {
          orderId: merchantOrderId,
          kashierMerchantId: config.merchantId,
          product: {
            id: productId || null,
            name: productName || null,
            plan: productPlan || null,
            quantity: productQuantity || 1,
            type: productType || null,
          },
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
      allowedMethods: 'card',
      defaultMethod: 'card',
      brandColor: 'rgba(45, 164, 78, 0.9)',
      metaData: JSON.stringify({
        userId: userId,
        transactionId: transactionId,
        description: desc,
        product: {
          id: productId || null,
          name: productName || null,
          plan: productPlan || null,
          quantity: productQuantity || 1,
          type: productType || null,
        },
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
