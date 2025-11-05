"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { useRouter } from "next/navigation";
import { checkAdminAccess } from "@/services/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { migrateStaticServicesToFirestore } from "@/services/migrate-services";
import { ArrowLeft, Upload, Loader, CheckCircle2, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MigrationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [results, setResults] = useState<{
    success: string[];
    failed: { id: string; error: string }[];
  } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    checkAccess();
  }, [user, router]);

  const checkAccess = async () => {
    if (!user) return;

    const adminResult = await checkAdminAccess(user.uid, user.email);
    if (!adminResult.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      router.push("/");
      return;
    }

    setLoading(false);
  };

  const handleMigrate = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in as admin",
        variant: "destructive",
      });
      return;
    }

    setMigrating(true);
    setResults(null);

    try {
      const migrationResults = await migrateStaticServicesToFirestore(user.uid);
      setResults(migrationResults);

      if (migrationResults.failed.length === 0) {
        toast({
          title: "Migration Complete!",
          description: `Successfully migrated ${migrationResults.success.length} services`,
        });
      } else {
        toast({
          title: "Migration Completed with Errors",
          description: `${migrationResults.success.length} succeeded, ${migrationResults.failed.length} failed`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Migration error:", error);
      toast({
        title: "Migration Failed",
        description: error.message || "An error occurred during migration",
        variant: "destructive",
      });
    } finally {
      setMigrating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Service Migration Tool</h1>
            <p className="text-muted-foreground">
              Migrate static services to Firestore database
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/admin")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <Alert>
          <AlertDescription>
            <strong>Warning:</strong> This tool migrates services from the static data file to
            Firestore. Only run this once to populate your database with initial services.
            After migration, you can manage services from the "Manage Services" page.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Migration Status</CardTitle>
            <CardDescription>
              Click the button below to start the migration process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleMigrate}
              disabled={migrating || (results !== null && results.success.length > 0)}
              size="lg"
              className="w-full"
            >
              {migrating ? (
                <>
                  <Loader className="mr-2 h-5 w-5 animate-spin" />
                  Migrating Services...
                </>
              ) : results !== null && results.success.length > 0 ? (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Migration Complete
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Start Migration
                </>
              )}
            </Button>

            {results && (
              <div className="space-y-4 pt-4">
                {results.success.length > 0 && (
                  <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Successfully Migrated ({results.success.length})
                    </h3>
                    <ul className="space-y-1 text-sm text-green-800 dark:text-green-200">
                      {results.success.map((id) => (
                        <li key={id} className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full" />
                          {id}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {results.failed.length > 0 && (
                  <div className="border rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                    <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                      <XCircle className="h-5 w-5" />
                      Failed Migrations ({results.failed.length})
                    </h3>
                    <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
                      {results.failed.map((item) => (
                        <li key={item.id} className="flex flex-col gap-1">
                          <span className="font-medium">{item.id}</span>
                          <span className="text-xs opacity-80">{item.error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/admin/manage-services")}
                    className="flex-1"
                  >
                    Go to Manage Services
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/ecommerce")}
                    className="flex-1"
                  >
                    View Services Page
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What This Tool Does</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>1.</strong> Reads all services from the static data file
              (src/data/services.ts)
            </p>
            <p>
              <strong>2.</strong> Converts each service to the new database format with English
              and Arabic translations
            </p>
            <p>
              <strong>3.</strong> Creates entries in the Firestore "ecommerce_services"
              collection
            </p>
            <p>
              <strong>4.</strong> Shows you which services were successfully migrated and which
              failed
            </p>
            <p className="text-muted-foreground pt-2">
              After migration, you can manage all services from the admin dashboard. You won't
              need this tool again unless you want to reset your database.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
