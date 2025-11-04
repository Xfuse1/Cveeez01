import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Building2 } from "lucide-react";

export default function SignupTypePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Join CVEEEZ</CardTitle>
          <CardDescription>
            Choose your account type to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/signup/seeker">
              <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow flex flex-col items-center justify-center h-full">
                <User className="w-12 h-12 mb-4 text-primary" />
                <h3 className="text-lg font-semibold">Job Seeker</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Find jobs, build your CV, and grow your career.
                </p>
              </div>
            </Link>
            <Link href="/signup/employer">
              <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow flex flex-col items-center justify-center h-full">
                <Building2 className="w-12 h-12 mb-4 text-primary" />
                <h3 className="text-lg font-semibold">Employer</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Post jobs, find talent, and manage candidates.
                </p>
              </div>
            </Link>
          </div>
          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
