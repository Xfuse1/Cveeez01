// src/app/api/chat/forward-user-message/route.ts
import { NextRequest, NextResponse } from "next/server";

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

    const messageText =
      `رسالة جديدة من العميل.\n` +
      `Session ID: ${sessionId}\n` +
      (sessionToken ? `Session Token: ${sessionToken}\n` : "") +
      `نص الرسالة:\n${text}\n\n` +
      `للاستمرار في الرد على هذا العميل، ابدأ ردك بـ #${sessionId}`;

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("forward-user-message route error:", error);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
