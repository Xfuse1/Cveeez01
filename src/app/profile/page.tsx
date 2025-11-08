"use client";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-provider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Globe, 
  Building, 
  Users, 
  Shield,
  Settings,
  Calendar
} from "lucide-react";
import { checkAdminAccess } from "@/services/admin";

interface UserProfile {
  role: "admin" | "employer" | "seeker";
  email: string;
  displayName: string;
  photoURL?: string;
  uid: string;
  createdAt?: Date;
  // Employer fields
  companyNameEn?: string;
  companyNameAr?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  city?: string;
  country?: string;
  // Seeker fields
  fullName?: string;
  jobTitle?: string;
  phoneCode?: string;
  phoneNumber?: string;
  nationality?: string;
  bio?: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      try {
        let userProfile: UserProfile | null = null;

        // 1. Check if user is an admin
        const adminResult = await checkAdminAccess(user.uid, user.email);
        if (adminResult.isAdmin) {
          userProfile = {
            role: "admin",
            email: user.email || "",
            displayName: user.displayName || "Admin",
            photoURL: user.photoURL || undefined,
            uid: user.uid,
            createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : undefined,
          };
        }

        // 2. If not admin, check if seeker
        if (!userProfile) {
          const seekerDoc = await getDoc(doc(db, "seekers", user.uid));
          if (seekerDoc.exists()) {
            const data = seekerDoc.data();
            userProfile = {
              role: "seeker",
              email: user.email || "",
              displayName: data.fullName || user.displayName || "User",
              photoURL: user.photoURL || undefined,
              uid: user.uid,
              createdAt: data.createdAt?.toDate() || (user.metadata.creationTime ? new Date(user.metadata.creationTime) : undefined),
              fullName: data.fullName,
              jobTitle: data.jobTitle,
              phoneCode: data.phoneCode,
              phoneNumber: data.phoneNumber,
              country: data.country,
              nationality: data.nationality,
              bio: data.bio,
            };
          }
        }
        
        // 3. If not seeker, check if employer
        if (!userProfile) {
          const employerDoc = await getDoc(doc(db, "employers", user.uid));
          if (employerDoc.exists()) {
            const data = employerDoc.data();
            userProfile = {
              role: "employer",
              email: user.email || "",
              displayName: data.companyNameEn || user.displayName || "Company",
              photoURL: user.photoURL || undefined,
              uid: user.uid,
              createdAt: data.createdAt?.toDate() || (user.metadata.creationTime ? new Date(user.metadata.creationTime) : undefined),
              companyNameEn: data.companyNameEn,
              companyNameAr: data.companyNameAr,
              industry: data.industry,
              companySize: data.companySize,
              website: data.website,
              city: data.city,
              country: data.country,
            };
          }
        }

        // 4. If no specific profile, create a default one
        if (!userProfile) {
          userProfile = {
            role: "seeker", // Default role
            email: user.email || "",
            displayName: user.displayName || "New User",
            photoURL: user.photoURL || undefined,
            uid: user.uid,
            createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : undefined,
          };
        }
        
        setProfile(userProfile);

      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [user, router]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p>Profile not found. Please try logging in again.</p>
             <Button onClick={() => router.push('/login')} className="mt-4">Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "employer":
        return "default";
      case "seeker":
        return "secondary";
      default:
        return "outline";
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">View your account information</p>
          </div>
          <Button onClick={() => router.push("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        {/* Profile Overview Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={profile.photoURL} alt={profile.displayName} />
                <AvatarFallback className="text-3xl">
                  {profile.displayName?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              {/* Basic Info */}
              <div className="flex-1 text-center md:text-left space-y-3">
                <div>
                  <h2 className="text-2xl font-bold">{profile.displayName}</h2>
                  {profile.role === "seeker" && profile.jobTitle && (
                    <p className="text-muted-foreground text-lg">{profile.jobTitle}</p>
                  )}
                  {profile.role === "employer" && profile.industry && (
                    <p className="text-muted-foreground text-lg">{profile.industry}</p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge variant={getRoleBadgeVariant(profile.role)}>
                    <Shield className="mr-1 h-3 w-3" />
                    {profile.role.toUpperCase()}
                  </Badge>
                  {profile.country && (
                    <Badge variant="outline">
                      <MapPin className="mr-1 h-3 w-3" />
                      {profile.country}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-muted-foreground justify-center md:justify-start">
                  <Mail className="h-4 w-4" />
                  <span>{profile.email}</span>
                </div>

                {profile.createdAt && (
                  <div className="flex items-center gap-2 text-muted-foreground justify-center md:justify-start">
                    <Calendar className="h-4 w-4" />
                    <span>Member since {formatDate(profile.createdAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role-Specific Information */}
        {profile.role === "admin" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Administrator Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User ID</p>
                  <p className="text-sm font-mono bg-muted p-2 rounded mt-1">{profile.uid}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Permissions</p>
                  <p className="text-sm mt-1">Full system access and management capabilities</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {profile.role === "employer" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Company Name (English)</p>
                    <p className="text-sm mt-1">{profile.companyNameEn || "Not provided"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Company Name (Arabic)</p>
                    <p className="text-sm mt-1" dir="rtl">{profile.companyNameAr || "غير متوفر"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Industry</p>
                    <p className="text-sm mt-1">{profile.industry || "Not provided"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Company Size</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Users className="h-4 w-4" />
                      <p className="text-sm">{profile.companySize || "Not provided"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Website</p>
                    {profile.website ? (
                      <a 
                        href={profile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm mt-1 text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Globe className="h-4 w-4" />
                        {profile.website}
                      </a>
                    ) : (
                      <p className="text-sm mt-1">Not provided</p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Country</p>
                    <p className="text-sm mt-1">{profile.country || "Not provided"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">City</p>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4" />
                      <p className="text-sm">{profile.city || "Not provided"}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">User ID</p>
                    <p className="text-xs font-mono bg-muted p-2 rounded mt-1 overflow-x-auto">{profile.uid}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {profile.role === "seeker" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                    <p className="text-sm mt-1">{profile.fullName || "Not provided"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Job Title</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Briefcase className="h-4 w-4" />
                      <p className="text-sm">{profile.jobTitle || "Not provided"}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                    {profile.phoneNumber ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="h-4 w-4" />
                        <p className="text-sm">{profile.phoneCode} {profile.phoneNumber}</p>
                      </div>
                    ) : (
                      <p className="text-sm mt-1">Not provided</p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Country</p>
                    <p className="text-sm mt-1">{profile.country || "Not provided"}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nationality</p>
                    <p className="text-sm mt-1">{profile.nationality || "Not provided"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bio</p>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{profile.bio || "Not provided"}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">User ID</p>
                    <p className="text-xs font-mono bg-muted p-2 rounded mt-1 overflow-x-auto">{profile.uid}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4" />
                  <p className="text-sm">{profile.email}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Created</p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  <p className="text-sm">{formatDate(profile.createdAt)}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Type</p>
                <Badge variant={getRoleBadgeVariant(profile.role)} className="mt-2">
                  {profile.role.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button onClick={() => router.push("/settings")} size="lg">
            <Settings className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
          <Button onClick={() => router.back()} variant="outline" size="lg">
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}

    