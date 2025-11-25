"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-provider';

export default function WalletReturn() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [status, setStatus] = useState<'pending' | 'success' | 'failed' | 'error' | 'idle'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const payment = searchParams.get('payment') || searchParams.get('paymentStatus');
    const merchantOrderId = searchParams.get('merchantOrderId') || searchParams.get('orderId') || '';

    // Start verification flow
    const verify = async () => {
      setStatus('pending');
      try {
        const res = await fetch(`/api/kashier/verify?merchantOrderId=${encodeURIComponent(merchantOrderId)}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setStatus(payment === 'SUCCESS' || payment === 'success' ? 'success' : 'success');
          setMessage(data.message || 'Payment verified');

          // If user is logged in, redirect to wallet so it reloads data
          setTimeout(() => {
            if (user) {
              router.push('/wallet');
            } else {
              // Not logged in: show login button (user should log in to see balance)
            }
          }, 1000);
        } else {
          setStatus('failed');
          setMessage(data?.message || 'Verification failed');
        }
      } catch (err: any) {
        console.error('Verify error:', err);
        setStatus('error');
        setMessage(err?.message || 'Verification error');
      }
    };

    if (merchantOrderId) verify();
  }, [searchParams, router, user]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {status === 'pending' && (
          <>
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <h2 className="text-lg font-semibold">Verifying payment...</h2>
            <p className="text-sm text-muted-foreground mt-2">Please wait while we confirm your payment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h2 className="text-lg font-semibold">Payment successful</h2>
            <p className="text-sm text-muted-foreground mt-2">{message || 'Your wallet has been updated.'}</p>
            {user ? (
              <Button className="mt-4" onClick={() => router.push('/wallet')}>Go to Wallet</Button>
            ) : (
              <div className="mt-4">
                <p className="text-sm">Please log in to see your updated balance.</p>
                <Button className="mt-3" onClick={() => router.push('/login')}>Login</Button>
              </div>
            )}
          </>
        )}

        {status === 'failed' && (
          <>
            <h2 className="text-lg font-semibold">Payment failed</h2>
            <p className="text-sm text-muted-foreground mt-2">{message || 'The payment did not complete.'}</p>
            <div className="mt-4">
              <Button onClick={() => router.push('/wallet')}>Back to Wallet</Button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 className="text-lg font-semibold">Error verifying payment</h2>
            <p className="text-sm text-muted-foreground mt-2">{message || 'An error occurred while verifying the payment.'}</p>
            <div className="mt-4">
              <Button onClick={() => router.push('/wallet')}>Back to Wallet</Button>
            </div>
          </>
        )}

        {status === 'idle' && (
          <>
            <h2 className="text-lg font-semibold">Processing...</h2>
            <p className="text-sm text-muted-foreground mt-2">Preparing to verify payment.</p>
          </>
        )}
      </div>
    </div>
  );
}
