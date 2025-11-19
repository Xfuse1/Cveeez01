import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/config";
import {
  doc,
  updateDoc,
  serverTimestamp,
  collection,
  addDoc,
  getDoc,
} from "firebase/firestore";
import {
  CHAT_SESSIONS_COLLECTION,
  CHAT_WHATSAPP_MESSAGES_COLLECTION,
} from "@/lib/chat/constants";

// Helper to fetch user info from Firestore
async function resolveUserInfo(userId?: string | null, userType?: "seeker" | "employer" | null) {
  let name: string | undefined;
  let email: string | undefined;
  let type: "Seeker" | "Employer" | undefined;

  if (!userId) return { name, email, type };

  // 1. Try Seekers
  if (!userType || userType === "seeker") {
    try {
      const seekerRef = doc(db, "seekers", userId);
      const seekerSnap = await getDoc(seekerRef);
      if (seekerSnap.exists()) {
        const seeker = seekerSnap.data() as any;
        name = seeker.fullName || seeker.name || name;
        email = seeker.email || email;
        type = "Seeker";
        return { name, email, type };
      }
    } catch (e) {
      console.error("Error fetching seeker:", e);
    }
  }

  // 2. Try Employers
  try {
    const employerRef = doc(db, "employers", userId);
    const employerSnap = await getDoc(employerRef);
    if (employerSnap.exists()) {
      const employer = employerSnap.data() as any;
      name = employer.contactPersonName || employer.companyNameEn || employer.companyNameAr || name;
      email = employer.email || email;
      type = "Employer";
    }
  } catch (e) {
    console.error("Error fetching employer:", e);
  }

  return { name, email, type };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, sessionToken, lastMessage, userId, userType, userName, userEmail } = body ?? {};

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    const sessionRef = doc(db, CHAT_SESSIONS_COLLECTION, sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    // Update session with user info if provided and missing
    if (sessionSnap.exists()) {
      const sessionData = sessionSnap.data();
      const sessionUpdate: any = {
        updatedAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
      };

      let needsUpdate = false;

      if (userId && !sessionData?.userId) {
        sessionUpdate.userId = userId;
        needsUpdate = true;
      }
      if (userType && !sessionData?.userType) {
        sessionUpdate.userType = userType;
        needsUpdate = true;
      }
      if (userName && !sessionData?.userName) {
        sessionUpdate.userName = userName;
        needsUpdate = true;
      }
      if (userEmail && !sessionData?.userEmail) {
        sessionUpdate.userEmail = userEmail;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await updateDoc(sessionRef, sessionUpdate);
      }
    }

    // Resolve final user info for WhatsApp message
    const sessionData = sessionSnap.exists() ? (sessionSnap.data() as any) : {};
    let finalName = userName ?? sessionData.userName ?? undefined;
    let finalEmail = userEmail ?? sessionData.userEmail ?? undefined;
    
    // Determine type safely
    let finalType: "Seeker" | "Employer" | undefined;
    const rawType = userType ?? sessionData.userType;
    if (rawType?.toLowerCase() === "seeker") finalType = "Seeker";
    else if (rawType?.toLowerCase() === "employer") finalType = "Employer";

    // Fetch from Firestore if we have userId
    const targetUserId = userId ?? sessionData.userId;
    if (targetUserId) {
      const resolved = await resolveUserInfo(targetUserId, finalType ? (finalType.toLowerCase() as "seeker" | "employer") : null);
      finalName = finalName ?? resolved.name;
      finalEmail = finalEmail ?? resolved.email;
      finalType = finalType ?? resolved.type;
    }

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
    // Build Message
    // -----------------------------------
    const lines: string[] = [];
    lines.push("عميل طلب التحدث مع خدمة العملاء.");

    if (finalType) lines.push(`Type: ${finalType}`);
    if (finalName) lines.push(`Name: ${finalName}`);
    if (finalEmail) lines.push(`Email: ${finalEmail}`);

    if (lastMessage) {
      lines.push(`آخر رسالة من العميل: ${lastMessage}`);
    }

    lines.push("");
    lines.push("سيتم تحويل المحادثة لهذا الرقم داخل لوحة التحكم.");

    const messageText = lines.join("\n");
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
    // Update Session Status
    // -----------------------------------
    try {
      await updateDoc(sessionRef, {
        status: "waiting_agent",
        assignedAgentId: agentPhone,
        updatedAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
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
