# Real-Time Chat Implementation - Proposed Changes

## Overview

This document shows the proposed changes to convert the Talent Space chat from one-time fetches (using `getDocs`) to real-time listeners (using `onSnapshot`).

---

## Current State Analysis

### Problem
- **File**: `src/services/group-chat-service.ts` - `getMessages()` method
- **Issue**: Uses `getDocs()` for one-time fetch
- **Impact**: Messages don't update in real-time; requires manual refresh

```typescript
// Current implementation - one-time fetch
static async getMessages(groupId?: string): Promise<{ 
  success: boolean; 
  data: GroupChatMessage[]; 
}> {
  // Uses getDocs() - fetches once then stops
  const snapshot = await getDocs(messagesQuery);
  // ...returns data
}
```

### Where It's Used
1. `src/components/talent-space/ChatInterface.tsx` - Calls `getMessages()` in `loadMessages()`
2. `src/components/GroupChat.tsx` - Calls `GroupChatService.getMessages()`
3. `src/services/talent-space.ts` - Wraps `GroupChatService.getMessages()`

---

## Proposed Solution

### Step 1: Add Real-Time Listener Method to GroupChatService

**File**: `src/services/group-chat-service.ts`

Add a new method alongside the existing `getMessages()`:

```typescript
/**
 * ✅ Real-time listener for chat messages using onSnapshot
 * 
 * Converts from one-time fetch (getDocs) to real-time listener (onSnapshot)
 * 
 * @param groupId - Optional group ID to filter messages by
 * @param callback - Function called whenever messages update in real-time
 * @returns Unsubscribe function to clean up the listener when component unmounts
 * 
 * @example
 * ```typescript
 * const unsubscribe = GroupChatService.subscribeToMessages(
 *   groupId,
 *   (messages) => setMessages(messages)
 * );
 * 
 * // On component unmount:
 * useEffect(() => {
 *   return () => unsubscribe();
 * }, []);
 * ```
 */
static subscribeToMessages(
  groupId: string | undefined,
  callback: (messages: GroupChatMessage[]) => void
): Unsubscribe {
  try {
    // Use 'group_chat_messages' for group chats, 'group_chat' for global chat
    const collectionName = groupId ? 'group_chat_messages' : 'group_chat';
    const messagesRef = collection(db, collectionName);

    // Build query constraints
    const constraints: QueryConstraint[] = [
      orderBy('createdAt', 'asc') // Ascending for chronological display
    ];

    // Filter by groupId if provided
    if (groupId) {
      constraints.unshift(where('groupId', '==', groupId));
    }

    const messagesQuery = query(messagesRef, ...constraints);

    // Set up real-time listener with onSnapshot
    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messages: GroupChatMessage[] = [];

        snapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          messages.push({
            id: docSnapshot.id,
            content: data.content,
            groupId: data.groupId,
            sender: {
              id: data.sender.id,
              name: data.sender.name,
              avatar: data.sender.avatar,
            },
            createdAt: data.createdAt?.toDate() || new Date(),
            type: data.type || 'text',
            replyTo: data.replyTo,
            reactions: data.reactions,
          } as GroupChatMessage);
        });

        // Update cached messages
        this.messages = messages;

        // Invoke callback with updated messages
        callback(messages);
      },
      (error) => {
        console.error(`❌ Error listening to ${collectionName}:`, error);
        // Call callback with empty array on error
        callback([]);
      }
    );

    return unsubscribe;
  } catch (error: any) {
    console.error('❌ Error setting up subscribeToMessages listener:', error.message);
    // Return a no-op unsubscribe function
    return () => {};
  }
}
```

---

### Step 2: Update ChatInterface Component

**File**: `src/components/talent-space/ChatInterface.tsx`

Replace the `loadMessages()` function and `useEffect` hook:

#### Before
```typescript
const loadMessages = async () => {
  setIsLoading(true);
  try {
    const fetchedMessages = await getMessages(groupId);
    setMessages(fetchedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    toast({
      title: language === 'ar' ? 'خطأ' : 'Error',
      description: language === 'ar' ? 'فشل في جلب الرسائل.' : 'Failed to fetch messages.',
      variant: 'destructive'
    });
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  loadMessages();
}, [groupId]);
```

#### After
```typescript
useEffect(() => {
  setIsLoading(true);

  // Subscribe to real-time message updates
  const unsubscribe = GroupChatService.subscribeToMessages(
    groupId,
    (updatedMessages) => {
      setMessages(updatedMessages);
      setIsLoading(false);
    }
  );

  // Cleanup: Unsubscribe when component unmounts or groupId changes
  return () => {
    unsubscribe();
  };
}, [groupId]);
```

#### Required Imports Update
```typescript
// Add GroupChatService to imports
import { GroupChatService } from '@/services/group-chat-service';
```

---

### Step 3: Add Wrapper Function in talent-space.ts

**File**: `src/services/talent-space.ts`

