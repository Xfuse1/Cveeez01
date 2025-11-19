import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/config";
import {
  doc,
  updateDoc,
  serverTimestamp,
  collection,
  addDoc,
} from "firebase/firestore";
import {
  CHAT_SESSIONS_COLLECTION,
  CHAT_WHATSAPP_MESSAGES_COLLECTION,
} from "@/lib/chat/constants";

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

    // رسالة أبسط للموظف
    const messageText =
      `عميل طلب التحدث مع خدمة العملاء.\n` +
      (lastMessage ? `آخر رسالة من العميل: ${lastMessage}\n` : "") +
      `\nسيتم تحويل المحادثة لهذا الرقم داخل لوحة التحكم.`;

    const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

    // نقرأ الـ response كـ نص عشان ما نستخدمش json() و text() مع بعض بطريقه غلط
    const waRes = await fetch(url, {
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

    const rawBody = await waRes.text();

    if (!waRes.ok) {
      console.error("WhatsApp API error:", waRes.status, rawBody);
      return NextResponse.json(
        { error: "Failed to send WhatsApp message" },
        { status: 500 }
      );
    }

    // نحاول نفك الـ JSON لو محتاجين الـ messageId
    let whatsappMessageId: string | undefined;
    try {
      const data = rawBody ? JSON.parse(rawBody) : null;
      if (
        data &&
        Array.isArray(data.messages) &&
        data.messages.length > 0 &&
        data.messages[0]?.id
      ) {
        whatsappMessageId = data.messages[0].id as string;
      }
    } catch (err) {
      console.error("Failed to parse WhatsApp success JSON:", err, rawBody);
    }

    // لو قدرنا نجيب الـ messageId نخزّنه في chatWhatsappMessages
    if (whatsappMessageId) {
      try {
        await addDoc(collection(db, CHAT_WHATSAPP_MESSAGES_COLLECTION), {
          sessionId,
          whatsappMessageId,
          direction: "to_agent",
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error(
          "Failed to store WhatsApp message mapping (notify-support):",
          err
        );
      }
    }

    // نربط الجلسة برقم الواتساب بتاع الموظف + نحدّث الـ status
    try {
      const sessionRef = doc(db, CHAT_SESSIONS_COLLECTION, sessionId);
      await updateDoc(sessionRef, {
        status: "waiting_agent",
        assignedAgentId: agentPhone,
        updatedAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to update chat session after notify-support:", err);
      // ما نرميش error للمستخدم، يكفينا log
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
