"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Candidate } from "@/types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "../EmptyState";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface CandidatePipelineProps {
  candidates: Candidate[];
  loading?: boolean;
}

const stages: Candidate["stage"][] = [
  "New",
  "Screened",
  "Shortlist",
  "Interview",
  "Offer",
];

export function CandidatePipeline({
  candidates,
  loading,
}: CandidatePipelineProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Candidate Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {stages.map((stage) => (
              <div key={stage} className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const candidatesByStage = stages.reduce((acc, stage) => {
    acc[stage] = candidates.filter((c) => c.stage === stage);
    return acc;
  }, {} as Record<Candidate["stage"], Candidate[]>);

  if (candidates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Candidate Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Users className="h-12 w-12" />}
            title="No candidates yet"
            description="Start receiving applications to see candidates in your pipeline"
            actionLabel="Post a Job"
            onAction={() => (window.location.href = "/employer/jobs")}
          />
        </CardContent>
      </Card>
    );
  }

  const getStageColor = (stage: Candidate["stage"]) => {
    switch (stage) {
      case "New":
        return "bg-gray-100 border-gray-300";
      case "Screened":
        return "bg-blue-50 border-blue-300";
      case "Shortlist":
        return "bg-purple-50 border-purple-300";
      case "Interview":
        return "bg-yellow-50 border-yellow-300";
      case "Offer":
        return "bg-green-50 border-green-300";
      default:
        return "bg-gray-100 border-gray-300";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidate Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stages.map((stage) => (
            <div key={stage} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">{stage}</h4>
                <Badge variant="secondary" className="text-xs">
                  {candidatesByStage[stage].length}
                </Badge>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {candidatesByStage[stage].map((candidate) => (
                  <div
                    key={candidate.id}
                    className={cn(
                      "p-3 rounded-lg border-2 cursor-move hover:shadow-md transition-shadow",
                      getStageColor(stage)
                    )}
                    draggable
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-sm truncate">
                          {candidate.name}
                        </h5>
                        <p className="text-xs text-muted-foreground truncate">
                          {candidate.position}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="shrink-0 bg-green-100 text-green-800 text-xs"
                      >
                        {candidate.matchScore}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Applied {candidate.appliedDate.toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
