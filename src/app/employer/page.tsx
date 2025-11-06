"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { useLanguage } from "@/contexts/language-provider";
import { togglePageTranslation } from '@/services/pageTranslator';
import { KPICard } from "@/components/dashboard/KPICard";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Users,
  CheckCircle2,
  Calendar,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  Send,
  ArrowLeft,
  Wallet,
  Settings,
  Eye,
  UserCheck,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Loader,
  Lock,
  Bell,
  Shield,
} from "lucide-react";
import {
  fetchRealAdminKPIs,
  fetchRealJobPerformance,
  fetchRealCandidates,
  fetchEmployerShortlistedCandidates,
  fetchRealTeamActivity,
} from "@/services/admin-data";
import { getWalletBalance, getTransactionHistory } from "@/services/wallet";
import type { WalletBalance, Transaction } from "@/types/wallet";
import { JobPerformanceChart } from "@/components/dashboard/employer/JobPerformanceChart";
import { DashboardTranslator } from "@/components/dashboard/DashboardTranslator";
import { FloatingTranslator } from "@/components/translator/FloatingTranslator";
import { AddFundsDialog } from "@/components/wallet/AddFundsDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { PostJobDialog } from "@/components/jobs/PostJobDialog";
import { seedSampleApplications, getFirstEmployerJob } from "@/services/seed-applications";

