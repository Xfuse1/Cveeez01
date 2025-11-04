"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-provider";
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
} from "lucide-react";
import {
  fetchEmployerKPIs,
  fetchCandidates,
  mockJobPerformance,
  mockBillingInfo,
  mockInvoices,
  mockTeamActivity,
} from "@/lib/mock-data";
import { JobPerformanceChart } from "@/components/dashboard/employer/JobPerformanceChart";
import { CandidatePipeline } from "@/components/dashboard/employer/CandidatePipeline";
import { BillingCard } from "@/components/dashboard/employer/BillingCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [employerKPIs, setEmployerKPIs] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
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
      const [kpis, cands] = await Promise.all([
        fetchEmployerKPIs(),
        fetchCandidates(),
      ]);
      setEmployerKPIs(kpis);
      setCandidates(cands);
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

  const handleQuickAction = (action: string) => {
    if (action === "Post Job") {
      router.push("/employer/jobs");
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
              value={employerKPIs?.openJobs || 0}
              icon={Briefcase}
              loading={loading}
            />
            <KPICard
              title="Applicants Today"
              value={employerKPIs?.applicantsToday || 0}
              icon={Users}
              loading={loading}
            />
            <KPICard
              title="Shortlisted"
              value={employerKPIs?.shortlisted || 0}
              icon={CheckCircle2}
              loading={loading}
            />
            <KPICard
              title="Interviews This Week"
              value={employerKPIs?.interviewsThisWeek || 0}
              icon={Calendar}
              loading={loading}
            />
            <KPICard
              title="Plan Usage"
              value={employerKPIs ? `${employerKPIs.planUsage}%` : "0%"}
              icon={TrendingUp}
              loading={loading}
            />
            <KPICard
              title="KYC Status"
              value={employerKPIs?.kycStatus || "Pending"}
              icon={employerKPIs?.kycStatus === "verified" ? CheckCircle2 : AlertCircle}
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
                <Button onClick={() => handleQuickAction("Post Job")}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Post Job
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
                  onClick={() => handleQuickAction("Upgrade Plan")}
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
      </main>
    </div>
  );
}
