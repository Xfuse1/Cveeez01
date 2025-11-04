
"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold">CVEEEZ</span>
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link href="/ecommerce">E-commerce</Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
