import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  limit,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore";

import {
  ChatSession,
  ChatMessage,
} from "@/lib/chat/types";

import {
  CHAT_SESSIONS_COLLECTION,
  CHAT_MESSAGES_COLLECTION,
} from "@/lib/chat/constants";

function generateSessionToken(): string {
  if (
    typeof window !== "undefined" &&
    "crypto" in window &&
    "randomUUID" in window.crypto
  ) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

export async function getOrCreateChatSession(
  db: Firestore,
  options?: { sessionToken?: string; userId?: string | null; userType?: "seeker" | "employer" | null }
): Promise<ChatSession> {
  // لو عندنا sessionToken نحاول نجيب السيشن
  if (options?.sessionToken) {
    // Build query constraints
    const constraints = [where("sessionToken", "==", options.sessionToken)];
    
    // If we have a userId, we MUST filter by it to satisfy security rules
    // that require resource.data.userId == request.auth.uid
    if (options.userId) {
      constraints.push(where("userId", "==", options.userId));
    }

    const q = query(
      collection(db, CHAT_SESSIONS_COLLECTION),
      ...constraints,
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const snap = querySnapshot.docs[0];
      return { id: snap.id, ...snap.data() } as ChatSession;
    }
  }

  // مفيش سيشن → نعمل واحد جديد
  const newSessionToken = generateSessionToken();
  const newSessionRef = doc(collection(db, CHAT_SESSIONS_COLLECTION));

  const newSessionData = {
    sessionToken: newSessionToken,
    userId: options?.userId ?? null,
    userType: options?.userType ?? null,
    userName: null,
    userEmail: null,
    status: "bot" as const,
    channel: "web" as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessageAt: serverTimestamp(),
    assignedAgentId: null,
    whatsappUserPhone: null,
  };

  await setDoc(newSessionRef, newSessionData);

  return {
    id: newSessionRef.id,
    ...(newSessionData as Omit<ChatSession, "id">),
  };
}

export async function sendUserMessage(
  db: Firestore,
  session: ChatSession,
  text: string
): Promise<void> {
  const messagesCollection = collection(db, CHAT_MESSAGES_COLLECTION);

  await addDoc(messagesCollection, {
    sessionId: session.id,
    userId: session.userId ?? null, // Denormalize userId for security rules
    senderType: "user",
    senderId: session.userId ?? null,
    text,
    createdAt: serverTimestamp(),
  });

  const sessionRef = doc(db, CHAT_SESSIONS_COLLECTION, session.id);

  await updateDoc(sessionRef, {
    updatedAt: serverTimestamp(),
    lastMessageAt: serverTimestamp(),
  });
}

export function listenToMessages(
  db: Firestore,
  sessionId: string,
  callback: (messages: ChatMessage[]) => void
): Unsubscribe {
  const q = query(
    collection(db, CHAT_MESSAGES_COLLECTION),
    where("sessionId", "==", sessionId),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (querySnapshot) => {
    const messages: ChatMessage[] = querySnapshot.docs.map((snap) => {
      return { id: snap.id, ...snap.data() } as ChatMessage;
    });
    callback(messages);
  });
}

export async function markSessionWaitingForAgent(
  db: Firestore,
  session: ChatSession
): Promise<void> {
  const sessionRef = doc(db, CHAT_SESSIONS_COLLECTION, session.id);

  await updateDoc(sessionRef, {
    status: "waiting_agent",
    updatedAt: serverTimestamp(),
  });
}

export async function sendSystemMessage(
  db: Firestore,
  session: ChatSession,
  text: string
): Promise<void> {
  const messagesCollection = collection(db, CHAT_MESSAGES_COLLECTION);

  await addDoc(messagesCollection, {
    sessionId: session.id,
    userId: session.userId ?? null, // Denormalize userId for security rules
    senderType: "bot",
    senderId: null,
    text,
    createdAt: serverTimestamp(),
  });

  const sessionRef = doc(db, CHAT_SESSIONS_COLLECTION, session.id);

  await updateDoc(sessionRef, {
    updatedAt: serverTimestamp(),
    lastMessageAt: serverTimestamp(),
  });
}
