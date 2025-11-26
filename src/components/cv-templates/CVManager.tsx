"use client";

import React, { useEffect, useState } from 'react';
import type { CVInterface } from '@/types/cv';
import CVService from '@/services/cv-service';
import { useAuth } from '@/contexts/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, Edit } from 'lucide-react';

interface CVManagerProps {
  userId?: string; // optional, will fallback to authenticated user
  onEdit?: (cvData: any, cvId?: string) => void;
  onSelect?: (cv: CVInterface) => void; // optional selection handler
}

export function CVManager({ userId: userIdProp, onEdit, onSelect }: CVManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cvs, setCvs] = useState<CVInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = userIdProp || user?.uid || '';

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!userId) return;
      setLoading(true);
      try {
        const items = await CVService.fetchUserCVs(userId);
        if (!mounted) return;
        setCvs(items);
      } catch (err: any) {
        console.error('Failed to load CVs', err);
        setError(err?.message || 'Failed to load CVs');
        toast({ title: 'Error', description: err?.message || 'Failed to load CVs', variant: 'destructive' });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => { mounted = false; };
  }, [userId, toast]);

  const handleEdit = (cv: CVInterface) => {
    if (onEdit) onEdit(cv.cvData, cv.cvId);
    if (onSelect) onSelect(cv);
  };

  if (!userId) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-muted-foreground">Please sign in to manage your CVs.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Loading CVs…</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Fetching your saved CVs.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cvs.length === 0) {
    return (
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Your CVs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No saved CVs yet. Generate one using the AI CV Builder.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Your Saved CVs</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {cvs.map((cv) => (
              <li key={cv.cvId} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex-1">
                  <div className="font-medium">{cv.title}</div>
                  <div className="text-xs text-muted-foreground">{new Date(cv.updatedAt?.toDate ? cv.updatedAt.toDate() : cv.updatedAt).toLocaleString()}</div>
                </div>

                <div className="flex items-center gap-2">
                  {cv.pdfUrl ? (
                    <a href={cv.pdfUrl} target="_blank" rel="noreferrer" aria-label={`Download ${cv.title}`}>
                      <Button variant="outline" size="sm">
                        <Download className="me-2 h-4 w-4" />
                        Download
                      </Button>
                    </a>
                  ) : (
                    <Button variant="ghost" size="sm" disabled>
                      <Download className="me-2 h-4 w-4" />
                      No PDF
                    </Button>
                  )}

                  <Button variant="default" size="sm" onClick={() => handleEdit(cv)}>
                    <Edit className="me-2 h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default CVManager;
