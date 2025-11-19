import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  getDoc,
  type Firestore,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import {
  CHAT_MESSAGES_COLLECTION,
  CHAT_SESSIONS_COLLECTION,
} from "@/lib/chat/constants";
import type { ChatSession } from "@/lib/chat/types";

function extractSessionIdAndText(body: string): { sessionId?: string; text?: string } {
  if (!body) return {};

  const normalized = body.trim();

  // شكل مرن:
  // #  + مسافات اختيارية
  // sessionId (حروف/أرقام/ - أو _)
  // مسافات اختيارية
  // ممكن ":" أو "-" بعد الـ id
  // مسافات اختيارية
  // باقي الرسالة
  const match = normalized.match(/^#\s*([A-Za-z0-9_-]+)\s*[:\-]?\s*(.*)$/);

  if (!match) {
    console.warn("Could not parse sessionId from body:", body);
    return {};
  }

  const sessionId = match[1];
  const text = match[2] ?? "";

  console.log("Parsed WhatsApp message", { sessionId, text });

  return { sessionId, text };
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const entry = data?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const messages = value?.messages;
    const msg = Array.isArray(messages) && messages.length > 0 ? messages[0] : undefined;

    if (!msg || msg.type !== "text" || !msg.text?.body) {
      // Not a text message or invalid payload – just return 200
      return NextResponse.json({ received: true });
    }

    const from = msg.from; // agent phone (WhatsApp ID)
    const bodyText: string = msg.text.body;

    const { sessionId, text } = extractSessionIdAndText(bodyText);

    if (!sessionId || !text) {
      console.warn("Webhook message without valid sessionId pattern:", bodyText);
      return NextResponse.json({ received: true, ignored: true });
    }

    // Now we have sessionId and the agent's text -> write to Firestore
    const sessionRef = doc(db, CHAT_SESSIONS_COLLECTION, sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      console.warn("Session not found for id from WhatsApp:", sessionId);
      return NextResponse.json({ received: true, sessionMissing: true });
    }

    const session = {
      id: sessionSnap.id,
      ...sessionSnap.data(),
    } as ChatSession;

    // Add new message as agent message
    await addDoc(collection(db, CHAT_MESSAGES_COLLECTION), {
      sessionId: session.id,
      senderType: "agent",
      senderId: from ?? null,
      text,
      createdAt: serverTimestamp(),
    });

    // Update session status + timestamps
    await updateDoc(sessionRef, {
      status: "agent",
      updatedAt: serverTimestamp(),
      lastMessageAt: serverTimestamp(),
      assignedAgentId: from ?? null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("whatsapp-webhook route error:", error);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token && challenge && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}
