"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-provider";
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Maximize2,
  Bot,
  User,
  Loader2,
  Sparkles,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestedActions?: string[];
}

interface FloatingChatbotProps {
  userRole: "seeker" | "employer" | "admin";
  userName?: string;
}

export function FloatingChatbot({ userRole, userName }: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Welcome message when chat first opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const isArabic =
        typeof document !== "undefined" &&
        (document.documentElement.lang === "ar" ||
          localStorage.getItem("xfuse_lang") === "ar");

      const customerSupportLabel = isArabic ? "خدمة العملاء" : "Customer support";

      const actions =
        userRole === "seeker"
          ? ["كيف أبني سيرتي الذاتية؟", "كيف أبحث عن وظيفة؟", "ما هي خدماتكم؟"]
          : userRole === "employer"
          ? ["How do I post a job?", "How to review applications?", "Pricing plans"]
          : ["Platform analytics", "User management", "System settings"];

      actions.push(customerSupportLabel);

      const welcomeMessage: Message = {
        id: "welcome",
        role: "assistant",
        content: userName
          ? `مرحباً ${userName}! 👋 أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟\n\nHello ${userName}! 👋 I'm your AI assistant. How can I help you today?`
          : "مرحباً! 👋 أنا مساعدك الذكي. اسألني عن أي شيء متعلق بالمنصة.\n\nHello! 👋 I'm your AI assistant. Ask me anything about the platform!",
        timestamp: new Date(),
        suggestedActions: actions,
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, userName, userRole]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage,
          userRole,
          userName: userName || user?.displayName,
          conversationHistory: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        const errorMsg = data.error || data.details || "Failed to get response from chatbot";
        throw new Error(errorMsg);
      }

      if (data.success && data.data) {
        const assistantMessage: Message = {
          id: Date.now().toString() + "_assistant",
          role: "assistant",
          content: data.data.response,
          timestamp: new Date(),
          suggestedActions: data.data.suggestedActions,
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Show escalation notice if needed
        if (data.data.requiresEscalation) {
          toast({
            title: "تواصل مع خدمة العملاء / Contact Customer Service",
            description:
              "سنقوم بتحويلك إلى خدمة العملاء قريباً / You'll be connected to customer service soon",
            duration: 5000,
          });
        }
      }
    } catch (error) {
      console.error("Chatbot error details:", {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      const errorText = error instanceof Error ? error.message : "حدث خطأ غير متوقع / Unexpected error occurred";
      
      toast({
        title: "خطأ / Error",
        description: errorText.length > 100 
          ? "حدث خطأ في الاتصال. حاول مرة أخرى / Connection error. Please try again."
          : errorText,
        variant: "destructive",
      });

      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString() + "_error",
        role: "assistant",
        content:
          "عذراً، حدث خطأ في معالجة رسالتك. يرجى المحاولة مرة أخرى.\n\nSorry, there was an error processing your message. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedAction = (action: string) => {
    const isArabic =
      typeof document !== "undefined" &&
      (document.documentElement.lang === "ar" ||
        localStorage.getItem("xfuse_lang") === "ar");
    const customerSupportLabel = isArabic ? "خدمة العملاء" : "Customer support";

    if (action === customerSupportLabel) {
      try {
        if (router) {
          router.push("/chat");
        } else {
          window.location.href = "/chat";
        }
      } catch (e) {
        window.location.href = "/chat";
      }
      return;
    }

    setInputMessage(action);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-110 z-50 bg-gradient-to-r from-primary to-primary/80"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card
          className={cn(
            "fixed bottom-6 right-6 z-50 shadow-2xl transition-all duration-300 flex flex-col",
            isMinimized ? "w-80 h-16" : "w-96 h-[600px]",
            "border-2 border-primary/20"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bot className="h-6 w-6" />
                <span className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Assistant</h3>
                <p className="text-xs opacity-90">مساعد ذكي • Online</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 hover:bg-primary-foreground/20 text-primary-foreground"
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 hover:bg-primary-foreground/20 text-primary-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id}>
                      <div
                        className={cn(
                          "flex gap-3 mb-2",
                          message.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        {message.role === "assistant" && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                            message.role === "user"
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-muted rounded-bl-sm"
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words">{message.content}</p>
                          <p
                            className={cn(
                              "text-xs mt-1 opacity-70",
                              message.role === "user" ? "text-right" : "text-left"
                            )}
                          >
                            {message.timestamp.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {message.role === "user" && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <User className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Suggested Actions */}
                      {message.role === "assistant" && message.suggestedActions && (
                        <div className="flex flex-wrap gap-2 ml-11 mt-2">
                          {message.suggestedActions.map((action, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              onClick={() => handleSuggestedAction(action)}
                              className="text-xs h-7 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              <Sparkles className="h-3 w-3 mr-1" />
                              {action}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Typing...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t bg-background">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="اكتب رسالتك هنا... Type your message..."
                    disabled={isLoading}
                    className="flex-1 rounded-full"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    size="icon"
                    className="rounded-full h-10 w-10 bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Powered by AI • متاح 24/7
                </p>
              </div>
            </>
          )}
        </Card>
      )}
    </>
  );
}
