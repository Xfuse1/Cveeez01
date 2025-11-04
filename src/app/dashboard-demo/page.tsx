"use client";

import { useState, useEffect } from "react";
import { UserRole, SeekerKPIs, EmployerKPIs } from "@/types/dashboard";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { KPICard } from "@/components/dashboard/KPICard";
import { Button } from "@/components/ui/button";
import {
  User,
  FileText,
  Briefcase,
  Bookmark,
  Wallet,
  Package,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  PlusCircle,
} from "lucide-react";
import {
  fetchSeekerKPIs,
  fetchEmployerKPIs,
  fetchApplications,
  fetchRecommendedJobs,
  fetchCandidates,
  mockCVData,
  mockOrders,
  mockMessages,
  mockJobPerformance,
  mockBillingInfo,
  mockInvoices,
  mockTeamActivity,
} from "@/lib/mock-data";
import { AIBuilderCard } from "@/components/dashboard/seeker/AIBuilderCard";
import { ApplicationsTimeline } from "@/components/dashboard/seeker/ApplicationsTimeline";
import { RecommendedJobsList } from "@/components/dashboard/seeker/RecommendedJobsList";
import { JobPerformanceChart } from "@/components/dashboard/employer/JobPerformanceChart";
import { CandidatePipeline } from "@/components/dashboard/employer/CandidatePipeline";
import { BillingCard } from "@/components/dashboard/employer/BillingCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function UnifiedDashboardPage() {
  const [role, setRole] = useState<UserRole>("seeker");
  const [seekerKPIs, setSeekerKPIs] = useState<SeekerKPIs | null>(null);
  const [employerKPIs, setEmployerKPIs] = useState<EmployerKPIs | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, [role]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (role === "seeker") {
        const [kpis, apps, jobs] = await Promise.all([
          fetchSeekerKPIs(),
          fetchApplications(),
          fetchRecommendedJobs(),
        ]);
        setSeekerKPIs(kpis);
        setApplications(apps);
        setRecommendedJobs(jobs);
      } else {
        const [kpis, cands] = await Promise.all([
          fetchEmployerKPIs(),
          fetchCandidates(),
        ]);
        setEmployerKPIs(kpis);
        setCandidates(cands);
      }
    } catch (error) {
      toast({
        title: "Error loading dashboard",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = () => {
    setRole((prev) => (prev === "seeker" ? "employer" : "seeker"));
  };

  const handleQuickAction = (action: string) => {
    toast({
      title: action,
      description: `${action} feature will be available soon.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav role={role} onRoleToggle={toggleRole} />

      <main className="container mx-auto px-4 py-8">
        {role === "seeker" ? (
          <SeekerDashboard
            kpis={seekerKPIs}
            loading={loading}
            applications={applications}
            recommendedJobs={recommendedJobs}
            onQuickAction={handleQuickAction}
          />
        ) : (
          <EmployerDashboard
            kpis={employerKPIs}
            loading={loading}
            candidates={candidates}
            onQuickAction={handleQuickAction}
          />
        )}
      </main>
    </div>
  );
}

function SeekerDashboard({
  kpis,
  loading,
  applications,
  recommendedJobs,
  onQuickAction,
}: any) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-muted-foreground">
          Here's what's happening with your job search
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Profile Complete"
          value={kpis ? `${kpis.profileCompleteness}%` : "0%"}
          icon={User}
          loading={loading}
        />
        <KPICard
          title="CV Versions"
          value={kpis?.cvVersions || 0}
          icon={FileText}
          loading={loading}
        />
        <KPICard
          title="Active Applications"
          value={kpis?.activeApplications || 0}
          icon={Briefcase}
          loading={loading}
        />
        <KPICard
          title="Saved Jobs"
          value={kpis?.savedJobs || 0}
          icon={Bookmark}
          loading={loading}
        />
        <KPICard
          title="Wallet Balance"
          value={kpis ? `$${kpis.walletBalance}` : "$0"}
          icon={Wallet}
          loading={loading}
        />
        <KPICard
          title="Last Order"
          value={kpis?.lastOrderStatus || "N/A"}
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
            <Button onClick={() => onQuickAction("Build CV with AI")}>
              <Sparkles className="h-4 w-4 mr-2" />
              Build CV with AI
            </Button>
            <Button
              variant="outline"
              onClick={() => onQuickAction("Export PDF")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => onQuickAction("Find Jobs")}
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Find Jobs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Builder and Applications Grid */}
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
              <Button variant="outline" className="w-full" size="sm">
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

      {/* Messages Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Inbox</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <a href="/messages">View All</a>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockMessages.slice(0, 3).map((msg) => (
              <div
                key={msg.id}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent cursor-pointer"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    msg.unread ? "bg-blue-500" : "bg-gray-300"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm truncate">{msg.from}</p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate">{msg.subject}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {msg.preview}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmployerDashboard({
  kpis,
  loading,
  candidates,
  onQuickAction,
}: any) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Employer Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your jobs and candidates effectively
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Open Jobs"
          value={kpis?.openJobs || 0}
          icon={Briefcase}
          loading={loading}
        />
        <KPICard
          title="Applicants Today"
          value={kpis?.applicantsToday || 0}
          icon={Users}
          loading={loading}
        />
        <KPICard
          title="Shortlisted"
          value={kpis?.shortlisted || 0}
          icon={CheckCircle2}
          loading={loading}
        />
        <KPICard
          title="Interviews This Week"
          value={kpis?.interviewsThisWeek || 0}
          icon={Calendar}
          loading={loading}
        />
        <KPICard
          title="Plan Usage"
          value={kpis ? `${kpis.planUsage}%` : "0%"}
          icon={TrendingUp}
          loading={loading}
        />
        <KPICard
          title="KYC Status"
          value={kpis?.kycStatus || "Pending"}
          icon={kpis?.kycStatus === "verified" ? CheckCircle2 : AlertCircle}
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
            <Button onClick={() => onQuickAction("Post Job")}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Post Job
            </Button>
            <Button
              variant="outline"
              onClick={() => onQuickAction("Invite Candidates")}
            >
              <Send className="h-4 w-4 mr-2" />
              Invite Candidates
            </Button>
            <Button
              variant="outline"
              onClick={() => onQuickAction("Upgrade Plan")}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Job Performance */}
      <JobPerformanceChart data={mockJobPerformance} loading={loading} />

      {/* Candidate Pipeline */}
      <CandidatePipeline candidates={candidates} loading={loading} />

      {/* Billing and Team Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BillingCard billingInfo={mockBillingInfo} invoices={mockInvoices} />
        <Card>
          <CardHeader>
            <CardTitle>Team Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockTeamActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 border rounded-lg"
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
