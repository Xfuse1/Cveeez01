"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Job } from "@/types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "../EmptyState";
import { Briefcase, MapPin, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RecommendedJobsListProps {
  jobs: Job[];
  loading?: boolean;
}

export function RecommendedJobsList({
  jobs,
  loading,
}: RecommendedJobsListProps) {
  const { toast } = useToast();

  const handleApply = (job: Job) => {
    toast({
      title: "Application Submitted",
      description: `Your application for ${job.title} at ${job.company} has been submitted.`,
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommended Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-[80px]" />
                    <Skeleton className="h-6 w-[100px]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommended Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Briefcase className="h-12 w-12" />}
            title="No recommendations yet"
            description="Complete your profile to get personalized job recommendations"
            actionLabel="Complete Profile"
            onAction={() => (window.location.href = "/settings")}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recommended Jobs</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <a href="/jobs">View All</a>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{job.title}</h4>
                    {job.matchScore && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {job.matchScore}% match
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {job.company}
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {job.salary}
                    </span>
                    <Badge variant="outline">{job.type}</Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleApply(job)}
                  className="shrink-0"
                >
                  Apply
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
