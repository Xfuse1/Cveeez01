
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
} from "lucide-react";
import {
  fetchRealAdminKPIs,
  fetchRealJobPerformance,
  fetchRealCandidates,
  fetchRealTeamActivity,
} from "@/services/admin-data";
import { getWalletBalance, getTransactionHistory, getAllTransactions } from "@/services/wallet";
import type { WalletBalance, Transaction, TransactionStatus } from "@/types/wallet";
import { JobPerformanceChart } from "@/components/dashboard/employer/JobPerformanceChart";
import { CandidatePipeline } from "@/components/dashboard/employer/CandidatePipeline";
import { BillingCard } from "@/components/dashboard/employer/BillingCard";
import { DashboardTranslator } from "@/components/dashboard/DashboardTranslator";
import { FloatingTranslator } from "@/components/translator/FloatingTranslator";
import { AddFundsDialog } from "@/components/wallet/AddFundsDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [employerKPIs, setEmployerKPIs] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobPerformance, setJobPerformance] = useState<any[]>([]);
  const [teamActivity, setTeamActivity] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionFilter, setTransactionFilter] = useState<'all' | TransactionStatus>('all');
  const [loading, setLoading] = useState(true);
  
  // Company name - you can change this to your actual company name
  const companyName = "Your Company";

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
      const [kpis, cands, jobs, activity, wallet, allTransactions] = await Promise.all([
        fetchRealAdminKPIs(),
        fetchRealCandidates(),
        fetchRealJobPerformance(),
        fetchRealTeamActivity(),
        getWalletBalance(user!.uid),
        getAllTransactions('all', 100), // Get all transactions from all users
      ]);
      setEmployerKPIs(kpis);
      setCandidates(cands);
      setJobPerformance(jobs);
      setTeamActivity(activity);
      setWalletBalance(wallet);
      setTransactions(allTransactions);
    } catch (error) {
      console.error("Dashboard error:", error);
      // Handle Firebase quota exceeded specially
      if (error instanceof Error && error.message === 'FIREBASE_QUOTA_EXCEEDED') {
        toast({
          title: 'Firebase quota exceeded',
          description: 'Your Firebase project has exceeded a usage quota. Consider upgrading your plan or reducing query frequency. Check the Firebase console for details.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: "Error loading dashboard",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (filter: 'all' | TransactionStatus) => {
    setTransactionFilter(filter);
    setLoading(true);
    try {
      const filteredTransactions = await getAllTransactions(filter, 100);
      setTransactions(filteredTransactions);
    } catch (error) {
      console.error("Error filtering transactions:", error);
      if (error instanceof Error && error.message === 'FIREBASE_QUOTA_EXCEEDED') {
        toast({
          title: 'Firebase quota exceeded',
          description: 'Unable to load transactions because Firebase quota was exceeded. Please check the Firebase console or try again later.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to filter transactions.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    if (action === "Post Job") {
      router.push("/jobs");
    } else if (action === "Invite Candidates") {
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

  // Loading state while data is being fetched
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
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Full system access and management
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
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Open Jobs
                  </CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <Loader className="h-6 w-6 animate-spin" />
                  ) : (
                    employerKPIs?.openJobs || 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  Active job postings
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Applicants
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <Loader className="h-6 w-6 animate-spin" />
                  ) : (
                    employerKPIs?.applicantsToday || 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  New applications today
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Interviews
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <Loader className="h-6 w-6 animate-spin" />
                  ) : (
                    employerKPIs?.interviewsThisWeek || 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Scheduled this week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => handleQuickAction("Post Job")}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Post New Job
                </Button>
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
                  onClick={() => router.push("/employer/jobs")}
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
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="sm"
                    onClick={() => router.push("/jobs")}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Post New Job
                  </Button>
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
                  {candidates.slice(0, 3).map((candidate) => (
                    <div
                      key={candidate.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => router.push(`/jobs`)}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{candidate.name}</p>
                        <p className="text-xs text-muted-foreground">{candidate.position}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold">{candidate.matchScore}% Match</p>
                        <p className="text-xs text-muted-foreground capitalize">{candidate.stage}</p>
                      </div>
                    </div>
                  ))}
                  {candidates.length === 0 && !loading && (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      No shortlisted candidates yet
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="sm"
                    onClick={() => router.push("/jobs")}
                  >
                    View All Candidates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Job Performance Chart */}
          <JobPerformanceChart data={jobPerformance} loading={loading} />

          
          {/* Wallet & Company Settings Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Wallet Transactions Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  All Site Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Filter Buttons */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  <Button
                    variant={transactionFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('all')}
                  >
                    All Transactions
                  </Button>
                  <Button
                    variant={transactionFilter === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('completed')}
                  >
                    Completed
                  </Button>
                  <Button
                    variant={transactionFilter === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('pending')}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={transactionFilter === 'failed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('failed')}
                  >
                    Failed
                  </Button>
                </div>

                {/* Transaction Statistics */}
                <div className="mb-4 grid grid-cols-3 gap-2">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-xs text-muted-foreground">Completed</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {transactions.filter(t => t.status === 'completed').length}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-xs text-muted-foreground">Pending</p>
                    <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                      {transactions.filter(t => t.status === 'pending').length}
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-xs text-muted-foreground">Failed</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">
                      {transactions.filter(t => t.status === 'failed').length}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            transaction.status === 'completed' 
                              ? transaction.type === 'deposit' 
                                ? 'bg-green-100 dark:bg-green-900' 
                                : 'bg-red-100 dark:bg-red-900'
                              : transaction.status === 'pending'
                              ? 'bg-yellow-100 dark:bg-yellow-900'
                              : 'bg-gray-100 dark:bg-gray-900'
                          }`}>
                            {transaction.type === 'deposit' ? (
                              <ArrowDownRight className={`h-5 w-5 ${
                                transaction.status === 'completed' 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-yellow-600 dark:text-yellow-400'
                              }`} />
                            ) : (
                              <ArrowUpRight className={`h-5 w-5 ${
                                transaction.status === 'completed' 
                                  ? 'text-red-600 dark:text-red-400' 
                                  : 'text-yellow-600 dark:text-yellow-400'
                              }`} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-sm">
                                {transaction.type === 'deposit' ? 'Deposit' : 'Payment'}
                              </p>
                              <Badge variant={
                                transaction.status === 'completed' ? 'default' :
                                transaction.status === 'pending' ? 'secondary' : 'destructive'
                              }>
                                {transaction.status}
                              </Badge>
                              {transaction.userId && (
                                <Badge variant="outline" className="text-xs">
                                  User: {transaction.userId.slice(0, 8)}...
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {transaction.description}
                            </p>
                            {transaction.paymentMethod && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Method: {transaction.paymentMethod}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(transaction.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className={`text-sm font-semibold ${
                            transaction.type === 'deposit' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount.toFixed(2)} {transaction.currency}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      <Wallet className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No {transactionFilter !== 'all' ? transactionFilter : ''} transactions found</p>
                      <p className="text-xs mt-1">Transactions will appear here as users make payments</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Company Settings Card */}
            <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Admin Settings
                  </CardTitle>
                </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => router.push("/settings")}
                  >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Admin Profile</p>
                            <p className="text-xs text-muted-foreground">Update admin details</p>
                          </div>
                        </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => router.push("/admin/manage-admins")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Team Members</p>
                        <p className="text-xs text-muted-foreground">Manage your team</p>
                      </div>
                    </div>
                  </div>

                  

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${employerKPIs?.kycStatus === 'verified' ? 'bg-green-100 dark:bg-green-900' : 'bg-yellow-100 dark:bg-yellow-900'} flex items-center justify-center`}>
                        {employerKPIs?.kycStatus === 'verified' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">KYC Status</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {employerKPIs?.kycStatus || "Pending"}
                        </p>
                      </div>
                    </div>
                    {employerKPIs?.kycStatus !== 'verified' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push("/settings")}
                      >
                        Verify Now
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors border-primary/50 bg-primary/5"
                    onClick={() => router.push("/admin/manage-admins")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Settings className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Manage Admins</p>
                        <p className="text-xs text-muted-foreground">Add or remove admin users</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors border-green-500/50 bg-green-500/5"
                    onClick={() => router.push("/admin/pricing")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="1" x2="12" y2="23"/>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Pricing Management</p>
                        <p className="text-xs text-muted-foreground">Manage service prices & offers</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors border-blue-500/50 bg-blue-500/5"
                    onClick={() => router.push("/admin/manage-services")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Manage Services</p>
                        <p className="text-xs text-muted-foreground">Add, edit, or remove services</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Team Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamActivity.length > 0 ? (
                  teamActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user}</span>{" "}
                          {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No team activity yet</p>
                    <p className="text-xs mt-1">Activity will appear here as your team uses the platform</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Floating Translator */}
      <FloatingTranslator />
    </div>
  );
}
