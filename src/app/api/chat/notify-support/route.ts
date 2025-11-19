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

    // -----------------------------------
    // 1) نجيب بيانات الجلسة + نحدد UID للمستخدم
    // -----------------------------------
    let customerName: string | undefined;
    let customerEmail: string | undefined;
    let userUid: string | undefined;
    let sessionRef = doc(db, CHAT_SESSIONS_COLLECTION, sessionId);

    try {
      const sessionSnap = await getDoc(sessionRef);

      if (sessionSnap.exists()) {
        const sessionData = sessionSnap.data() as any;

        // نحاول نجيب UID بأكتر من اسم احتمال
        userUid =
          sessionData.userId ||
          sessionData.authUid ||
          sessionData.uid ||
          undefined;

        // لو الاسم/الإيميل موجودين على الجلسة نفسها نخليهم fallback
        customerName =
          sessionData.userName ||
          sessionData.fullName ||
          sessionData.name ||
          customerName;

        customerEmail =
          sessionData.userEmail ||
          sessionData.email ||
          customerEmail;

        // لو عندنا UID نحاول نجيب الداتا من seekers / employers
        if (userUid) {
          // 1) نحاول من seekers أولاً
          try {
            const seekerRef = doc(db, "seekers", userUid);
            const seekerSnap = await getDoc(seekerRef);

            if (seekerSnap.exists()) {
              const seeker = seekerSnap.data() as any;
              customerName =
                customerName ||
                seeker.fullName ||
                seeker.name ||
                undefined;
              customerEmail = customerEmail || seeker.email || undefined;
            } else {
              // 2) لو مش seeker نجرب employers
              try {
                const employerRef = doc(db, "employers", userUid);
                const employerSnap = await getDoc(employerRef);
                if (employerSnap.exists()) {
                  const employer = employerSnap.data() as any;
                  customerName =
                    customerName ||
                    employer.contactPersonName ||
                    employer.companyNameEn ||
                    employer.companyNameAr ||
                    undefined;
                  customerEmail = customerEmail || employer.email || undefined;
                }
              } catch (err) {
                console.error(
                  "Failed to load employer document for notify-support:",
                  err
                );
              }
            }
          } catch (err) {
            console.error(
              "Failed to load seeker document for notify-support:",
              err
            );
          }
        }
      }
    } catch (err) {
      console.error("Failed to load chat session for notify-support:", err);
    }

    // -----------------------------------
    // 2) إعداد بيانات واتساب (env vars)
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
    // 3) تكوين نص الرسالة اللي بتروح لخدمة العملاء
    //    (أول رسالة بس لما العميل يطلب خدمة العملاء)
    // -----------------------------------
    const messageLines: string[] = [];

    messageLines.push("عميل طلب التحدث مع خدمة العملاء.");

    if (customerName) {
      messageLines.push(`اسم العميل: ${customerName}`);
    }

    if (customerEmail) {
      messageLines.push(`ايميل العميل: ${customerEmail}`);
    }

    if (lastMessage) {
      messageLines.push(`آخر رسالة من العميل: ${lastMessage}`);
    }

    messageLines.push("");
    messageLines.push("سيتم تحويل المحادثة لهذا الرقم داخل لوحة التحكم.");

    const messageText = messageLines.join("\n");

    const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

    // -----------------------------------
    // 4) إرسال الرسالة إلى WhatsApp
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
    // 5) نحاول نجيب الـ whatsappMessageId ونخزّنه mapping
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
        console.error(
          "Failed to store WhatsApp message mapping (notify-support):",
          err
        );
      }
    }

    // -----------------------------------
    // 6) تحديث حالة الجلسة إلى waiting_agent وربطها برقم الموظف
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
      // نكتفي بالـ log وممنوع نكسر الـ response
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
