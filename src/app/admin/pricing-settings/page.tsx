"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Eye, Briefcase, DollarSign } from "lucide-react";
import { checkAdminAccess } from "@/services/admin";
import { getServicePrice, setServicePrice, getEffectivePrice } from "@/services/pricing";
import Link from "next/link";

export default function PricingSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Pricing state
  const [viewSeekerProfilePrice, setViewSeekerProfilePrice] = useState("10");
  const [viewJobDetailsPrice, setViewJobDetailsPrice] = useState("5");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    initializePage();
  }, [user, router]);

  const initializePage = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Check admin access
      const adminCheck = await checkAdminAccess(user.uid, user.email);
      if (!adminCheck.isAdmin) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        router.push("/");
        return;
      }
      setIsAdmin(true);

      // Load current pricing
      const [profilePrice, jobPrice] = await Promise.all([
        getEffectivePrice('view-seeker-profile'),
        getEffectivePrice('view-job-details'),
      ]);

      setViewSeekerProfilePrice(profilePrice.price.toString());
      setViewJobDetailsPrice(jobPrice.price.toString());
    } catch (error) {
      console.error("Error loading pricing:", error);
      toast({
        title: "Error",
        description: "Failed to load pricing settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePricing = async () => {
    setSaving(true);
    try {
      const profilePrice = parseFloat(viewSeekerProfilePrice);
      const jobPrice = parseFloat(viewJobDetailsPrice);

      if (isNaN(profilePrice) || profilePrice < 0) {
        toast({
          title: "Invalid Price",
          description: "View seeker profile price must be a valid number",
          variant: "destructive",
        });
        return;
      }

      if (isNaN(jobPrice) || jobPrice < 0) {
        toast({
          title: "Invalid Price",
          description: "View job details price must be a valid number",
          variant: "destructive",
        });
        return;
      }

      // Update both prices
      const [profileSuccess, jobSuccess] = await Promise.all([
        setServicePrice('view-seeker-profile', profilePrice, {
          serviceName: 'View Seeker Profile',
          description: 'Employer can view full seeker profile details',
          currency: 'EGP',
          isActive: true,
        }),
        setServicePrice('view-job-details', jobPrice, {
          serviceName: 'View Job Details',
          description: 'Seeker can view full job posting details',
          currency: 'EGP',
          isActive: true,
        }),
      ]);

      if (profileSuccess && jobSuccess) {
        toast({
          title: "Pricing Updated",
          description: "View pricing has been successfully updated.",
        });
      } else {
        throw new Error("Failed to update pricing");
      }
    } catch (error) {
      console.error("Error saving pricing:", error);
      toast({
        title: "Error",
        description: "Failed to save pricing settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">View Pricing Settings</h1>
          <p className="text-muted-foreground">
            Manage pricing for viewing seeker profiles and job details
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* View Seeker Profile Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                View Seeker Profile
              </CardTitle>
              <CardDescription>
                Price for employers to view full seeker profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="viewSeekerPrice">Price (EGP)</Label>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <Input
                    id="viewSeekerPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={viewSeekerProfilePrice}
                    onChange={(e) => setViewSeekerProfilePrice(e.target.value)}
                    placeholder="10.00"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Employers will be charged this amount to view each seeker's full profile
                </p>
              </div>
            </CardContent>
          </Card>

          {/* View Job Details Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                View Job Details
              </CardTitle>
              <CardDescription>
                Price for seekers to view full job posting details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="viewJobPrice">Price (EGP)</Label>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <Input
                    id="viewJobPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={viewJobDetailsPrice}
                    onChange={(e) => setViewJobDetailsPrice(e.target.value)}
                    placeholder="5.00"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Job seekers will be charged this amount to view each job's full details
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <Button 
                onClick={handleSavePricing} 
                disabled={saving}
                className="w-full md:w-auto"
                size="lg"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Pricing Settings"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <Card className="mt-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 dark:text-blue-400">
                <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="flex-1 text-sm text-blue-600 dark:text-blue-400">
                <p className="font-medium mb-1">How View Pricing Works</p>
                <ul className="list-disc list-inside space-y-1 text-blue-600/90 dark:text-blue-400/90">
                  <li>Employers must pay to view complete seeker profiles (resume, contact info, etc.)</li>
                  <li>Job seekers must pay to view full job details (company info, requirements, etc.)</li>
                  <li>Users are charged only once per profile/job they view</li>
                  <li>Payment is deducted from user's wallet balance</li>
                  <li>Users with insufficient balance will be prompted to top up</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
