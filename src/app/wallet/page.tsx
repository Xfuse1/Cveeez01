"use client";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Filter,
  Search,
  CreditCard,
  DollarSign,
  RefreshCw
} from "lucide-react";
import { getWalletBalance, getTransactionHistory, completeTransaction, completeTransactionByOrderId } from "@/services/wallet";
import type { WalletBalance, Transaction } from "@/types/wallet";
import { AddFundsDialog } from "@/components/wallet/AddFundsDialog";
import { useToast } from "@/hooks/use-toast";

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'withdrawal' | 'payment' | 'refund'>('all');

  const loadWalletData = async (silent = false) => {
    if (!user) return;
    
    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    
    try {
      const [wallet, txHistory] = await Promise.all([
        getWalletBalance(user.uid),
        getTransactionHistory(user.uid, 100), // Fetch last 100 transactions
      ]);
      
      setWalletBalance(wallet);
      setTransactions(txHistory);
    } catch (error) {
      console.error("Wallet error:", error);
      if (!silent) {
        toast({
          title: "Error loading wallet",
          description: "Failed to load wallet data. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      if (!silent) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    // Wait for auth to load before redirecting
    if (authLoading) {
      return;
    }
    
    if (!user) {
      // If this return is coming from a payment provider, avoid forcing an immediate redirect to login.
      // A separate public return page (`/wallet/return`) will verify the payment server-side and then
      // either redirect the user back to `/wallet` or ask them to log in.
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const paymentParam = params.get('payment') || params.get('paymentStatus') || params.get('merchantOrderId') || params.get('orderId');
        if (paymentParam) {
          // Leave the page in a non-redirecting state so the return flow can complete.
          setLoading(false);
          return;
        }
      }

      router.push("/login");
      return;
    }
    
    loadWalletData();

    // Auto-refresh wallet balance every 30 seconds (silent refresh)
    const refreshInterval = setInterval(() => {
      loadWalletData(true);
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [user, authLoading, router]);

  useEffect(() => {
    // Check for payment status in URL params; prefer server-side verification to complete the transaction
    const handlePaymentCallback = async () => {
      if (typeof window === 'undefined') return;

      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment') || urlParams.get('paymentStatus');
      const merchantOrderId = urlParams.get('merchantOrderId') || urlParams.get('orderId') || '';

      if (!paymentStatus && !merchantOrderId) return;

      console.log('Payment callback params (wallet):', { paymentStatus, merchantOrderId });

      try {
        // Call server verify endpoint which will run completeTransactionByOrderId if needed
        const verifyUrl = `/api/kashier/verify?merchantOrderId=${encodeURIComponent(merchantOrderId)}`;
        const res = await fetch(verifyUrl);
        const data = await res.json();

        if (res.ok && data.success) {
          toast({
            title: "Payment Verified",
            description: data.message || 'Payment processed successfully. Reloading wallet...',
            variant: 'default',
            duration: 4000,
          });

          // Clean up URL params (so reloading doesn't re-run verification)
          try {
            window.history.replaceState({}, '', '/wallet');
          } catch (e) {
            // ignore
          }

          // If user is logged in, reload wallet data to reflect updated balance
          if (user) {
            // Give the backend a moment if webhook is still processing
            setTimeout(() => loadWalletData(), 1000);
          } else {
            // Not logged in: show a toast telling the user to login to see balance
            toast({
              title: 'Payment processed',
              description: 'Please log in to view your updated wallet balance.',
              variant: 'default',
            });
          }
        } else {
          toast({
            title: 'Payment not verified',
            description: data?.message || 'Payment could not be verified. Please contact support.',
            variant: 'destructive',
          });
          try { window.history.replaceState({}, '', '/wallet'); } catch (e) {}
        }
      } catch (err) {
        console.error('Error calling verify endpoint:', err);
        toast({
          title: 'Verification error',
          description: 'Could not verify payment. Please try again later.',
          variant: 'destructive',
        });
        try { window.history.replaceState({}, '', '/wallet'); } catch (e) {}
      }
    };

    if (!authLoading) {
      // Run verification even if user isn't logged in (server-side verify will complete DB changes)
      handlePaymentCallback();
    }
  }, [toast, user, authLoading]);

  const filteredTransactions = transactions.filter(tx => {
    const statusMatch = filterStatus === 'all' || tx.status === filterStatus;
    const typeMatch = filterType === 'all' || tx.type === filterType;
    return statusMatch && typeMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'refunded': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    const isPositive = type === 'deposit' || type === 'refund' || type === 'bonus' || type === 'cashback';
    return isPositive ? (
      <ArrowDownRight className="h-5 w-5 text-green-600 dark:text-green-400" />
    ) : (
      <ArrowUpRight className="h-5 w-5 text-red-600 dark:text-red-400" />
    );
  };

  const getAmountColor = (type: string) => {
    const isPositive = type === 'deposit' || type === 'refund' || type === 'bonus' || type === 'cashback';
    return isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (redirect will happen)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push("/services/user-dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Wallet Balance Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-6 w-6 text-primary" />
                Wallet Balance
              </div>
              {refreshing && (
                <span className="text-xs text-muted-foreground animate-pulse">
                  Refreshing...
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Available Balance</p>
                <p className="text-4xl font-bold">
                  {walletBalance ? `${walletBalance.currency} ${walletBalance.balance.toFixed(2)}` : "EGP 0.00"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Last updated: {walletBalance?.lastUpdated ? 
                    new Date(walletBalance.lastUpdated).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Never'
                  }
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => loadWalletData(true)}
                  disabled={refreshing}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <AddFundsDialog
                  userId={user!.uid}
                  currentBalance={walletBalance?.balance || 0}
                  currency={walletBalance?.currency || 'EGP'}
                  onSuccess={() => loadWalletData()}
                />
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export History
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Transaction History
              </CardTitle>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <div className="flex gap-2">
                  <Button
                    variant={filterStatus === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterStatus === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('completed')}
                  >
                    Completed
                  </Button>
                  <Button
                    variant={filterStatus === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('pending')}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={filterStatus === 'failed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('failed')}
                  >
                    Failed
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading transactions...</p>
              </div>
            ) : filteredTransactions.length > 0 ? (
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => {
                  const isPositive = transaction.type === 'deposit' || transaction.type === 'refund' || 
                                    transaction.type === 'bonus' || transaction.type === 'cashback';
                  
                  return (
                    <div 
                      key={transaction.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-10 h-10 rounded-full ${isPositive ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'} flex items-center justify-center flex-shrink-0`}>
                          {getTypeIcon(transaction.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold capitalize">{transaction.description}</p>
                            <Badge variant="secondary" className={`${getStatusColor(transaction.status)} text-xs`}>
                              {transaction.status}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>
                              <span className="font-medium">Date:</span>{' '}
                              {transaction.createdAt.toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            <p className="capitalize">
                              <span className="font-medium">Type:</span> {transaction.type}
                            </p>
                            {transaction.referenceId && (
                              <p className="font-mono text-xs">
                                <span className="font-medium">Reference:</span> {transaction.referenceId}
                              </p>
                            )}
                            {transaction.paymentMethod && (
                              <p className="capitalize">
                                <span className="font-medium">Payment Method:</span> {transaction.paymentMethod}
                              </p>
                            )}
                            {transaction.paymentGatewayId && (
                              <p className="font-mono text-xs">
                                <span className="font-medium">Gateway ID:</span> {transaction.paymentGatewayId}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          <p className={`text-lg font-bold ${getAmountColor(transaction.type)}`}>
                            {isPositive ? '+' : '-'}{transaction.currency} {transaction.amount.toFixed(2)}
                          </p>
                          {transaction.balanceAfter !== undefined && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Balance: {transaction.currency} {transaction.balanceAfter.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No Transactions Found</p>
                <p className="text-muted-foreground mb-6">
                  {filterStatus !== 'all' || filterType !== 'all' 
                    ? 'Try adjusting your filters to see more transactions.'
                    : 'Start by adding funds to your wallet.'}
                </p>
                {filterStatus === 'all' && filterType === 'all' && (
                  <AddFundsDialog
                    userId={user!.uid}
                    currentBalance={walletBalance?.balance || 0}
                    currency={walletBalance?.currency || 'EGP'}
                    onSuccess={() => loadWalletData()}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