Add a wrapper function for consistency:

```typescript
/**
 * Subscribe to real-time message updates
 * @param groupId - Optional group ID
 * @param callback - Function called with updated messages
 * @returns Unsubscribe function
 */
export function subscribeToMessages(
  groupId: string | undefined,
  callback: (messages: Message[]) => void
): () => void {
  return GroupChatService.subscribeToMessages(groupId, (groupMessages) => {
    // Convert GroupChatMessage to Message type
    const messages: Message[] = groupMessages.map(msg => ({
      id: msg.id,
      userId: msg.sender.id,
      groupId: msg.groupId,
      content: msg.content,
      createdAt: msg.createdAt.toISOString(),
    }));
    callback(messages);
  });
}
```

---

## Complete File Changes

### Change 1: src/services/group-chat-service.ts

**Location**: End of the `GroupChatService` class (before closing brace)

```typescript
  // ✅ جلب آخر الرسائل (للعرض السريع)
  static getCachedMessages(): GroupChatMessage[] {
    return this.messages;
  }

  /**
   * ✅ Real-time listener for chat messages using onSnapshot
   * 
   * REFACTORED: Converts from one-time fetch (getDocs) to real-time listener (onSnapshot)
   * 
   * @param groupId - Optional group ID to filter messages by
   * @param callback - Function called whenever messages update in real-time
   * @returns Unsubscribe function to clean up the listener when component unmounts
   * 
   * @example
   * ```typescript
   * const unsubscribe = GroupChatService.subscribeToMessages(
   *   groupId,
   *   (messages) => setMessages(messages)
   * );
   * 
   * // On component unmount:
   * useEffect(() => {
   *   return () => unsubscribe();
   * }, []);
   * ```
   */
  static subscribeToMessages(
    groupId: string | undefined,
    callback: (messages: GroupChatMessage[]) => void
  ): Unsubscribe {
    try {
      // Use 'group_chat_messages' for group chats, 'group_chat' for global chat
      const collectionName = groupId ? 'group_chat_messages' : 'group_chat';
      const messagesRef = collection(db, collectionName);

      // Build query constraints
      const constraints: QueryConstraint[] = [
        orderBy('createdAt', 'asc') // Ascending for chronological display
      ];

      // Filter by groupId if provided
      if (groupId) {
        constraints.unshift(where('groupId', '==', groupId));
      }

      const messagesQuery = query(messagesRef, ...constraints);

      // Set up real-time listener with onSnapshot
      const unsubscribe = onSnapshot(
        messagesQuery,
        (snapshot) => {
          const messages: GroupChatMessage[] = [];

          snapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            messages.push({
              id: docSnapshot.id,
              content: data.content,
              groupId: data.groupId,
              sender: {
                id: data.sender.id,
                name: data.sender.name,
                avatar: data.sender.avatar,
              },
              createdAt: data.createdAt?.toDate() || new Date(),
              type: data.type || 'text',
              replyTo: data.replyTo,
              reactions: data.reactions,
            } as GroupChatMessage);
          });

          // Update cached messages
          this.messages = messages;

          // Invoke callback with updated messages
          callback(messages);
        },
        (error) => {
          console.error(`❌ Error listening to ${collectionName}:`, error);
          // Call callback with empty array on error
          callback([]);
        }
      );

      return unsubscribe;
    } catch (error: any) {
      console.error('❌ Error setting up subscribeToMessages listener:', error.message);
      // Return a no-op unsubscribe function
      return () => {};
    }
  }
}
```

---

### Change 2: src/components/talent-space/ChatInterface.tsx

**Location**: Replace the `loadMessages` function and update the useEffect hook

```typescript
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/language-provider";
import { translations } from '@/lib/translations';
import { sendMessage, getMessages } from '@/services/talent-space';
import { GroupChatService } from '@/services/group-chat-service'; // ← ADD THIS IMPORT
import { useAuth } from '@/contexts/auth-provider';
import { useToast } from '@/hooks/use-toast';
import type { Message, User } from '@/types/talent-space';
import { users as mockUsers } from '@/data/talent-space';

interface ChatInterfaceProps {
  groupId?: string;
  groupName?: string;
  users?: User[];
}

export function ChatInterface({ groupId, groupName, users = mockUsers }: ChatInterfaceProps) {
  const { language } = useLanguage();
  const t = translations[language].talentSpace;
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ✅ REFACTORED: Set up real-time listener instead of one-time fetch
  useEffect(() => {
    setIsLoading(true);

    // Subscribe to real-time message updates
    const unsubscribe = GroupChatService.subscribeToMessages(
      groupId,
      (updatedMessages) => {
        // Convert GroupChatMessage to Message type
        const convertedMessages: Message[] = updatedMessages.map(msg => ({
          id: msg.id,
          userId: msg.sender.id,
          groupId: msg.groupId,
          content: msg.content,
          createdAt: msg.createdAt.toISOString(),
        }));
        setMessages(convertedMessages);
        setIsLoading(false);
      }
    );

    // Cleanup: Unsubscribe when component unmounts or groupId changes
    return () => {
      unsubscribe();
    };
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // ... rest of component remains the same
}
```

