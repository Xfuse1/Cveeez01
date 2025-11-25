"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Wallet, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddFundsDialogProps {
  userId: string;
  currentBalance: number;
  currency: string;
  onSuccess?: () => void;
}

export function AddFundsDialog({ userId, currentBalance, currency, onSuccess }: AddFundsDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('card');
  const { toast } = useToast();

  const quickAmounts = [50, 100, 200, 500];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (numAmount < 5) {
      toast({
        title: "Minimum amount",
        description: "Minimum top-up amount is 5 EGP",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/kashier/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount: numAmount,
          description: 'Wallet Top-up',
          paymentMethod: paymentMethod,
        }),
      });

      const data = await response.json();
      
      console.log('Payment response:', data);
      
      if (data.success && data.paymentUrl) {
        // Close dialog and redirect to payment page
        setOpen(false);
        onSuccess?.();
        window.location.href = data.paymentUrl;
      } else {
        toast({
          title: "Payment Error",
          description: data.error || data.details || "Failed to initiate payment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="default" 
        size="sm" 
        className="flex-1"
        onClick={() => setOpen(true)}
      >
        <CreditCard className="h-4 w-4 mr-2" />
        Add Funds
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Add Funds to Wallet
            </DialogTitle>
            <DialogDescription>
              Top up your wallet using Kashier payment gateway. Secure and instant.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* Current Balance */}
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Current Balance</p>
                <p className="text-xl font-bold">{currency} {currentBalance.toFixed(2)}</p>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={paymentMethod === 'card' ? 'default' : 'outline'}
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    onClick={() => setPaymentMethod('card')}
                  >
                    <CreditCard className="h-6 w-6" />
                    <span className="text-sm font-medium">Card</span>
                    <span className="text-xs opacity-70">Visa, Mastercard</span>
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMethod === 'wallet' ? 'default' : 'outline'}
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    onClick={() => setPaymentMethod('wallet')}
                  >
                    <Wallet className="h-6 w-6" />
                    <span className="text-sm font-medium">E-Wallet</span>
                    <span className="text-xs opacity-70">Vodafone Cash, etc.</span>
                  </Button>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ({currency})</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="10"
                  step="0.01"
                  required
                  className="text-lg"
                />
                <p className="text-xs text-muted-foreground">Minimum: 10 {currency}</p>
              </div>

              {/* Quick Amount Buttons */}
              <div className="space-y-2">
                <Label>Quick Select</Label>
                <div className="grid grid-cols-4 gap-2">
                  {quickAmounts.map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(quickAmount.toString())}
                      className="text-xs"
                    >
                      {quickAmount}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Payment Method Info */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  <p className="font-medium mb-1">Secure Payment via Kashier</p>
                  {paymentMethod === 'card' && (
                    <p>Visa, Mastercard, and Bank Installments accepted.</p>
                  )}
                  {paymentMethod === 'wallet' && (
                    <p>Vodafone Cash, Etisalat Cash, Orange Cash, and more.</p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Proceed to Payment
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
