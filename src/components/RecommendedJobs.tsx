'use client';

import { useState, useEffect } from 'react';
import { TalentSpaceService, type Job } from '@/services/talent-space';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Loader2, Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function RecommendedJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const result = await TalentSpaceService.getRecommendedJobs();
      if (result.success) {
        setJobs(result.data);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Briefcase className="w-5 h-5 text-primary" />
            الوظائف المقترحة
          </div>
          <Button variant="link" size="sm" asChild>
            <Link href="/jobs">عرض الكل</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin h-6 w-6 text-primary" />
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">لا توجد وظائف مقترحة حالياً.</p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800">{job.title}</h4>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    {job.type}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">{job.company}</span> • {job.location}
                </div>
                
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {job.description}
                </p>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{job.applications} متقدم</span>
                  <span>{job.salary}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
