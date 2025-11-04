"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  ShoppingBag,
  Wallet,
  MessageSquare,
  Bell,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/dashboard";

interface DashboardNavProps {
  role: UserRole;
  onRoleToggle: () => void;
}

export function DashboardNav({ role, onRoleToggle }: DashboardNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Dashboard",
      href: role === "seeker" ? "/services/user-dashboard" : "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Jobs",
      href: role === "seeker" ? "/jobs" : "/employer/jobs",
      icon: Briefcase,
    },
    {
      label: "CV",
      href: "/services/ai-cv-builder",
      icon: FileText,
      showFor: ["seeker"] as UserRole[],
    },
    {
      label: "Orders",
      href: "/orders",
      icon: ShoppingBag,
    },
    {
      label: "Wallet",
      href: "/wallet",
      icon: Wallet,
    },
    {
      label: "Messages",
      href: "/messages",
      icon: MessageSquare,
    },
    {
      label: "Notifications",
      href: "/notifications",
      icon: Bell,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.showFor || item.showFor.includes(role)
  );

  return (
    <nav className="sticky top-0 z-50 border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-xl">
              CVEEEZ
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRoleToggle}
              className="text-xs"
            >
              View as: <span className="font-bold ml-1">{role === "seeker" ? "Seeker" : "Employer"}</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
