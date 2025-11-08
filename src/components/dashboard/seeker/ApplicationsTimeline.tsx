"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Application } from "@/types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "../EmptyState";
import { Briefcase, Eye } from "lucide-react";
import type { ApplicationWithJobDetails } from "@/services/seeker-applications";

interface ApplicationsTimelineProps {
  applications: (Application | ApplicationWithJobDetails)[];
  loading?: boolean;
}

export function ApplicationsTimeline({
  applications,
  loading,
}: ApplicationsTimelineProps) {
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithJobDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStageColor = (stage: string) => {
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
              {applications.map((app) => {
                const isDetailed = 'jobDescription' in app;
                return (
                  <tr 
                    key={app.id} 
                    className="border-b last:border-0 hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => {
                      if (isDetailed) {
                        setSelectedApplication(app as ApplicationWithJobDetails);
                        setIsModalOpen(true);
                      }
                    }}
                  >
                    <td className="py-3 font-medium">{app.jobTitle}</td>
                    <td className="py-3 text-muted-foreground">{app.company}</td>
                    <td className="py-3">
                      <Badge className={`${getStageColor(app.stage)} text-white`}>
                        {app.stage}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm text-muted-foreground flex items-center justify-between">
                      {app.updatedAt ? app.updatedAt.toLocaleDateString() : (app as any).appliedDate?.toLocaleDateString?.() || 'N/A'}
                      {isDetailed && <Eye className="h-4 w-4 ml-2 text-primary" />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Job Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedApplication?.jobTitle}</DialogTitle>
            <DialogDescription>
              {selectedApplication?.company} • {selectedApplication?.location}
              {selectedApplication?.jobType && ` • ${selectedApplication.jobType}`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {selectedApplication?.salaryRange && (
              <div>
                <h3 className="font-semibold mb-2">Salary Range</h3>
                <p className="text-sm text-muted-foreground">{selectedApplication.salaryRange}</p>
              </div>
            )}

            {selectedApplication?.jobDescription && (
              <div>
                <h3 className="font-semibold mb-2">Job Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedApplication.jobDescription}</p>
              </div>
            )}

            {selectedApplication?.requirements && selectedApplication.requirements.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Requirements</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {selectedApplication.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedApplication?.benefits && selectedApplication.benefits.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Benefits</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {selectedApplication.benefits.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            {(selectedApplication?.companyEmail || selectedApplication?.companyPhone) && (
              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  {selectedApplication.companyEmail && <p>Email: {selectedApplication.companyEmail}</p>}
                  {selectedApplication.companyPhone && <p>Phone: {selectedApplication.companyPhone}</p>}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2">Application Status</h3>
              <div className="flex items-center gap-2">
                <Badge className={`${getStageColor(selectedApplication?.stage || '')} text-white`}>
                  {selectedApplication?.status || 'Applied'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Applied on {selectedApplication?.appliedDate?.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
