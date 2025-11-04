'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Job } from '@/types/talent-space';
import { Briefcase } from 'lucide-react';

interface JobsSidebarProps {
  jobs: Job[];
}

export function JobsSidebar({ jobs }: JobsSidebarProps) {
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          <span>Recommended Jobs</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {jobs.slice(0, 4).map((job) => (
            <li key={job.id}>
              <a href="#" className="block p-2 rounded-md hover:bg-accent">
                <p className="font-semibold text-sm">{job.title}</p>
                <p className="text-xs text-muted-foreground">{job.company} &middot; {job.location}</p>
              </a>
            </li>
          ))}
        </ul>
        <Button variant="link" className="w-full mt-2">
          View all jobs
        </Button>
      </CardContent>
    </Card>
  );
}
