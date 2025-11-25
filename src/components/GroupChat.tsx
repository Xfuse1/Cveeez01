
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { GroupChatService, type GroupChatMessage } from '@/services/group-chat-service';
import { useAuth } from '@/contexts/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface GroupChatProps {
  groupId?: string;
  groupName?: string;
}

export default function GroupChat({ groupId, groupName }: GroupChatProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<GroupChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const result = await GroupChatService.getMessages(groupId);
      if (result.success) {
        setMessages(result.data);
      } else {
        toast({ title: "Error", description: result.error || "Failed to load messages", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({ title: "Error", description: "Failed to load messages", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [groupId, toast]);

  useEffect(() => {
    loadMessages();
  }, [groupId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!user) {
        toast({ title: "Login Required", description: "Please log in to send a message.", variant: "destructive" });
        return;
    }
    if (!newMessage.trim() || sending) {
        return;
    }

    try {
      setSending(true);
      
      const result = await GroupChatService.sendMessage({
        content: newMessage,
        sender: {
          id: user.uid,
          name: user.displayName || 'User',
          avatar: user.photoURL || ''
        },
        groupId,
      });

      if (result.success) {
        setNewMessage('');
        // Reload messages after sending
        await loadMessages();
      } else {
        toast({ title: 'Error', description: result.error || 'Failed to send message', variant: 'destructive' });
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({ title: 'Error', description: error.message || 'Failed to send message', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="group-chat bg-card rounded-xl shadow-lg h-auto flex flex-col border border-border">
      
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold">💬 {groupName || 'Global Chat'}</h3>
        <p className="text-muted-foreground text-sm">{groupName ? 'Group conversation' : 'Public chat for all members'}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 h-64">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="animate-spin h-6 w-6 text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No messages yet.</p>
            <p className="text-sm">Be the first to start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex items-start space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-foreground text-sm">{message.sender.name}</span>
                  <span className="text-muted-foreground text-xs">{message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex space-x-3">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 p-2 rounded-lg resize-none text-sm bg-card border border-border text-foreground placeholder:text-muted-foreground"
            disabled={sending || !user}
          />
          <Button
            onClick={handleSendMessage}
            disabled={sending || !newMessage.trim() || !user}
            size="sm"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
}
