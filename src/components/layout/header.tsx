"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, User, Languages, Briefcase, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAdmin = false; // Mock authentication status

  const navLinks = [
    { label: "About Us", href: "#about" },
    { label: "Our Team", href: "#team" },
    { label: "Contact Us", href: "#contact" },
    { label: "Why Choose Us", href: "#why-us" },
  ];

  const NavMenu = ({ isMobile = false }) => (
    <nav
      className={`flex gap-6 ${
        isMobile ? "flex-col items-start text-lg" : "items-center"
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
      {isAdmin && (
        <Link
          href="/admin"
          className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
        >
          Dashboard
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
                <div className="mt-8 flex flex-col space-y-6">
                  <NavMenu isMobile />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="hidden md:flex md:flex-1 md:items-center md:justify-start md:pl-6">
            <NavMenu />
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Languages className="h-5 w-5" />
                  <span className="sr-only">Change language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>English</DropdownMenuItem>
                <DropdownMenuItem>العربية</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Log in</DropdownMenuItem>
                <DropdownMenuItem>Sign up</DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Briefcase className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
