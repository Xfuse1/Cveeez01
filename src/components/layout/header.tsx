"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, User, LayoutDashboard, Settings, Briefcase } from "lucide-react";
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
        <div className="mr-4 hidden md:flex">
          <Logo />
        </div>
        
        <div className="md:hidden">
         <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <div className="p-6">
                <Logo />
                <NavMenu isMobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
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
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                        <AvatarFallback>{user.displayName?.charAt(0) || <User />}</AvatarFallback>
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
                          <User className="h-4 w-4 mr-2" />
                          View Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                       <Link href="/settings">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                       </Link>
                    </DropdownMenuItem>
                    {dashboardUrl && dashboardUrl !== "/signup-type" && (
                        <DropdownMenuItem onClick={() => router.push(dashboardUrl)}>
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Dashboard
                        </DropdownMenuItem>
                    )}
                    {dashboardUrl === "/signup-type" && (
                        <DropdownMenuItem onClick={() => router.push(dashboardUrl)}>
                          <User className="h-4 w-4 mr-2" />
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
