import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/config";
import { doc, updateDoc, serverTimestamp, collection, addDoc } from "firebase/firestore";
import { CHAT_SESSIONS_COLLECTION, CHAT_WHATSAPP_MESSAGES_COLLECTION } from "@/lib/chat/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, sessionToken, lastMessage } = body ?? {};

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const agentPhone = process.env.WHATSAPP_AGENT_PHONE;

    if (!phoneNumberId || !accessToken || !agentPhone) {
      console.error("Missing WhatsApp env vars");
      return NextResponse.json(
        { error: "WhatsApp is not configured on the server" },
        { status: 500 }
      );
    }

    // Cleaner message to the agent: just tell them a customer asked for support
    const messageText =
      `عميل طلب التحدث مع خدمة العملاء.\n` +
      (lastMessage ? `آخر رسالة من العميل: ${lastMessage}\n` : "") +
      `\nسيتم الآن تحويل المحادثة إلى هذا الرقم داخل لوحة التحكم في الموقع.`;

    const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: agentPhone,
        type: "text",
        text: {
          body: messageText,
        },
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("WhatsApp API error:", res.status, errorText);
      return NextResponse.json(
        { error: "Failed to send WhatsApp message" },
        { status: 500 }
      );
    }

    const data = await res.json();
    
    const whatsappMessageId: string | undefined =
      Array.isArray(data?.messages) && data.messages.length > 0
        ? data.messages[0]?.id
        : undefined;

    if (whatsappMessageId) {
      try {
        await addDoc(collection(db, CHAT_WHATSAPP_MESSAGES_COLLECTION), {
          sessionId,
          whatsappMessageId,
          direction: "to_agent",
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error("Failed to store WhatsApp message mapping (notify-support):", err);
      }
    }

    // IMPORTANT: link this chat session to the agent phone so future replies
    // can be routed WITHOUT needing #SESSION_ID in every message
    try {
      const sessionRef = doc(db, CHAT_SESSIONS_COLLECTION, sessionId);
      await updateDoc(sessionRef, {
        status: "waiting_agent",
        assignedAgentId: agentPhone,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to update chat session after notify-support:", err);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("notify-support route error:", error);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
