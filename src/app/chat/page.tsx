"use client";

import { useRouter } from "next/navigation";
import { ChatWidget } from "@/components/chat/chat-widget";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function ChatPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <div className="w-full max-w-md p-4">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push("/")}
            className="gap-2 text-xs"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للرئيسية
          </Button>
          
          <h1 className="text-lg font-semibold text-gray-700">
            Support Chat
          </h1>
          
          {/* Invisible spacer to help center the title if needed, or just rely on flex */}
          <div className="w-[88px] hidden sm:block" /> 
        </div>

        <ChatWidget
          userId="PUT_A_REAL_SEEKER_OR_EMPLOYER_DOC_ID_HERE"
          userType="seeker"
          userName="Test User"
          userEmail="test@example.com"
        />
      </div>
    </div>
  );
}
