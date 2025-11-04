'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Job } from '@/types/talent-space';
import { Briefcase } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';

interface JobListingsProps {
  jobs: Job[];
}

export function JobListings({ jobs }: JobListingsProps) {
  const { language } = useLanguage();
  const t = translations[language].talentSpace;

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          <span>{t.jobs.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {jobs.length > 0 ? (
          <>
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
            <Button variant="link" className="w-full mt-2" asChild>
              <Link href="/jobs">{t.jobs.viewAll}</Link>
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t.jobs.noJobs}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