export default function EmployerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [employerKPIs, setEmployerKPIs] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobPerformance, setJobPerformance] = useState<any[]>([]);
  const [teamActivity, setTeamActivity] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto-align page translation with selected language
  useEffect(() => {
    (async () => {
      try {
        const currentState = (window as any).__pageTranslationState || null;
        if (language === 'ar') {
          if (currentState !== 'ar') {
            await togglePageTranslation('ar');
          }
        } else {
          if (currentState) {
            await togglePageTranslation();
          }
        }
      } catch (err) {
        console.error('Auto translate dashboard error:', err);
      }
    })();
  }, [language]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [kpis, cands, jobs, activity, wallet, transactions] = await Promise.all([
        fetchRealAdminKPIs(),
        fetchEmployerShortlistedCandidates(user!.uid), // Fetch employer-specific shortlisted candidates
        fetchRealJobPerformance(),
        fetchRealTeamActivity(),
        getWalletBalance(user!.uid),
        getTransactionHistory(user!.uid, 10),
      ]);
      setEmployerKPIs(kpis);
      setCandidates(cands);
      setJobPerformance(jobs);
      setTeamActivity(activity);
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
  
  const onJobPosted = () => {
    // Reload job-related data after a new job is posted
    loadDashboardData();
  };

  const handleQuickAction = (action: string) => {
    if (action === "Invite Candidates") {
      router.push("/jobs");
    } else if (action === "View Applications") {
      router.push("/jobs");
    } else {
      toast({
        title: action,
        description: `${action} feature will be available soon.`,
      });
    }
  };

  // Debug function to seed sample applications (remove in production)
  const handleSeedApplications = async () => {
    if (!user) return;
    
    try {
      const job = await getFirstEmployerJob(user.uid);
      if (!job) {
        toast({
          title: "No Job Found",
          description: "Please create a job first before adding sample applications.",
          variant: "destructive",
        });
        return;
      }

      const result = await seedSampleApplications(user.uid, job.id, job.title);
      
      if (result.success) {
        toast({
          title: "Sample Data Added!",
          description: `${result.count} sample applications have been created.`,
        });
        // Reload dashboard data
        loadDashboardData();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to seed applications",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error seeding applications:", error);
      toast({
        title: "Error",
        description: "Failed to add sample applications",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Employer Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your job postings and candidates
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
              title="Open Jobs"
              value={employerKPIs?.openJobs || 0}
              icon={Briefcase}
              loading={loading}
            />
            <KPICard
              title="Total Applicants"
              value={employerKPIs?.applicantsToday || 0}
              icon={Users}
              loading={loading}
            />
            <KPICard
              title="Wallet Balance"
              value={walletBalance ? `${walletBalance.currency} ${walletBalance.balance.toFixed(2)}` : "EGP 0.00"}
              icon={Wallet}
              loading={loading}
            />
            <KPICard
              title="Interviews This Week"
              value={employerKPIs?.interviewsThisWeek || 0}
              icon={Calendar}
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
                 <PostJobDialog onJobPosted={onJobPosted} />
                <Button
                  variant="outline"
                  onClick={() => handleQuickAction("Invite Candidates")}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Invite Candidates
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleQuickAction("View Applications")}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Applications
                </Button>
                {/* Debug: Seed Sample Applications - Remove in production */}
                <Button
                  variant="outline"
                  onClick={handleSeedApplications}
                  className="border-dashed"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Add Sample Applications
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Job Management Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Job Management
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Create, edit, and manage your job postings
                </p>
              </div>
              <PostJobDialog onJobPosted={onJobPosted} />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Jobs Card */}
                <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                  <div className="flex items-center justify-between mb-2">
                    <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <Badge variant="secondary" className="bg-blue-200 dark:bg-blue-800">
                      Total
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {employerKPIs?.openJobs || 0}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Active Job Posts
                  </p>
                </div>

                {/* View All Jobs Card */}
                <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                  <div className="flex items-center justify-between mb-2">
                    <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <Badge variant="secondary" className="bg-green-200 dark:bg-green-800">
                      Manage
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 bg-white dark:bg-gray-800"
                    onClick={() => router.push("/employer/jobs")}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View All Jobs
                  </Button>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    Edit & manage posts
                  </p>
                </div>

                {/* Applications Card */}
                <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <Badge variant="secondary" className="bg-purple-200 dark:bg-purple-800">
                      New
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {employerKPIs?.applicantsToday || 0}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    New Applications
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Performance and Recent Jobs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Jobs Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Active Job Posts
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push("/jobs")}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {jobPerformance.slice(0, 3).map((job) => (
                    <div
                      key={job.jobId}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => router.push(`/jobs`)}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{job.jobTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          {job.views} views • {job.applies} applicants
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-primary">{job.applies} Applied</p>
                        <p className="text-xs text-muted-foreground">Active</p>
                      </div>
                    </div>
                  ))}
                  {jobPerformance.length === 0 && !loading && (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      No active jobs yet. Post your first job to get started!
                    </div>
                  )}
                  <PostJobDialog onJobPosted={onJobPosted} isSubtle />
                </div>
              </CardContent>
            </Card>

            {/* Shortlisted Candidates Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  Shortlisted Candidates
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push("/jobs")}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : candidates.length > 0 ? (
                    <>
                      {candidates.slice(0, 3).map((candidate) => (
                        <div
                          key={candidate.id}
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                          onClick={() => router.push(`/candidate/${candidate.id}`)}
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{candidate.name}</p>
                            <p className="text-xs text-muted-foreground">{candidate.position}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold text-primary">{candidate.matchScore}% Match</p>
                            <p className="text-xs text-muted-foreground capitalize">{candidate.stage}</p>
                          </div>
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        size="sm"
                        onClick={() => router.push("/jobs")}
                      >
                        View All Candidates
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-2">No shortlisted candidates yet</p>
                      <p className="text-xs text-muted-foreground mb-4">
                        When applicants apply to your jobs, you can shortlist them here
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push("/jobs")}
                      >
                        View All Candidates
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Job Performance Chart */}
          <JobPerformanceChart data={jobPerformance} loading={loading} />

          {/* Settings and Wallet Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Wallet Section */}
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
                    {walletBalance ? `${walletBalance.currency} ${walletBalance.balance.toFixed(2)}` : "EGP 0.00"}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Recent Transactions</h4>
                  {recentTransactions.length > 0 ? (
                    <div className="space-y-2">
                      {recentTransactions
                        .filter(tx => tx.status === 'completed')
                        .slice(0, 3)
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

            {/* Settings Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => router.push("/settings")}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Company Profile</p>
                      <p className="text-xs text-muted-foreground">Update company details</p>
                    </div>
                  </div>
                </div>

                <div 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => router.push("/settings?tab=security")}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Security</p>
                      <p className="text-xs text-muted-foreground">Password and account security</p>
                    </div>
                  </div>
                </div>

                <div 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => router.push("/settings?tab=notifications")}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Notifications</p>
                      <p className="text-xs text-muted-foreground">Manage notification preferences</p>
                    </div>
                  </div>
                </div>

                <div 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => router.push("/settings?tab=privacy")}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Privacy</p>
                      <p className="text-xs text-muted-foreground">Privacy and data settings</p>
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
