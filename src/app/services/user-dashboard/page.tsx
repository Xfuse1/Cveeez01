"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { KPICard } from "@/components/dashboard/KPICard";
import { Button } from "@/components/ui/button";
import {
  User,
  FileText,
  Briefcase,
  Bookmark,
  Wallet,
  Package,
  Sparkles,
  Settings,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft,
} from "lucide-react";
import {
  fetchSeekerKPIs,
  fetchApplications,
  mockCVData,
  mockOrders,
} from "@/lib/mock-data";
import { getJobs } from "@/services/firestore";
import { getWalletBalance, getTransactionHistory } from "@/services/wallet";
import type { Job as FirestoreJob } from "@/types/jobs";
import type { Job as DashboardJob } from "@/types/dashboard";
import type { WalletBalance, Transaction } from "@/types/wallet";
import { AIBuilderCard } from "@/components/dashboard/seeker/AIBuilderCard";
import { ApplicationsTimeline } from "@/components/dashboard/seeker/ApplicationsTimeline";
import { RecommendedJobsList } from "@/components/dashboard/seeker/RecommendedJobsList";
import { DashboardTranslator } from "@/components/dashboard/DashboardTranslator";
import { FloatingTranslator } from "@/components/translator/FloatingTranslator";
import { AddFundsDialog } from "@/components/wallet/AddFundsDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function UserDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [seekerKPIs, setSeekerKPIs] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadDashboardData();
  }, [user, router]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [kpis, apps, firestoreJobs, wallet, transactions] = await Promise.all([
        fetchSeekerKPIs(),
        fetchApplications(),
        getJobs({}), // Fetch real jobs from Firestore
        getWalletBalance(user!.uid), // Fetch real wallet balance
        getTransactionHistory(user!.uid, 10), // Fetch last 10 transactions (to ensure we get at least 3 completed)
      ]);
      
      // Map Firestore jobs to dashboard job format
      const dashboardJobs: DashboardJob[] = firestoreJobs.slice(0, 5).map((job: FirestoreJob) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salaryRange,
        type: job.type,
        matchScore: Math.floor(Math.random() * 20) + 80, // Random match score between 80-99
      }));
      
      setSeekerKPIs(kpis);
      setApplications(apps);
      setRecommendedJobs(dashboardJobs);
      setWalletBalance(wallet);
      setRecentTransactions(transactions);
    } catch (error) {
      console.error("Dashboard error:", error);
      toast({
        title: "Error loading dashboard",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    if (action === "Build CV with AI") {
      router.push("/services/ai-cv-builder");
    } else if (action === "Find Jobs") {
      router.push("/jobs");
    } else {
      toast({
        title: action,
        description: `${action} feature will be available soon.`,
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user.displayName || "User"}!</h1>
              <p className="text-muted-foreground">
                Here's what's happening with your job search
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DashboardTranslator />
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Profile Complete"
              value={seekerKPIs ? `${seekerKPIs.profileCompleteness}%` : "0%"}
              icon={User}
              loading={loading}
            />
            <KPICard
              title="CV Versions"
              value={seekerKPIs?.cvVersions || 0}
              icon={FileText}
              loading={loading}
            />
            <KPICard
              title="Wallet Balance"
              value={walletBalance ? `${walletBalance.currency} ${walletBalance.balance.toFixed(2)}` : "$0.00"}
              icon={Wallet}
              loading={loading}
            />
            <KPICard
              title="Last Order"
              value={seekerKPIs?.lastOrderStatus || "N/A"}
              icon={Package}
              loading={loading}
            />
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => handleQuickAction("Build CV with AI")}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Build CV with AI
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleQuickAction("Export PDF")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleQuickAction("Find Jobs")}
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Find Jobs
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Builder and Recent Orders Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIBuilderCard cvData={mockCVData} />
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockOrders.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{order.service}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.date.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">${order.amount}</p>
                        <p className="text-xs capitalize">{order.status}</p>
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="sm"
                    onClick={() => router.push("/orders")}
                  >
                    View All Orders
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Applications Timeline */}
          <ApplicationsTimeline applications={applications} loading={loading} />

          {/* Recommended Jobs */}
          <RecommendedJobsList jobs={recommendedJobs} loading={loading} />

          {/* Wallet & Account Settings Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Wallet Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Wallet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                  <p className="text-3xl font-bold">
                    {walletBalance ? `${walletBalance.currency} ${walletBalance.balance.toFixed(2)}` : "$0.00"}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Recent Transactions</h4>
                  {recentTransactions.length > 0 ? (
                    <div className="space-y-2">
                      {recentTransactions
                        .filter(tx => tx.status === 'completed') // Only show completed transactions
                        .slice(0, 3) // Show max 3
                        .map((transaction) => {
                        const isPositive = transaction.type === 'deposit' || transaction.type === 'refund' || transaction.type === 'bonus' || transaction.type === 'cashback';
                        return (
                          <div key={transaction.id} className="flex items-center justify-between p-2 border rounded hover:bg-accent transition-colors">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full ${isPositive ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'} flex items-center justify-center`}>
                                {isPositive ? (
                                  <ArrowDownRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                                ) : (
                                  <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium capitalize">{transaction.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  {transaction.createdAt.toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })}
                                </p>
                              </div>
                            </div>
                            <span className={`text-sm font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {isPositive ? '+' : '-'}{transaction.currency} {transaction.amount.toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                      {recentTransactions.filter(tx => tx.status === 'completed').length === 0 && (
                        <div className="text-center py-4 text-sm text-muted-foreground">
                          No completed transactions yet
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      No transactions yet
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <AddFundsDialog
                    userId={user!.uid}
                    currentBalance={walletBalance?.balance || 0}
                    currency={walletBalance?.currency || 'EGP'}
                    onSuccess={() => loadDashboardData()}
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => router.push("/wallet")}
                  >
                    View History
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Settings Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Account Settings
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push("/settings")}
                >
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => router.push("/settings")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Profile Information</p>
                        <p className="text-xs text-muted-foreground">
                          Update your personal details
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => router.push("/settings?tab=security")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Settings className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Security</p>
                        <p className="text-xs text-muted-foreground">
                          Password and authentication
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => router.push("/settings?tab=notifications")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Notifications</p>
                        <p className="text-xs text-muted-foreground">
                          Manage your preferences
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="text-xs">
                      <p className="font-medium mb-1">Account Status</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-muted-foreground">Active & Verified</span>
                      </div>
                      <p className="mt-2 text-muted-foreground">
                        Member since: {new Date(user.metadata.creationTime || "").toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Floating Translator */}
      <FloatingTranslator />
    </div>
  );
}

