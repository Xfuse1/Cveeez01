import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  getDoc,
  getDocs,
  query,
  where,
  limit,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import {
  CHAT_MESSAGES_COLLECTION,
  CHAT_SESSIONS_COLLECTION,
  CHAT_WHATSAPP_MESSAGES_COLLECTION,
} from "@/lib/chat/constants";
import type { ChatSession } from "@/lib/chat/types";

// Try to extract #SESSION_ID from the body, but make it OPTIONAL.
// If there is no #ID, we still return the text, and we'll route by agent phone.
function extractSessionIdAndText(body: string): { sessionId?: string; text: string } {
  if (!body) return { text: "" };

  // Look for "#<id>" anywhere in the message
  const match = body.match(/#\s*([A-Za-z0-9_-]+)/);

  if (!match) {
    return { text: body.trim() };
  }

  const sessionId = match[1];
  const text = body.replace(match[0], "").trim();

  return { sessionId, text };
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const entry = data?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const messages = value?.messages;
    const msg =
      Array.isArray(messages) && messages.length > 0 ? messages[0] : undefined;

    if (!msg || msg.type !== "text" || !msg.text?.body) {
      // Not a text message or invalid payload – just return 200
      return NextResponse.json({ received: true });
    }

    const from = msg.from; // agent phone (WhatsApp ID)
    const bodyText: string = msg.text.body;
    const contextId: string | undefined = msg.context?.id;

    const { sessionId: explicitSessionId, text } = extractSessionIdAndText(bodyText);

    if (!text) {
      console.warn("Webhook text empty, ignoring message");
      return NextResponse.json({ received: true, ignored: true });
    }

    let sessionRef;
    let sessionSnap;

    if (explicitSessionId) {
      // Case 1: Explicit #SESSION_ID in text (highest priority)
      sessionRef = doc(db, CHAT_SESSIONS_COLLECTION, explicitSessionId);
      sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) {
        console.warn("Session not found for id from WhatsApp:", explicitSessionId);
        return NextResponse.json({ received: true, sessionMissing: true });
      }
    } else if (contextId) {
      // Case 2: context.id mapping (reply to a specific message)
      const mapQuery = query(
        collection(db, CHAT_WHATSAPP_MESSAGES_COLLECTION),
        where("whatsappMessageId", "==", contextId),
        limit(1)
      );
      const mapSnap = await getDocs(mapQuery);

      if (mapSnap.empty) {
        console.warn("No mapping found for context.id:", contextId);
        
        // Fallback to Case 3 logic if mapping fails
        const fallbackQuery = query(
          collection(db, CHAT_SESSIONS_COLLECTION),
          where("assignedAgentId", "==", from),
          limit(1)
        );
        const fallbackSnap = await getDocs(fallbackQuery);

        if (fallbackSnap.empty) {
          console.warn("No active session linked to agent phone:", from);
          return NextResponse.json({ received: true, ignored: true });
        }

        const docSnap = fallbackSnap.docs[0];
        sessionRef = doc(db, CHAT_SESSIONS_COLLECTION, docSnap.id);
        sessionSnap = docSnap;
      } else {
        const mappedSessionId = mapSnap.docs[0].data().sessionId as string;
        sessionRef = doc(db, CHAT_SESSIONS_COLLECTION, mappedSessionId);
        sessionSnap = await getDoc(sessionRef);

        if (!sessionSnap.exists()) {
          console.warn("Session not found for mapped sessionId:", mappedSessionId);
          return NextResponse.json({ received: true, sessionMissing: true });
        }
      }
    } else {
      // Case 3: Fallback: by assignedAgentId == from
      const fallbackQuery = query(
        collection(db, CHAT_SESSIONS_COLLECTION),
        where("assignedAgentId", "==", from),
        limit(1)
      );
      const fallbackSnap = await getDocs(fallbackQuery);

      if (fallbackSnap.empty) {
        console.warn("No active session linked to agent phone:", from);
        return NextResponse.json({ received: true, ignored: true });
      }

      const docSnap = fallbackSnap.docs[0];
      sessionRef = doc(db, CHAT_SESSIONS_COLLECTION, docSnap.id);
      sessionSnap = docSnap;
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

    // If you want to also store incoming WhatsApp message ids:
    if (msg.id) {
      try {
        await addDoc(collection(db, CHAT_WHATSAPP_MESSAGES_COLLECTION), {
          sessionId: session.id,
          whatsappMessageId: msg.id,
          direction: "from_agent",
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error("Failed to store incoming WhatsApp message mapping:", err);
      }
    }

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
