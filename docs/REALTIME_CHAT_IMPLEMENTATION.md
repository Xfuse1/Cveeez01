# Real-Time Chat Implementation - Step-by-Step Guide

## Quick Start

This guide shows exactly how to implement real-time message updates in the Talent Space chat.

---

## Step 1: Add Real-Time Method to GroupChatService

### File: `src/services/group-chat-service.ts`

**Add this method to the `GroupChatService` class** (after `getCachedMessages()`):

```typescript
  /**
   * ✅ Real-time listener for chat messages using onSnapshot
   * 
   * REFACTORED: Converts from one-time fetch (getDocs) to real-time listener (onSnapshot)
   * 
   * @param groupId - Optional group ID to filter messages by
   * @param callback - Function called whenever messages update in real-time
   * @returns Unsubscribe function to clean up the listener when component unmounts
   */
  static subscribeToMessages(
    groupId: string | undefined,
    callback: (messages: GroupChatMessage[]) => void
  ): Unsubscribe {
    try {
      const collectionName = groupId ? 'group_chat_messages' : 'group_chat';
      const messagesRef = collection(db, collectionName);

      const constraints: QueryConstraint[] = [
        orderBy('createdAt', 'asc')
      ];

      if (groupId) {
        constraints.unshift(where('groupId', '==', groupId));
      }

      const messagesQuery = query(messagesRef, ...constraints);

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

          this.messages = messages;
          callback(messages);
        },
        (error) => {
          console.error(`❌ Error listening to ${collectionName}:`, error);
          callback([]);
        }
      );

      return unsubscribe;
    } catch (error: any) {
      console.error('❌ Error setting up subscribeToMessages listener:', error.message);
      return () => {};
    }
  }
```

---

## Step 2: Update ChatInterface Component

### File: `src/components/talent-space/ChatInterface.tsx`

#### 2a. Add Import
```typescript
import { GroupChatService } from '@/services/group-chat-service'; // ← ADD THIS
```

#### 2b. Replace the useEffect Hook

**Remove this:**
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

**Add this:**
```typescript
useEffect(() => {
  setIsLoading(true);

  const unsubscribe = GroupChatService.subscribeToMessages(
    groupId,
    (updatedMessages) => {
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

  return () => unsubscribe();
}, [groupId]);
```

---

## Step 3: Add Wrapper Function (Optional but Recommended)

### File: `src/services/talent-space.ts`

**Add this function at the end of the file** (before the closing brace if there is one):

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

## Understanding the Changes

### What Changed?

#### Old Pattern (One-Time Fetch)
```typescript
// Fetch once, then stop
const fetchedMessages = await getMessages(groupId);
setMessages(fetchedMessages);

// To get updates: manually call again
```

#### New Pattern (Real-Time Listener)
```typescript
// Set up listener that fires whenever data changes
const unsubscribe = GroupChatService.subscribeToMessages(
  groupId,
  (messages) => setMessages(messages) // Called initially + on every update
);

// Cleanup when component unmounts
return () => unsubscribe();
```

### Key Differences

| Feature | Old | New |
|---------|-----|-----|
| **Method** | `await getDocs()` | `onSnapshot()` |
| **Returns** | Promise → data | Unsubscribe function |
| **How often callback fires** | Once (manual refresh needed) | Initially + on every change |
| **Real-time sync** | ❌ No | ✅ Yes |
| **Cleanup needed** | No | ✅ Yes (via unsubscribe) |

---

## How It Works (Technical Explanation)

### 1. Initial Setup
```typescript
useEffect(() => {
  const unsubscribe = GroupChatService.subscribeToMessages(groupId, callback);
  return () => unsubscribe();
}, [groupId]);
```

When the component mounts or `groupId` changes:
1. Firebase `onSnapshot()` creates a persistent listener
2. Listener immediately fires with current data
3. `callback` is invoked with messages
4. Component state updates and re-renders

### 2. Real-Time Updates
Someone sends a new message in Firestore:
1. Firestore database changes
2. `onSnapshot()` automatically detects change
3. Fires callback again with updated data
4. Component re-renders with new message

### 3. Cleanup
When component unmounts or `groupId` changes:
1. `useEffect` cleanup function runs
2. Calls `unsubscribe()`
3. Listener disconnected from Firestore
4. No more updates received
5. Memory freed

---

## Collection Structure

The function automatically handles both:

### Global Chat
```
collection('group_chat')
  ↓
Documents: [message1, message2, message3, ...]
  ↓
Ordered by: createdAt ascending
```

