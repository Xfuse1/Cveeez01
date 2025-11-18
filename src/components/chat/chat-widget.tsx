"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/firebase/config";
import type { ChatSession, ChatMessage } from "@/lib/chat/types";
import {
  getOrCreateChatSession,
  sendUserMessage,
  listenToMessages,
  markSessionWaitingForAgent,
  sendSystemMessage,
} from "@/lib/chat/chat-service";

const CHAT_SESSION_TOKEN_KEY = "chat_session_token";

export function ChatWidget() {
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
          userId: null, // Placeholder for future user integration
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
      await sendUserMessage(db, session, text);
    } catch (error) {
      console.error("Error sending message:", error);
      // Optionally, restore the input field text on error
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
    return <div className="p-4 text-center">Loading chat...</div>;
  }

  return (
    <div className="flex flex-col h-full max-h-[500px] border rounded-lg bg-white shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
        <span className="text-sm text-gray-700">
          {session?.status === "waiting_agent"
            ? "تم طلب التحدث مع خدمة العملاء، برجاء الانتظار..."
            : "تستطيع طلب التحدث مع خدمة العملاء في أي وقت."}
        </span>
        <button
          onClick={handleRequestSupport}
          disabled={
            !session ||
            requestingSupport ||
            session?.status === "waiting_agent"
          }
          className="text-xs px-2 py-1 border rounded-md bg-blue-500 text-white disabled:bg-gray-300"
        >
          {session?.status === "waiting_agent"
            ? "تم طلب الخدمة"
            : "طلب خدمة العملاء"}
        </button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {loadingMessages ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex mb-2 ${
                msg.senderType === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-lg px-3 py-2 max-w-xs ${
                  msg.senderType === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            disabled={!input.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
