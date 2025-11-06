
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { seedTalentSpaceData } from '@/services/seed-database';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setResult(null);
    const response = await seedTalentSpaceData();
    if (response.success) {
      setResult({
        success: true,
        message: 'Database seeded successfully!',
        details: response.results,
      });
    } else {
      setResult({
        success: false,
        message: 'Failed to seed database.',
        details: response.error,
      });
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <Card>
        <CardHeader>
          <CardTitle>Database Seed</CardTitle>
          <CardDescription>
            Click the button to populate the Firestore database with initial data for the Talent Space feature.
            This should only be done once.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleSeed} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding...
              </>
            ) : (
              'Start Seeding'
            )}
          </Button>

          {result && (
            <div className={`p-4 rounded-md ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="flex items-center gap-2">
                {result.success ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                <p className="font-semibold">{result.message}</p>
              </div>
              {result.details && (
                <pre className="mt-2 text-xs bg-black/10 p-2 rounded whitespace-pre-wrap">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              )}
               {result.success && (
                    <div className="mt-4">
                        <Button asChild>
                            <Link href="/talent-space">Go to Talent Space</Link>
                        </Button>
                    </div>
                )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
