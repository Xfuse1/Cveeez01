"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/firebase/config";
import { useAuth } from "@/contexts/auth-provider";
import type { ChatSession, ChatMessage } from "@/lib/chat/types";
import {
  getOrCreateChatSession,
  sendUserMessage,
  listenToMessages,
  markSessionWaitingForAgent,
  sendSystemMessage,
} from "@/lib/chat/chat-service";

const CHAT_SESSION_TOKEN_KEY = "chat_session_token";

type ChatWidgetUserType = 'seeker' | 'employer';

interface ChatWidgetProps {
  userId?: string | null;
  userType?: ChatWidgetUserType | null;
  userName?: string | null;
  userEmail?: string | null;
}

export function ChatWidget(props: ChatWidgetProps) {
  const { user } = useAuth();
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [requestingSupport, setRequestingSupport] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      setLoadingSession(true);
      try {
        let storedToken: string | undefined;

        if (typeof window !== "undefined") {
          storedToken =
            window.localStorage.getItem(CHAT_SESSION_TOKEN_KEY) ?? undefined;
        }

        const currentSession = await getOrCreateChatSession(db, {
          sessionToken: storedToken,
          userId: user?.uid ?? props.userId ?? null,
          userType: props.userType ?? null,
        });

        if (isMounted) {
          setSession(currentSession);
          if (
            typeof window !== "undefined" &&
            currentSession.sessionToken
          ) {
            window.localStorage.setItem(
              CHAT_SESSION_TOKEN_KEY,
              currentSession.sessionToken
            );
          }
        }
      } catch (error) {
        console.error("Failed to initialize chat session:", error);
      } finally {
        if (isMounted) {
          setLoadingSession(false);
        }
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!session) return;

    setLoadingMessages(true);
    const unsubscribe = listenToMessages(db, session.id, (msgs) => {
      setMessages(msgs);
      setLoadingMessages(false);
    });

    return () => {
      unsubscribe();
    };
  }, [session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!session || !input.trim()) return;

    const text = input.trim();
    setInput("");

    try {
      // 1) Save in Firestore as usual
      await sendUserMessage(db, session, text);

      // 2) If session is in support mode, forward to WhatsApp
      if (session.status === "waiting_agent" || session.status === "agent") {
        try {
          await fetch("/api/chat/forward-user-message", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionId: session.id,
              sessionToken: session.sessionToken,
              text,
            }),
          });
        } catch (err) {
          console.error("Failed to forward message to WhatsApp:", err);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Restore text in case of error
      setInput(text);
    }
  };

  const handleRequestSupport = async () => {
    if (!session) return;

    setRequestingSupport(true);
    try {
      await markSessionWaitingForAgent(db, session);
      // Optimistically update local session state
      setSession((prev) =>
        prev ? { ...prev, status: "waiting_agent" } : prev
      );
      await sendSystemMessage(
        db,
        session,
        "تم تحويل المحادثة إلى خدمة العملاء، برجاء الانتظار..."
      );

      try {
        let sessionToken: string | undefined;

        if (typeof window !== "undefined") {
          sessionToken =
            window.localStorage.getItem(CHAT_SESSION_TOKEN_KEY) ?? undefined;
        }

        const lastMessage =
          messages.length > 0 ? messages[messages.length - 1].text : undefined;

        await fetch("/api/chat/notify-support", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId: session.id,
            sessionToken,
            lastMessage,
            userId: user?.uid ?? props.userId ?? null,
            userType: props.userType ?? null,
            userName: props.userName ?? null,
            userEmail: props.userEmail ?? null,
          }),
        });
      } catch (error) {
        console.error("Error calling notify-support API:", error);
      }
    } catch (error) {
      console.error("Error requesting support:", error);
    } finally {
      setRequestingSupport(false);
    }
  };

  if (loadingSession) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] border border-slate-200 rounded-2xl bg-slate-50 shadow-xl p-8" dir="rtl">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        <p className="mt-4 text-sm text-slate-500 font-medium">...جاري تجهيز الدردشة</p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full max-h-[500px] border border-slate-200 rounded-2xl bg-slate-50 shadow-xl overflow-hidden text-right"
      dir="rtl"
    >
      {/* Header */}
      <div className="bg-white/80 backdrop-blur border-b border-slate-200 flex items-center justify-between px-4 py-3 sticky top-0 z-10">
        <div>
          <h3 className="font-bold text-slate-800 text-base">الدردشة مع خدمة العملاء</h3>
          <p className="text-xs text-slate-500 mt-0.5">سنحاول الرد عليك في أقرب وقت</p>
        </div>

        {/* Status Badge */}
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium border ${
            session?.status === "agent"
              ? "bg-green-50 text-green-700 border-green-100"
              : session?.status === "waiting_agent"
              ? "bg-amber-50 text-amber-700 border-amber-100"
              : "bg-slate-100 text-slate-600 border-slate-200"
          }`}
        >
          {session?.status === "agent"
            ? "خدمة العملاء متصلة"
            : session?.status === "waiting_agent"
            ? "في انتظار خدمة العملاء"
            : "التواصل مع خدمه العملاء"}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-slate-50 scroll-smooth">
        
        {/* Request Support Banner */}
        {session?.status === "bot" && (
          <div className="bg-amber-50 text-amber-800 rounded-xl px-3 py-3 border border-amber-100 text-xs mb-4 flex flex-col gap-2 items-start">
            <p className="leading-relaxed">
               لو محتاج تتكلم مع خدمة العملاء اضغط على زر "طلب الخدمة".
            </p>
            <button
              onClick={handleRequestSupport}
              disabled={requestingSupport}
              className="px-3 py-1.5 text-xs font-medium rounded-full border border-amber-200 bg-white text-amber-700 hover:bg-amber-100 transition-colors shadow-sm"
            >
              {requestingSupport ? "جاري الطلب..." : "طلب خدمة العملاء"}
            </button>
          </div>
        )}

        {loadingMessages ? (
          <div className="space-y-4 pt-2">
            <div className="flex justify-start">
              <div className="h-10 w-[60%] bg-slate-200 animate-pulse rounded-2xl rounded-br-md" />
            </div>
            <div className="flex justify-end">
              <div className="h-10 w-[60%] bg-slate-200 animate-pulse rounded-2xl rounded-bl-md" />
            </div>
            <div className="flex justify-start">
              <div className="h-10 w-[40%] bg-slate-200 animate-pulse rounded-2xl rounded-br-md" />
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.senderType === "user";
            return (
              <div
                key={msg.id}
                className={`flex mb-1 ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-2xl px-3 py-2 max-w-[70%] text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? "bg-blue-600 text-white rounded-bl-md"
                      : msg.senderType === "bot"
                      ? "bg-violet-100 text-violet-900 rounded-br-md"
                      : "bg-slate-200 text-slate-900 rounded-br-md"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer / Input */}
      <div className="bg-white border-t border-slate-200 px-3 py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400"
            placeholder="اكتب رسالتك هنا..."
            dir="rtl"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="rounded-xl px-4 py-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            إرسال
          </button>
        </div>
      </div>
    </div>
  );
}
