"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CVData } from "@/types/dashboard";
import { FileText, Sparkles, Download, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface AIBuilderCardProps {
  cvData: CVData;
  seekerProfile?: any; // Seeker profile data to pre-fill form
}

export function AIBuilderCard({ cvData, seekerProfile }: AIBuilderCardProps) {
  const { toast } = useToast();
  const router = useRouter();
  
  // Check if this is a new CV (no existing CV data)
  const isNewCV = cvData.id === "new" || cvData.score === 0;

  const getStatusColor = (status: CVData["status"]) => {
    switch (status) {
      case "ready":
        return "bg-green-500";
      case "ai_running":
        return "bg-blue-500";
      case "draft":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: CVData["status"]) => {
    switch (status) {
      case "ready":
        return "Ready";
      case "ai_running":
        return "AI Running";
      case "draft":
        return "Draft";
      default:
        return status;
    }
  };

  const handleImprove = () => {
    // Redirect to AI CV Builder with existing CV ID to edit/improve
    router.push(`/services/ai-cv-builder?cvId=${cvData.id}&action=improve`);
  };

  const handleCreateNew = () => {
    // Redirect to AI CV Builder with profile data pre-filled
    if (seekerProfile) {
      // Encode profile data to pass as URL params
      const profileData = {
        name: seekerProfile.displayName || seekerProfile.name || '',
        email: seekerProfile.email || '',
        phone: seekerProfile.phoneNumber || seekerProfile.phone || '',
        location: seekerProfile.location || '',
        jobTitle: seekerProfile.jobTitle || '',
        bio: seekerProfile.bio || '',
        skills: seekerProfile.skills || [],
        experience: seekerProfile.experience || [],
        education: seekerProfile.education || [],
      };
      
      // Store in sessionStorage to avoid URL length limits
      sessionStorage.setItem('cvBuilderPrefill', JSON.stringify(profileData));
    }
    
    router.push('/services/ai-cv-builder');
  };

  const handleDownload = () => {
    if (isNewCV) return;
    
    toast({
      title: "Downloading CV",
      description: "Your CV is being prepared for download...",
    });
    
    // TODO: Implement actual download logic
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI CV Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isNewCV ? (
          // Empty state - no CV yet
          <div className="text-center py-6 space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">{cvData.title}</h4>
              <p className="text-sm text-muted-foreground">
                Build your professional CV with AI assistance
              </p>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={handleCreateNew}
              className="w-full"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Create New CV
            </Button>
          </div>
        ) : (
          // Existing CV
          <>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-semibold">{cvData.title}</h4>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge
                    variant="secondary"
                    className={`${getStatusColor(cvData.status)} text-white`}
                  >
                    {getStatusLabel(cvData.status)}
                  </Badge>
                  <span>
                    Updated {cvData.updatedAt.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">CV Score</span>
                <span className="font-semibold">{cvData.score}/100</span>
              </div>
              <Progress value={cvData.score} className="h-2" />
            </div>

            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={handleImprove}
                disabled={cvData.status === "ai_running"}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Improve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleCreateNew}
              >
                Create New
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDownload}
                disabled={isNewCV}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
