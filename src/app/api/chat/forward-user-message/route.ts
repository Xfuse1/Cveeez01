import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { CHAT_WHATSAPP_MESSAGES_COLLECTION } from "@/lib/chat/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, sessionToken, text } = body ?? {};

    if (!sessionId || !text) {
      return NextResponse.json(
        { error: "sessionId and text are required" },
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

    // Send ONLY the clean user text to WhatsApp
    const messageText = text;

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
      let errorBody: unknown;
      try {
        errorBody = await res.json();
      } catch {
        errorBody = await res.text();
      }

      console.error("WhatsApp forward API error:", res.status, errorBody);
      return NextResponse.json(
        { error: "Failed to forward message to WhatsApp", details: errorBody },
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
        console.error("Failed to store WhatsApp message mapping (forward-user-message):", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("forward-user-message route error:", error);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
