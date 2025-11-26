import { NextRequest, NextResponse } from 'next/server';
import { validateKashierSignature, getKashierConfig } from '@/lib/kashier';
import { getTransactionByReferenceId, completeTransaction, updateTransactionStatus } from '@/services/wallet';
import CVQuotaService from '@/services/cv-quota-service';
import { db } from '@/firebase/config';
import { doc, runTransaction, Timestamp } from 'firebase/firestore';
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
      await completeTransaction(transaction.id, {
        ...body,
        // Add charged amount to metadata
        metadata: {
          ...(body as any).metadata,
          chargedAmount: body.amount,
          kashierOrderId: body.transactionId || body.merchantOrderId,
        }
      });

      // --- Grant CV quota on purchase (if this transaction represents a CV package) ---
      try {
        // Heuristics to detect CV package purchase:
        // - referenceType explicitly set by purchase flow (e.g. 'cv_purchase')
        // - metadata.product or metadata.plan provided by purchase flow
        // - description contains 'cv' or 'CV'
        const refType = (transaction as any).referenceType as string | undefined;
        const metadata = (transaction as any).metadata as any | undefined;
        const desc = (transaction as any).description as string | undefined;

        let grantPlan: 'monthly' | 'one-time' | null = null;

        if (refType && /cv/i.test(refType)) {
          // referenceType explicitly mentions CV
          if (/monthly/i.test(refType)) grantPlan = 'monthly';
          else grantPlan = 'one-time';
        } else if (metadata && metadata.product) {
          const p = String(metadata.product).toLowerCase();
          if (p.includes('monthly') || p.includes('subscription')) grantPlan = 'monthly';
          else if (p.includes('cv') || p.includes('one-time')) grantPlan = 'one-time';
        } else if (desc && /cv/i.test(desc)) {
          // fallback: description contains CV
          // If it mentions "monthly" assume monthly, otherwise one-time
          if (/monthly|subscription/i.test(desc)) grantPlan = 'monthly';
          else grantPlan = 'one-time';
        }

        if (grantPlan) {
          const userId = transaction.userId;

          // Map plan to quota values
          const now = new Date();
          let allowed = 1;
          let expiresAt: Date | null = null;

          if (grantPlan === 'monthly') {
            allowed = 3; // monthly subscription => 3 CVs per window
            // expires in ~30 days
            expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          } else {
            allowed = 1; // one-time purchase => single CV
            expiresAt = null;
          }

          // Use a Firestore transaction to atomically mark the transaction as quotaGranted.
          // Only the first webhook handler that succeeds in setting this flag will proceed to grant the quota.
          try {
            const txRef = doc(db, 'transactions', transaction.id);
            // TODO: strict type: annotate tx as `any` and replace with proper Transaction type in strict pass
            const already = await runTransaction(db, async (tx: any) => {
              const snap = await tx.get(txRef);
              if (!snap.exists()) {
                // Nothing to do
                return true; // treat as already handled to avoid granting
              }
              const data = snap.data() as any;
              if (data.quotaGranted) return true; // already granted
              tx.update(txRef, { quotaGranted: true, quotaGrantedAt: Timestamp.now() });
              return false; // we just set it
            });

            if (already) {
              console.log('Quota already granted for transaction, skipping for user', userId);
            } else {
              // Proceed to set the quota now that we've atomically reserved the grant
              const existing = await CVQuotaService.getQuota(userId);
              if (existing) {
                const existingExpires = existing.expiresAt ? (existing.expiresAt as any).toDate?.() ?? null : null;
                const existingAllowed = existing.allowed || 0;
                if (existingAllowed >= allowed && (!existingExpires || !expiresAt || existingExpires >= expiresAt)) {
                  console.log('Existing quota covers new grant — skipping setQuota for', userId);
                } else {
                  await CVQuotaService.setQuota(userId, allowed, grantPlan === 'monthly' ? 'monthly' : 'one-time', expiresAt);
                  console.log('CV quota set for user', userId, { allowed, plan: grantPlan, expiresAt });
                }
              } else {
                await CVQuotaService.setQuota(userId, allowed, grantPlan === 'monthly' ? 'monthly' : 'one-time', expiresAt);
                console.log('CV quota set for user', userId, { allowed, plan: grantPlan, expiresAt });
              }
            }
          } catch (err) {
            console.error('Error during transactional quota reservation:', err);
          }
        }
      } catch (err) {
        console.error('Error while attempting to grant CV quota after payment:', err);
      }

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

  // Redirect to wallet page with status
  const redirectUrl = new URL('/wallet', request.url);
  redirectUrl.searchParams.set('payment', paymentData.paymentStatus === 'SUCCESS' ? 'success' : 'failed');
  redirectUrl.searchParams.set('orderId', paymentData.merchantOrderId);

  return NextResponse.redirect(redirectUrl);
}
