
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Calendar,
  ArrowLeft,
  Code
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

interface SeekerProfile {
  id: string;
  fullName: string;
  jobTitle: string;
  email: string;
  phoneCode: string;
  phoneNumber: string;
  country: string;
  nationality: string;
  bio: string;
  photoURL?: string;
  skills?: string[];
  createdAt?: Date;
}

export default function CandidateProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { id: candidateId } = params;

  const [profile, setProfile] = useState<SeekerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const loadProfile = async () => {
      if (!candidateId || typeof candidateId !== 'string') {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const seekerDoc = await getDoc(doc(db, "seekers", candidateId));
        if (seekerDoc.exists()) {
          const data = seekerDoc.data();
          setProfile({
            id: seekerDoc.id,
            fullName: data.fullName || "User",
            jobTitle: data.jobTitle || "N/A",
            email: data.email,
            phoneCode: data.phoneCode || "",
            phoneNumber: data.phoneNumber || "",
            country: data.country || "N/A",
            nationality: data.nationality || "N/A",
            bio: data.bio || "No bio available.",
            photoURL: data.photoURL,
            skills: data.skills || [],
            createdAt: data.createdAt?.toDate(),
          });
        }
      } catch (error) {
        console.error("Error loading candidate profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, router, candidateId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p>Candidate not found.</p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (date?: Date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
             <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                العودة الى المرشحين
             </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                  <AvatarImage src={profile.photoURL} alt={profile.fullName} />
                  <AvatarFallback className="text-3xl">
                    {profile.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left space-y-3">
                  <div>
                    <h2 className="text-3xl font-bold">{profile.fullName}</h2>
                    <p className="text-muted-foreground text-xl">{profile.jobTitle}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {profile.country && (
                      <Badge variant="outline">
                        <MapPin className="mr-1 h-3 w-3" />
                        {profile.country}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Professional Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
                </CardContent>
              </Card>

              {profile.skills && profile.skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Code className="h-5 w-5" /> Skills</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
               <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" /> Contact Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.email}</span>
                  </div>
                  {profile.phoneNumber && (
                     <div className="flex items-center gap-3">
                       <Phone className="h-4 w-4 text-muted-foreground" />
                       <span>{profile.phoneCode} {profile.phoneNumber}</span>
                     </div>
                  )}
                   <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.nationality}</span>
                  </div>
                   <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.country}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
