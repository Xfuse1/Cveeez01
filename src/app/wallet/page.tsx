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
  DollarSign
} from "lucide-react";
import { getWalletBalance, getTransactionHistory, completeTransaction } from "@/services/wallet";
import type { WalletBalance, Transaction } from "@/types/wallet";
import { AddFundsDialog } from "@/components/wallet/AddFundsDialog";
import { useToast } from "@/hooks/use-toast";

export default function WalletPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'withdrawal' | 'payment' | 'refund'>('all');

  const loadWalletData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [wallet, txHistory] = await Promise.all([
        getWalletBalance(user.uid),
        getTransactionHistory(user.uid, 100), // Fetch last 100 transactions
      ]);
      
      setWalletBalance(wallet);
      setTransactions(txHistory);
    } catch (error) {
      console.error("Wallet error:", error);
      toast({
        title: "Error loading wallet",
        description: "Failed to load wallet data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadWalletData();
  }, [user, router]);

  useEffect(() => {
    // Check for payment status in URL params
    const handlePaymentCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment');
      const transactionId = urlParams.get('transactionId');
      const orderId = urlParams.get('orderId');
      
      if (paymentStatus === 'success') {
        // If transaction ID is provided, ensure the transaction is completed
        if (transactionId && user) {
          try {
            // Attempt to complete the transaction (in case webhook didn't fire)
            await completeTransaction(transactionId);
            console.log('Transaction completed via callback');
          } catch (error) {
            console.log('Transaction completion error (may already be completed):', error);
          }
        }
        
        toast({
          title: "Payment Successful! 🎉",
          description: `Your wallet has been topped up successfully.${transactionId ? ` Transaction ID: ${transactionId}` : ''}`,
          variant: "default",
          duration: 5000,
        });
        
        // Clean up URL params
        window.history.replaceState({}, '', '/wallet');
        
        // Reload wallet data to show updated balance
        setTimeout(() => loadWalletData(), 1000); // Small delay to ensure backend has processed
      } else if (paymentStatus === 'failed') {
        toast({
          title: "Payment Failed",
          description: "Your payment could not be processed. Please try again or contact support.",
          variant: "destructive",
          duration: 5000,
        });
        // Clean up URL params
        window.history.replaceState({}, '', '/wallet');
      }
    };
    
    if (user) {
      handlePaymentCallback();
    }
  }, [toast, user]);

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
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-6 w-6 text-primary" />
              Wallet Balance
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
              {walletBalance?.totalDeposited && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  Total Deposited: {walletBalance.currency} {walletBalance.totalDeposited.toFixed(2)}
                </p>
              )}
            </div>              <div className="flex flex-col sm:flex-row gap-3">
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
                            {transaction.metadata?.kashierOrderId && (
                              <p className="font-mono text-xs">
                                <span className="font-medium">Order ID:</span> {transaction.metadata.kashierOrderId}
                              </p>
                            )}
                            {transaction.metadata?.chargedAmount && (
                              <p className="font-semibold text-green-600 dark:text-green-400">
                                <span className="font-medium">Charged Amount:</span> {transaction.currency} {transaction.metadata.chargedAmount.toFixed(2)}
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