---

### Change 3: src/services/talent-space.ts

**Location**: Add new export function near the end of the file (before closing)

```typescript
/**
 * Subscribe to real-time message updates
 * Wrapper around GroupChatService.subscribeToMessages()
 * 
 * @param groupId - Optional group ID
 * @param callback - Function called with updated messages
 * @returns Unsubscribe function
 * 
 * @example
 * ```typescript
 * useEffect(() => {
 *   const unsubscribe = subscribeToMessages(groupId, (messages) => {
 *     setMessages(messages);
 *   });
 *   return () => unsubscribe();
 * }, [groupId]);
 * ```
 */
export function subscribeToMessages(
  groupId: string | undefined,
  callback: (messages: Message[]) => void
): () => void {
  return GroupChatService.subscribeToMessages(groupId, (groupMessages) => {
    // Convert GroupChatMessage to Message type
    const messages: Message[] = groupMessages.map(msg => ({
      id: msg.id,
      userId: msg.sender.id,
      groupId: msg.groupId,
      content: msg.content,
      createdAt: msg.createdAt.toISOString(),
    }));
    callback(messages);
  });
}
```

---

## Key Implementation Points

### 1. **Unsubscribe Pattern**
```typescript
// Setup
const unsubscribe = GroupChatService.subscribeToMessages(
  groupId,
  (messages) => setMessages(messages)
);

// Cleanup (CRITICAL for memory management)
useEffect(() => {
  return () => unsubscribe();
}, [groupId]);
```

### 2. **Real-Time vs One-Time Fetch**

| Aspect | Old (`getMessages`) | New (`subscribeToMessages`) |
|--------|---|---|
| **Method** | `getDocs()` | `onSnapshot()` |
| **Returns** | Promise | Unsubscribe function |
| **Updates** | Manual (call again) | Automatic (listener) |
| **When to use** | Initial load | Active chat UI |

### 3. **Query Optimization**
- **Global chat**: `collection('group_chat').orderBy('createdAt', 'asc')`
- **Group chat**: `collection('group_chat_messages').where('groupId', '==', groupId).orderBy('createdAt', 'asc')`

### 4. **Error Handling**
- Setup errors return no-op function
- Runtime errors trigger callback with empty array
- All errors logged to console

### 5. **Memory Safety**
- Explicit unsubscribe function returned
- Cleanup in useEffect prevents memory leaks
- Dependency array ensures re-subscription on groupId change

---

## Before & After Comparison

### Before (One-Time Fetch)
```typescript
useEffect(() => {
  const loadMessages = async () => {
    setIsLoading(true);
    const fetchedMessages = await getMessages(groupId);
    setMessages(fetchedMessages);
    setIsLoading(false);
  };
  loadMessages();
}, [groupId]);

// ❌ No real-time updates
// ❌ Stale data risk
// ❌ No auto-refresh
```

### After (Real-Time Listener)
```typescript
useEffect(() => {
  setIsLoading(true);
  const unsubscribe = GroupChatService.subscribeToMessages(
    groupId,
    (updatedMessages) => {
      setMessages(updatedMessages);
      setIsLoading(false);
    }
  );
  return () => unsubscribe();
}, [groupId]);

// ✅ Real-time updates
// ✅ Always current data
// ✅ Auto-refresh on changes
// ✅ Memory-safe cleanup
```

---

## Migration Checklist

- [ ] Add `subscribeToMessages()` method to `GroupChatService`
- [ ] Update `ChatInterface.tsx` imports
- [ ] Replace `loadMessages()` with real-time subscription
- [ ] Update useEffect hook with proper cleanup
- [ ] Add `subscribeToMessages()` wrapper in `talent-space.ts`
- [ ] Test real-time updates with multiple clients
- [ ] Verify message ordering (chronological)
- [ ] Check error handling in console
- [ ] Monitor Firestore usage
- [ ] Keep old `getMessages()` for backward compatibility (optional refactor later)

---

## Benefits

✅ **Real-time collaboration** - Users see messages instantly  
✅ **Better UX** - No manual refresh needed  
✅ **Efficient** - Firestore subscription model  
✅ **Type-safe** - Full TypeScript support  
✅ **Memory-safe** - Explicit cleanup mechanism  
✅ **Error-resilient** - Graceful error handling  
✅ **Backward compatible** - Old methods still work  

---

## Reference Files

- **Implementation**: `src/services/group-chat-service.ts`
- **Component**: `src/components/talent-space/ChatInterface.tsx`
- **Wrapper**: `src/services/talent-space.ts`
- **Types**: `src/types/talent-space.ts`
- **Firebase Config**: `src/firebase/config.ts`
