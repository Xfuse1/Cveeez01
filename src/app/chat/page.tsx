import { ChatWidget } from "@/components/chat/chat-widget";

export default function ChatPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <h1 className="text-xl font-semibold mb-4 text-center">
          Support Chat (Test Page)
        </h1>
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
