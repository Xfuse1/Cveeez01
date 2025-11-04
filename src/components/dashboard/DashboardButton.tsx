"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";

export function DashboardButton() {
  const { user } = useAuth();
  const [dashboardUrl, setDashboardUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserDashboard = async () => {
      if (!user) {
        setDashboardUrl(null);
        setLoading(false);
        return;
      }

      try {
        // Check if user is an employer
        const employerDoc = await getDoc(doc(db, "employers", user.uid));
        if (employerDoc.exists()) {
          setDashboardUrl("/admin");
          setLoading(false);
          return;
        }

        // Check if user is a seeker
        const seekerDoc = await getDoc(doc(db, "seekers", user.uid));
        if (seekerDoc.exists()) {
          setDashboardUrl("/services/user-dashboard");
          setLoading(false);
          return;
        }

        // User exists but role not found
        setDashboardUrl("/signup-type");
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user role:", error);
        setDashboardUrl(null);
        setLoading(false);
      }
    };

    getUserDashboard();
  }, [user]);

  if (!user || loading) {
    return null;
  }

  if (!dashboardUrl) {
    return null;
  }

  return (
    <Button asChild variant="default">
      <Link href={dashboardUrl} className="flex items-center gap-2">
        <LayoutDashboard className="h-4 w-4" />
        Go to Dashboard
      </Link>
    </Button>
  );
}
