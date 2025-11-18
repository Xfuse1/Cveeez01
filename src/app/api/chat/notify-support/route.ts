import { NextRequest, NextResponse } from "next/server";

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

    const messageText =
      `عميل طلب التحدث مع خدمة العملاء.\\n` +
      `Session ID: ${sessionId}\\n` +
      (sessionToken ? `Session Token: ${sessionToken}\\n` : "") +
      (lastMessage ? `آخر رسالة من العميل: ${lastMessage}\\n` : "") +
      `\\nالرد على هذه الرسالة سيظهر للعميل داخل الشات في الموقع.`;

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("notify-support route error:", error);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
