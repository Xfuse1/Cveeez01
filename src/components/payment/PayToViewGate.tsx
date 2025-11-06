"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock, Unlock, Wallet, Eye, Loader2 } from "lucide-react";
import {
  payToViewSeekerProfile,
  payToViewJobDetails,
  canViewSeekerProfile,
  canViewJobDetails,
  getSeekerProfileViewPrice,
  getJobDetailsViewPrice,
} from "@/services/view-payment";
import { getWalletBalance } from "@/services/wallet";

interface PayToViewGateProps {
  // User viewing the content
  viewerId: string;
  
  // Target content details
  targetId: string;
  targetType: 'seeker_profile' | 'job_details';
  
  // Content to show when locked/unlocked
  lockedContent: React.ReactNode;
  unlockedContent: React.ReactNode;
  
  // Optional customization
  title?: string;
  description?: string;
}

/**
 * PayToViewGate Component
 * 
 * Displays locked content with a payment gate. Users must pay from their wallet
 * to unlock and view the full content. Once paid, they have permanent access.
 * 
 * Usage Examples:
 * 
 * For Seeker Profile (Employer viewing):
 * <PayToViewGate
 *   viewerId={employerId}
 *   targetId={seekerId}
 *   targetType="seeker_profile"
 *   lockedContent={<SeekerProfilePreview />}
 *   unlockedContent={<FullSeekerProfile />}
 * />
 * 
 * For Job Details (Seeker viewing):
 * <PayToViewGate
 *   viewerId={seekerId}
 *   targetId={jobId}
 *   targetType="job_details"
 *   lockedContent={<JobPreview />}
 *   unlockedContent={<FullJobDetails />}
 * />
 */
export function PayToViewGate({
  viewerId,
  targetId,
  targetType,
  lockedContent,
  unlockedContent,
  title,
  description,
}: PayToViewGateProps) {
  const { toast } = useToast();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [price, setPrice] = useState<{ price: number; currency: string } | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  useEffect(() => {
    checkAccessAndLoadData();
  }, [viewerId, targetId, targetType]);

  const checkAccessAndLoadData = async () => {
    setLoading(true);
    try {
      // Check if user has already paid for access
      let access = false;
      if (targetType === 'seeker_profile') {
        access = await canViewSeekerProfile(viewerId, targetId);
      } else {
        access = await canViewJobDetails(viewerId, targetId);
      }
      setHasAccess(access);

      // If no access, load pricing and wallet balance
      if (!access) {
        const [pricingData, wallet] = await Promise.all([
          targetType === 'seeker_profile' 
            ? getSeekerProfileViewPrice() 
            : getJobDetailsViewPrice(),
          getWalletBalance(viewerId),
        ]);
        
        setPrice({
          price: pricingData.price,
          currency: pricingData.currency,
        });
        setWalletBalance(wallet?.balance || 0);
      }
    } catch (error) {
      console.error('Error checking access:', error);
      toast({
        title: "Error",
        description: "Failed to load content access status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    setProcessing(true);
    try {
      const result = targetType === 'seeker_profile'
        ? await payToViewSeekerProfile(viewerId, targetId)
        : await payToViewJobDetails(viewerId, targetId);

      if (result.success) {
        toast({
          title: "Unlocked!",
          description: result.message,
        });
        setHasAccess(true);
        // Refresh wallet balance
        const wallet = await getWalletBalance(viewerId);
        setWalletBalance(wallet?.balance || 0);
      } else {
        toast({
          title: "Payment Failed",
          description: result.message,
          variant: "destructive",
        });
        
        // If insufficient balance, suggest topping up
        if (result.error === 'insufficient_balance') {
          setTimeout(() => {
            toast({
              title: "Top Up Your Wallet",
              description: "Visit your wallet page to add funds",
              action: (
                <Button size="sm" onClick={() => window.location.href = '/wallet'}>
                  Go to Wallet
                </Button>
              ),
            });
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error unlocking content:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // User has access - show unlocked content
  if (hasAccess) {
    return <>{unlockedContent}</>;
  }

  // User needs to pay - show locked content with payment gate
  return (
    <div className="space-y-6">
      {/* Preview/Locked Content */}
      <div className="relative">
        <div className="blur-sm pointer-events-none">
          {lockedContent}
        </div>
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      </div>

      {/* Payment Gate Card */}
      <Card className="border-2 border-primary/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            {title || (targetType === 'seeker_profile' ? 'Unlock Full Profile' : 'Unlock Job Details')}
          </CardTitle>
          <CardDescription>
            {description || (targetType === 'seeker_profile' 
              ? 'Pay once to view this candidate\'s complete profile including resume, contact details, and work history.' 
              : 'Pay once to view the complete job description, requirements, and application details.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pricing Display */}
          {price && (
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div>
                <p className="text-sm text-muted-foreground">One-time payment</p>
                <p className="text-2xl font-bold text-primary">
                  {price.currency} {price.price.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Your Balance</p>
                <p className={`text-lg font-semibold ${walletBalance !== null && walletBalance >= price.price ? 'text-green-600' : 'text-red-600'}`}>
                  {price.currency} {walletBalance?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          )}

          {/* Unlock Button */}
          <div className="space-y-2">
            <Button
              onClick={handleUnlock}
              disabled={processing || (walletBalance !== null && price !== null && walletBalance < price.price)}
              className="w-full"
              size="lg"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4 mr-2" />
                  {walletBalance !== null && price !== null && walletBalance < price.price
                    ? 'Insufficient Balance'
                    : `Unlock for ${price?.currency} ${price?.price.toFixed(2)}`}
                </>
              )}
            </Button>

            {walletBalance !== null && price !== null && walletBalance < price.price && (
              <Button
                variant="outline"
                onClick={() => window.location.href = '/wallet'}
                className="w-full"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Top Up Wallet
              </Button>
            )}
          </div>

          {/* Benefits List */}
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">What you'll get:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {targetType === 'seeker_profile' ? (
                <>
                  <li className="flex items-center gap-2">
                    <Eye className="h-3 w-3 text-primary" />
                    Complete resume and work history
                  </li>
                  <li className="flex items-center gap-2">
                    <Eye className="h-3 w-3 text-primary" />
                    Contact information (email, phone)
                  </li>
                  <li className="flex items-center gap-2">
                    <Eye className="h-3 w-3 text-primary" />
                    Skills, certifications, and portfolio
                  </li>
                  <li className="flex items-center gap-2">
                    <Eye className="h-3 w-3 text-primary" />
                    Lifetime access to this profile
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-2">
                    <Eye className="h-3 w-3 text-primary" />
                    Full job description and requirements
                  </li>
                  <li className="flex items-center gap-2">
                    <Eye className="h-3 w-3 text-primary" />
                    Company details and culture
                  </li>
                  <li className="flex items-center gap-2">
                    <Eye className="h-3 w-3 text-primary" />
                    Salary range and benefits
                  </li>
                  <li className="flex items-center gap-2">
                    <Eye className="h-3 w-3 text-primary" />
                    Application instructions and contact
                  </li>
                </>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