### Group-Specific Chat
```
collection('group_chat_messages')
  ↓
Where: groupId == 'specific-group-id'
  ↓
Ordered by: createdAt ascending
```

---

## Error Handling

The implementation handles errors gracefully:

```typescript
(error) => {
  console.error(`Error listening to ${collectionName}:`, error);
  callback([]); // Return empty array on error
}
```

If Firestore fails:
- Error is logged to console
- Callback receives empty message array
- Component shows empty state (doesn't crash)

---

## Memory & Performance

### Memory Safety
✅ **Unsubscribe mechanism** - Cleanup prevents memory leaks  
✅ **Dependency array** - Re-subscription on groupId change  
✅ **Try-catch** - Handles setup errors gracefully  

### Performance Optimization
✅ **Firestore subscription model** - Efficient streaming  
✅ **Query filters** - Only fetches relevant messages  
✅ **Message ordering** - Done server-side (cheaper than client)  
✅ **Caching** - Updates `this.messages` for quick access  

---

## Usage Examples

### Example 1: Basic Chat Component
```typescript
export function ChatComponent({ groupId }: { groupId?: string }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    const unsubscribe = GroupChatService.subscribeToMessages(
      groupId,
      (messages) => {
        setMessages(messages);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [groupId]);

  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div className="space-y-2">
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
    </div>
  );
}
```

### Example 2: With Error Handling
```typescript
useEffect(() => {
  setIsLoading(true);
  setError(null);

  const unsubscribe = GroupChatService.subscribeToMessages(
    groupId,
    (messages) => {
      try {
        setMessages(messages);
        setError(null);
      } catch (err) {
        setError('Failed to update messages');
      }
      setIsLoading(false);
    }
  );

  return () => unsubscribe();
}, [groupId]);
```

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Forgetting Cleanup
```typescript
// WRONG - Memory leak!
useEffect(() => {
  GroupChatService.subscribeToMessages(groupId, setMessages);
  // Missing return cleanup!
}, [groupId]);
```

**Fix:**
```typescript
// CORRECT
useEffect(() => {
  const unsubscribe = GroupChatService.subscribeToMessages(groupId, setMessages);
  return () => unsubscribe();
}, [groupId]);
```

### ❌ Mistake 2: Missing Dependency
```typescript
// WRONG - Doesn't re-subscribe on groupId change
useEffect(() => {
  const unsubscribe = GroupChatService.subscribeToMessages(groupId, setMessages);
  return () => unsubscribe();
}, []); // ← Should include [groupId]
```

**Fix:**
```typescript
// CORRECT
useEffect(() => {
  const unsubscribe = GroupChatService.subscribeToMessages(groupId, setMessages);
  return () => unsubscribe();
}, [groupId]); // ← Include groupId
```

### ❌ Mistake 3: Not Converting Message Type
```typescript
// WRONG - Type mismatch
setMessages(updatedMessages); // GroupChatMessage[], but state expects Message[]
```

**Fix:**
```typescript
// CORRECT
const converted = updatedMessages.map(msg => ({
  id: msg.id,
  userId: msg.sender.id,
  groupId: msg.groupId,
  content: msg.content,
  createdAt: msg.createdAt.toISOString(),
}));
setMessages(converted);
```

---

## Testing Checklist

- [ ] Messages appear on initial load
- [ ] New messages appear in real-time (open 2 browser tabs, send message in one)
- [ ] Messages are ordered chronologically
- [ ] Switching between groups updates messages
- [ ] No console errors in browser DevTools
- [ ] No memory leaks (DevTools → Memory tab, take heap snapshots)
- [ ] Component unmounts cleanly
- [ ] Handles Firestore errors gracefully
- [ ] Works offline (if using offline persistence)

---

## Rollback Plan

If issues occur, you can revert by:

1. Remove `subscribeToMessages()` method from GroupChatService
2. Restore original `loadMessages()` and `useEffect` in ChatInterface
3. Remove `subscribeToMessages()` wrapper from talent-space.ts

The old `getMessages()` method remains untouched for reference.

---

## Next Steps

1. **Implement** the changes from this guide
2. **Test** with the checklist above
3. **Monitor** Firestore usage in Firebase Console
4. **Gradually migrate** other chat components to use real-time
5. **Consider** pagination if dealing with large message volumes

---

## Support References

- **Firebase onSnapshot**: https://firebase.google.com/docs/firestore/query-data/listen
- **React useEffect**: https://react.dev/reference/react/useEffect
- **TypeScript Union Types**: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types
