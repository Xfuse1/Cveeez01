"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-provider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Loader } from "lucide-react";

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const verifyEmployerAccess = async () => {
      // Wait for auth to load
      if (authLoading) return;

      // If no user, redirect to login
      if (!user) {
        router.push("/login?redirect=/employer");
        return;
      }

      try {
        // Check if user is an employer
        const employerDoc = await getDoc(doc(db, "employers", user.uid));
        
        if (employerDoc.exists()) {
          setHasAccess(true);
          setIsVerifying(false);
        } else {
          // User is not an employer, redirect to home
          router.push("/?error=unauthorized");
          return;
        }
      } catch (error) {
        console.error("Error verifying employer access:", error);
        router.push("/?error=unauthorized");
      }
    };

    verifyEmployerAccess();
  }, [user, authLoading, router]);

  // Show loading spinner while verifying
  if (authLoading || isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Verifying employer access...</p>
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
