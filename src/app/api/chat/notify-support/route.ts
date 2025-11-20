import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/config";
import {
  doc,
  updateDoc,
  serverTimestamp,
  collection,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
} from "firebase/firestore";
import {
  CHAT_SESSIONS_COLLECTION,
  CHAT_WHATSAPP_MESSAGES_COLLECTION,
} from "@/lib/chat/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      sessionToken,
      lastMessage,
      userId: bodyUserId, // This is treated as authUid fallback
      userType,
      userName: rawUserName,
      userEmail: rawUserEmail,
    } = body ?? {};

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    // Validate session exists
    const sessionRef = doc(db, CHAT_SESSIONS_COLLECTION, sessionId);
    const sessionSnap = await getDoc(sessionRef);
    if (!sessionSnap.exists()) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }
    const sessionData = sessionSnap.data() as any;

    // 1. Extract authUid
    // Prefer session.userId (should be authUid), fallback to body.userId
    const authUid = sessionData.userId || bodyUserId || null;
    
    console.log('notify-support: authUid', authUid);

    // 2. Resolve Profile
    let resolvedUserName = rawUserName ?? null;
    let resolvedUserEmail = rawUserEmail ?? null;
    let resolvedUserType = userType ?? null; // Start with provided type or null

    if (authUid) {
      // Try finding in employers first
      const employersRef = collection(db, "employers");
      const empQuery = query(employersRef, where("authUid", "==", authUid), limit(1));
      const empSnap = await getDocs(empQuery);

      if (!empSnap.empty) {
        const data = empSnap.docs[0].data();
        resolvedUserType = "employer";
        resolvedUserName =
          (data.contactPersonName as string) ||
          (data.companyNameEn as string) ||
          (data.companyNameAr as string) ||
          resolvedUserName;
        resolvedUserEmail = (data.email as string) ?? resolvedUserEmail;
      } else {
        // Try finding in seekers
        const seekersRef = collection(db, "seekers");
        const seekerQuery = query(seekersRef, where("authUid", "==", authUid), limit(1));
        const seekerSnap = await getDocs(seekerQuery);

        if (!seekerSnap.empty) {
          const data = seekerSnap.docs[0].data();
          resolvedUserType = "seeker";
          resolvedUserName = (data.fullName as string) ?? resolvedUserName;
          resolvedUserEmail = (data.email as string) ?? resolvedUserEmail;
        }
      }
    }

    console.log('notify-support: resolvedUser', { resolvedUserType, resolvedUserName, resolvedUserEmail });

    // 3. Update the chatSessions document
    await updateDoc(sessionRef, {
      updatedAt: serverTimestamp(),
      lastMessageAt: serverTimestamp(),
      userId: authUid ?? null,
      userType: resolvedUserType ?? null,
      userName: resolvedUserName ?? null,
      userEmail: resolvedUserEmail ?? null,
    });

    // -----------------------------------
    // WhatsApp Configuration
    // -----------------------------------
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

    // -----------------------------------
    // Build Message (Arabic Format)
    // -----------------------------------
    const messageText = 
      "عميل طلب التحدث مع خدمة العملاء.\n" +
      (resolvedUserType ? `النوع: ${resolvedUserType === "seeker" ? "باحث عن عمل" : "صاحب عمل"}\n` : "") +
      (resolvedUserName ? `الاسم: ${resolvedUserName}\n` : "") +
      (resolvedUserEmail ? `الإيميل: ${resolvedUserEmail}\n` : "") +
      "سيتم تحويل المحادثة لهذا الرقم داخل لوحة التحكم.";

    const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

    // -----------------------------------
    // Send to WhatsApp
    // -----------------------------------
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

    // -----------------------------------
    // Store WhatsApp Message Mapping
    // -----------------------------------
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

    if (whatsappMessageId) {
      try {
        await addDoc(collection(db, CHAT_WHATSAPP_MESSAGES_COLLECTION), {
          sessionId,
          whatsappMessageId,
          direction: "to_agent",
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error("Failed to store WhatsApp message mapping:", err);
      }
    }

    // -----------------------------------
    // Update Session Status to waiting_agent
    // -----------------------------------
    try {
      await updateDoc(sessionRef, {
        status: "waiting_agent",
        assignedAgentId: agentPhone,
      });
    } catch (err) {
      console.error("Failed to update chat session status:", err);
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
