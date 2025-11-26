# Real-Time Chat - Exact Code Changes (Diff Format)

## File 1: src/services/group-chat-service.ts

### Change Location
Add this new method to the `GroupChatService` class, after the `getCachedMessages()` method.

### Current Code (Around Line 145)
```typescript
  // ✅ جلب آخر الرسائل (للعرض السريع)
  static getCachedMessages(): GroupChatMessage[] {
    return this.messages;
  }
}
```

### New Code
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

## File 2: src/components/talent-space/ChatInterface.tsx

### Change 1: Add Import
**Location**: Top of file, with other imports

**Before:**
```typescript
import { sendMessage, getMessages } from '@/services/talent-space';
import { useAuth } from '@/contexts/auth-provider';
```

**After:**
```typescript
import { sendMessage, getMessages } from '@/services/talent-space';
import { GroupChatService } from '@/services/group-chat-service'; // ← ADD THIS LINE
import { useAuth } from '@/contexts/auth-provider';
```

---

### Change 2: Replace useEffect Hook for Loading Messages
**Location**: Inside the `ChatInterface` component, around line 35-60

**Before:**
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

**After:**
```typescript
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
```

---

## File 3: src/services/talent-space.ts

### Change: Add New Export Function
**Location**: End of file

**Add this function after the existing exports:**

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

## Summary of Changes

| File | Type | Lines | Summary |
|------|------|-------|---------|
| `src/services/group-chat-service.ts` | Add Method | ~90 | New `subscribeToMessages()` method with real-time listener |
| `src/components/talent-space/ChatInterface.tsx` | Modify | +1 import, ~20 line change | Replace async fetch with real-time subscription + cleanup |
| `src/services/talent-space.ts` | Add Export | ~25 | New wrapper function for convenience |

---

## Total Impact

- **New Lines of Code**: ~115
- **Deleted Lines of Code**: ~15 (old `loadMessages` function)
- **Modified Lines**: ~20 (useEffect hook)
- **Net Addition**: ~80 lines
- **Backward Compatibility**: 100% (old `getMessages()` still available)

---

## Line-by-Line Explanation

### GroupChatService.subscribeToMessages()

```typescript
static subscribeToMessages(
  groupId: string | undefined,
  callback: (messages: GroupChatMessage[]) => void
): Unsubscribe {
```
- Takes `groupId` (optional) and `callback` function
- Returns `Unsubscribe` function for cleanup

```typescript
  const collectionName = groupId ? 'group_chat_messages' : 'group_chat';
  const messagesRef = collection(db, collectionName);
```
- Dynamically selects correct collection based on groupId

```typescript
  const constraints: QueryConstraint[] = [
    orderBy('createdAt', 'asc')
  ];
  if (groupId) {
    constraints.unshift(where('groupId', '==', groupId));
  }
```
- Builds query: ordered chronologically, filtered by group if needed

```typescript
  const unsubscribe = onSnapshot(
    messagesQuery,
    (snapshot) => {
      // ... transform data
      callback(messages);
    },
    (error) => {
      // ... error handling
    }
  );
```
- Sets up persistent listener with success + error callbacks
- Calls `callback` on initial data and every change

```typescript
  return unsubscribe;
```
- Returns cleanup function to stop listening

### ChatInterface Hook Update

```typescript
useEffect(() => {
  setIsLoading(true);
  
  const unsubscribe = GroupChatService.subscribeToMessages(
    groupId,
    (updatedMessages) => {
      // ... transform and set state
      setIsLoading(false);
    }
  );
  
  return () => unsubscribe();
}, [groupId]);
```
- `useEffect` dependency: re-subscribe when `groupId` changes
- Return cleanup: unsubscribe on component unmount or groupId change
- Callback: sets state whenever messages update

---

## Verification Checklist

After making changes, verify:

- [ ] TypeScript compilation succeeds (`npm run typecheck`)
- [ ] No lint errors (`npm run lint`)
- [ ] Dev server starts (`npm run dev`)
- [ ] ChatInterface component renders
- [ ] Messages load on initial view
- [ ] New messages appear in real-time (test with 2 browser tabs)
- [ ] Switching groups updates messages correctly
- [ ] No console errors
- [ ] Browser DevTools shows no memory leaks
- [ ] Old `getMessages()` still works (backward compatibility)

---

## Rollback Instructions

If you need to revert:

1. **GroupChatService**: Remove the entire `subscribeToMessages()` method
2. **ChatInterface**: 
   - Remove the import of `GroupChatService`
   - Restore the original `loadMessages()` function
   - Restore the original `useEffect` hook
3. **talent-space.ts**: Remove the `subscribeToMessages()` export function

The `getMessages()` method will continue to work as before.

---

## Next: Applying Changes

See `REALTIME_CHAT_IMPLEMENTATION.md` for step-by-step instructions on applying these changes.
