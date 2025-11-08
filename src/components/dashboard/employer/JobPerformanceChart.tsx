"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobPerformance } from "@/types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from "lucide-react";

interface JobPerformanceChartProps {
  data: any[]; // Support both JobPerformance and JobWithStats types
  loading?: boolean;
}

export function JobPerformanceChart({
  data,
  loading,
}: JobPerformanceChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Job Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Return early if no data
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Job Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No job performance data available.</p>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.views || 0));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Job Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data.map((job, idx) => {
            // Support both JobPerformance (jobId, jobTitle) and JobWithStats (id, title)
            const jobId = job.jobId || job.id;
            const jobTitle = job.jobTitle || job.title;
            const conversion = job.conversion || 0;
            
            return (
              <div key={jobId ?? `job-${idx}`} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{jobTitle}</span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Views</span>
                      <span className="font-semibold">{job.views}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${maxValue > 0 ? (job.views / maxValue) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
