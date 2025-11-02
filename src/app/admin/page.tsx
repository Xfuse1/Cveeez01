"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { summarizeCustomerFeedback } from "@/ai/flows/summarize-customer-feedback";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";
import { translations } from "@/lib/translations";

const reviews = translations.en.testimonials.reviews;
const allReviews = Object.values(reviews)
  .map((r) => r.review)
  .join("\n\n");

export default function AdminDashboard() {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSummarize = async () => {
    setIsLoading(true);
    setSummary("");
    try {
      const result = await summarizeCustomerFeedback({ reviews: allReviews });
      setSummary(result.summary);
    } catch (error) {
      console.error("Error summarizing feedback:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to summarize customer feedback.",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>Number of registered users.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">1,234</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>CVs Generated</CardTitle>
            <CardDescription>Total CVs created by the AI builder.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">5,800+</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Total revenue from package sales.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">$12,450</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Feedback Summary</CardTitle>
          <CardDescription>
            Use AI to get a quick summary of the latest customer reviews.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <h3 className="font-semibold mb-2">Reviews to Summarize:</h3>
              <Textarea readOnly value={allReviews} rows={8} className="bg-muted" />
            </div>
            <Button onClick={handleSummarize} disabled={isLoading}>
              {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Summarize with AI
            </Button>
            {summary && (
              <div>
                <h3 className="font-semibold mb-2">AI Summary:</h3>
                <div className="prose dark:prose-invert rounded-md border bg-background p-4">
                  <p>{summary}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
