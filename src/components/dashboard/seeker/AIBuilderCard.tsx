"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CVData } from "@/types/dashboard";
import { FileText, Sparkles, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIBuilderCardProps {
  cvData: CVData;
}

export function AIBuilderCard({ cvData }: AIBuilderCardProps) {
  const { toast } = useToast();

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
    toast({
      title: "AI Improvement Started",
      description: "Your CV is being enhanced by AI...",
    });
  };

  const handleCreateNew = () => {
    toast({
      title: "Creating New CV",
      description: "Starting a new CV with AI assistance...",
    });
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
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
