export type ChatSessionStatus = 'bot' | 'waiting_agent' | 'agent' | 'closed';

export type ChatSenderType = 'user' | 'bot' | 'agent' | 'whatsapp';

export interface ChatSession {
  id: string;              // Firestore document id
  userId?: string | null;  // Optional auth user id
  sessionToken: string;    // Token stored in localStorage to link browser to this session
  status: ChatSessionStatus;
  channel: 'web';
  createdAt: any;          // Will be Firestore Timestamp later
  updatedAt: any;
  lastMessageAt: any;
  assignedAgentId?: string | null;
  whatsappUserPhone?: string | null;
}

export interface ChatMessage {
  id: string;              // Firestore document id
  sessionId: string;       // Reference to ChatSession.id
  senderType: ChatSenderType;
  senderId?: string | null;
  text: string;
  createdAt: any;          // Will be Firestore Timestamp later
}

export interface ChatWhatsappMessage {
  id: string;                 // Firestore document id
  sessionId: string;          // Related chat session
  whatsappMessageId: string;  // Message ID from WhatsApp (used in context.id)
  direction: 'to_agent' | 'from_agent';
  createdAt: any;             // Firestore Timestamp
}
