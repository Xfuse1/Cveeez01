
"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "@/contexts/language-provider";
import { translations } from "@/lib/translations";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState as useStateEffect, useEffect } from "react";
// @ts-ignore
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { checkAdminAccess } from "@/services/admin";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"seeker" | "employer" | "admin" | null>(null);
  const { language } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const t = translations[language];
  const { user, logOut } = useAuth();

  useEffect(() => {
    const getUserRoleAndDashboard = async (retryCount = 0) => {
      if (!user) {
        setDashboardUrl(null);
        setUserRole(null);
        return;
      }

      try {
        console.log("Checking user role for:", user.uid, user.email);
        
        // Add a small delay to ensure Firebase is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const adminCheck = await checkAdminAccess(user.uid, user.email);
        console.log("Admin check result:", adminCheck);
        if (adminCheck.isAdmin) {
          setDashboardUrl("/admin");
          setUserRole("admin");
          console.log("User is admin");
          return;
        }

        const employerDoc = await getDoc(doc(db, "employers", user.uid));
        console.log("Employer doc exists:", employerDoc.exists());
        if (employerDoc.exists()) {
          setDashboardUrl("/employer");
          setUserRole("employer");
          console.log("User is employer");
          return;
        }

        const seekerDoc = await getDoc(doc(db, "seekers", user.uid));
        console.log("Seeker doc exists:", seekerDoc.exists());
        if (seekerDoc.exists()) {
          setDashboardUrl("/services/user-dashboard");
          setUserRole("seeker");
          console.log("User is seeker");
          return;
        }

        console.log("No profile found, redirecting to signup-type");
        setDashboardUrl("/signup-type");
        setUserRole(null);
      } catch (error: any) {
        console.error("Error fetching user role:", error);
        
        // Retry on offline errors (max 3 retries with exponential backoff)
        if (error.code === 'unavailable' || error.message?.includes('offline')) {
          if (retryCount < 3) {
            const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
            console.log(`Retrying in ${delay}ms... (attempt ${retryCount + 1}/3)`);
            setTimeout(() => getUserRoleAndDashboard(retryCount + 1), delay);
            return;
          }
          console.error("Max retries reached. User may be offline.");
        }
        
        setDashboardUrl(null);
        setUserRole(null);
      }
    };

    getUserRoleAndDashboard();
  }, [user]);

  const getHref = (hash: string) => (pathname === '/' ? hash : `/${hash}`);

  const navLinks = [
    { label: t.header.aboutUs, href: getHref("#about") },
    { label: t.header.ourTeam, href: getHref("#team") },
    { label: t.header.contactUs, href: getHref("#contact") },
    { label: t.ecommerce.pageTitle, href: "/ecommerce" },
    { label: t.services.talentSpace, href: "/talent-space"},
  ];

  const NavMenu = ({ isMobile = false }) => (
    <nav
      className={`flex gap-6 ${
        isMobile ? "flex-col items-start text-lg mt-8" : "items-center"
      }`}
    >
      {navLinks.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
        >
          {link.label}
        </Link>
      ))}
      {userRole === 'employer' && (
        <Link
          href="/employer"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
        >
          My Jobs
        </Link>
      )}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="me-4 flex">
          <Logo />
        </div>
        
        <div className="md:hidden">
         <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side={language === 'ar' ? 'right' : 'left'} className="w-[300px] sm:w-[400px]">
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <Logo />
                  <LanguageSwitcher />
                </div>
                <NavMenu isMobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="flex flex-1 items-center justify-between gap-2 md:justify-end">
          <div className="hidden md:flex md:flex-1 md:items-center md:justify-center">
            <NavMenu />
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            {user ? (
              <>
                {dashboardUrl && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(dashboardUrl)}
                    className="hidden md:flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                    Dashboard
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                        <AvatarFallback>{user.displayName?.charAt(0) || <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          View Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                       <Link href="/settings">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                          Settings
                       </Link>
                    </DropdownMenuItem>
                    {dashboardUrl && dashboardUrl !== "/signup-type" && (
                        <DropdownMenuItem onClick={() => router.push(dashboardUrl)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                          Dashboard
                        </DropdownMenuItem>
                    )}
                    {dashboardUrl === "/signup-type" && (
                        <DropdownMenuItem onClick={() => router.push(dashboardUrl)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          Complete Profile
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logOut}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
                <Link href="/login">
                    <Button>Login</Button>
                </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
