"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { initializeAllJobViews, getJobViewsStats } from "@/scripts/initialize-job-views";
import { useAuth } from "@/contexts/auth-provider";
import { useRouter } from "next/navigation";

export default function TestJobViewsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [migrationResult, setMigrationResult] = useState<any>(null);

  // Load current stats
  const loadStats = async () => {
    setLoading(true);
    try {
      const result = await getJobViewsStats();
      setStats(result);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Run migration
  const runMigration = async () => {
    if (!confirm("This will initialize the 'views' field for all jobs that don't have it. Continue?")) {
      return;
    }

    setLoading(true);
    setMigrationResult(null);
    try {
      const result = await initializeAllJobViews();
      setMigrationResult(result);
      // Reload stats after migration
      await loadStats();
    } catch (error) {
      console.error("Error running migration:", error);
      setMigrationResult({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Job Views Testing & Migration</h1>
          <p className="text-muted-foreground">
            Initialize and test the job view tracking system
          </p>
        </div>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Statistics</CardTitle>
            <CardDescription>View the current state of job views in your database</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={loadStats} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Stats
                </>
              )}
            </Button>

            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="border rounded-lg p-4">
                  <div className="text-2xl font-bold">{stats.totalJobs}</div>
                  <div className="text-sm text-muted-foreground">Total Jobs</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{stats.jobsWithViews}</div>
                  <div className="text-sm text-muted-foreground">With Views</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-600">{stats.jobsWithoutViews}</div>
                  <div className="text-sm text-muted-foreground">Without Views</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalViews}</div>
                  <div className="text-sm text-muted-foreground">Total Views</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Migration Card */}
        <Card>
          <CardHeader>
            <CardTitle>Initialize Job Views</CardTitle>
            <CardDescription>
              Add the 'views' field (set to 0) for all jobs that don't have it yet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2">What this does:</h4>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Scans all jobs in your database</li>
                <li>Adds <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">views: 0</code> to jobs without the field</li>
                <li>Skips jobs that already have the field</li>
                <li>Safe to run multiple times</li>
              </ul>
            </div>

            <Button 
              onClick={runMigration} 
              disabled={loading}
              variant="default"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Migration...
                </>
              ) : (
                "Run Migration"
              )}
            </Button>

            {migrationResult && (
              <div className={`border rounded-lg p-4 ${
                migrationResult.success 
                  ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800" 
                  : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {migrationResult.success ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-green-900 dark:text-green-100">
                        Migration Completed!
                      </h4>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      <h4 className="font-semibold text-red-900 dark:text-red-100">
                        Migration Failed
                      </h4>
                    </>
                  )}
                </div>
                <div className="space-y-1 text-sm">
                  <div>✓ Updated: <strong>{migrationResult.updated}</strong> jobs</div>
                  <div>- Skipped: <strong>{migrationResult.skipped}</strong> jobs (already initialized)</div>
                  {migrationResult.errors > 0 && (
                    <div className="text-red-600">✗ Errors: <strong>{migrationResult.errors}</strong> jobs</div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Testing Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
            <CardDescription>Follow these steps to verify the tracking system</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center shrink-0">1</Badge>
                <div>
                  <strong>Run the migration above</strong> to initialize views for existing jobs
                </div>
              </li>
              <li className="flex gap-3">
                <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center shrink-0">2</Badge>
                <div>
                  <strong>Go to the Jobs page</strong> (/jobs) and click "View Details" on a job
                </div>
              </li>
              <li className="flex gap-3">
                <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center shrink-0">3</Badge>
                <div>
                  <strong>Refresh stats above</strong> - you should see "Total Views" increase
                </div>
              </li>
              <li className="flex gap-3">
                <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center shrink-0">4</Badge>
                <div>
                  <strong>Check Employer Dashboard</strong> - the "Job Performance" chart should show view counts
                </div>
              </li>
              <li className="flex gap-3">
                <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center shrink-0">5</Badge>
                <div>
                  <strong>Apply to a job</strong> - conversion percentage should calculate correctly
                </div>
              </li>
            </ol>

            <div className="mt-6 flex gap-2">
              <Button variant="outline" onClick={() => router.push('/jobs')}>
                Go to Jobs Page
              </Button>
              <Button variant="outline" onClick={() => router.push('/employer')}>
                Go to Employer Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
