"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Application } from "@/types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "../EmptyState";
import { Briefcase } from "lucide-react";

interface ApplicationsTimelineProps {
  applications: Application[];
  loading?: boolean;
}

export function ApplicationsTimeline({
  applications,
  loading,
}: ApplicationsTimelineProps) {
  const getStageColor = (stage: Application["stage"]) => {
    switch (stage) {
      case "Offer":
        return "bg-green-500 hover:bg-green-600";
      case "Interview":
        return "bg-blue-500 hover:bg-blue-600";
      case "Shortlisted":
        return "bg-purple-500 hover:bg-purple-600";
      case "Applied":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "Rejected":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
                <Skeleton className="h-6 w-[80px] rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Briefcase className="h-12 w-12" />}
            title="No applications yet"
            description="Start applying to jobs to track your progress here"
            actionLabel="Find Jobs"
            onAction={() => (window.location.href = "/jobs")}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="pb-3 font-medium">Job Title</th>
                <th className="pb-3 font-medium">Company</th>
                <th className="pb-3 font-medium">Stage</th>
                <th className="pb-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">{app.jobTitle}</td>
                  <td className="py-3 text-muted-foreground">{app.company}</td>
                  <td className="py-3">
                    <Badge className={`${getStageColor(app.stage)} text-white`}>
                      {app.stage}
                    </Badge>
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">
                    {app.updatedAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
