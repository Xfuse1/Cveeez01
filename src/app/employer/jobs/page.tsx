"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmployerJobsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Manage Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Post, edit, and manage your job listings here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
