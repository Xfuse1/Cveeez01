"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-provider";
import { checkAdminAccess } from "@/services/admin";
import { Loader } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const verifyAdminAccess = async () => {
      // Wait for auth to load
      if (authLoading) return;

      // If no user, redirect to login
      if (!user) {
        router.push("/login?redirect=/admin");
        return;
      }

      // Check if user has admin access
      const result = await checkAdminAccess(user.uid, user.email);
      
      if (result.isAdmin) {
        setHasAccess(true);
        setIsVerifying(false);
      } else {
        // User is not an admin, redirect to home
        router.push("/?error=unauthorized");
        return;
      }
    };

    verifyAdminAccess();
  }, [user, authLoading, router]);

  // Show loading spinner while verifying
  if (authLoading || isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Only render children if user has access
  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}