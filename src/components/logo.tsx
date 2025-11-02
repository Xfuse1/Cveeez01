import Link from "next/link";
import { Briefcase } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
       <Briefcase className="h-8 w-8 text-primary" />
       <span className="text-2xl font-bold font-headline text-primary">CVEEEZ</span>
    </Link>
  );
}
