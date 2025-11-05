"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { setAdminUser } from "@/services/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Shield } from "lucide-react";

export default function AdminManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uid, setUid] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"super_admin" | "admin" | "moderator">("admin");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddAdmin = async () => {
    if (!uid.trim() || !email.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please provide both UID and email.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await setAdminUser(uid, email, role, []);
      
      if (success) {
        toast({
          title: "Admin Added Successfully",
          description: `${email} has been granted ${role} access.`,
        });
        // Clear form
        setUid("");
        setEmail("");
        setRole("admin");
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Add Admin",
          description: "An error occurred while adding the admin user.",
        });
      }
    } catch (error) {
      console.error("Error adding admin:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add admin user. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Admin Management</h1>
              <p className="text-muted-foreground">Grant admin access to users</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Add New Admin
              </CardTitle>
              <CardDescription>
                Grant admin access to a user by providing their Firebase UID and email address.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">User ID (Firebase UID)</label>
                <Input
                  placeholder="Enter Firebase UID"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Find this in Firebase Console → Authentication → Users
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Role</label>
                <Select value={role} onValueChange={(value: any) => setRole(value)} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin (Full Access)</SelectItem>
                    <SelectItem value="admin">Admin (Standard Access)</SelectItem>
                    <SelectItem value="moderator">Moderator (Limited Access)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Super admins have full access to all features
                </p>
              </div>

              <Button 
                onClick={handleAddAdmin} 
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? "Adding Admin..." : "Add Admin User"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardHeader>
              <CardTitle className="text-yellow-600 dark:text-yellow-400">
                ⚠️ Security Notice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <strong>Important:</strong> Only grant admin access to trusted users.
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Admins can access sensitive user data and system settings</li>
                <li>Super admins have unrestricted access to all features</li>
                <li>Always verify the user's identity before granting access</li>
                <li>Regularly audit the admin user list</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle>How to Find User UID</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">Method 1: Firebase Console</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Go to Firebase Console</li>
                <li>Navigate to Authentication → Users</li>
                <li>Find the user and copy their UID</li>
              </ol>

              <p className="font-medium mt-4">Method 2: Browser Console</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Have the user sign in to the app</li>
                <li>Open browser console (F12)</li>
                <li>Look for Firebase auth data in localStorage</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
