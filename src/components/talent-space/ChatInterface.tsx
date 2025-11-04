"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/language-provider";
import { translations } from '@/lib/translations';
import { sendMessage, getMessages } from '@/services/talent-space';
import { useAuth } from '@/contexts/auth-provider';
import { useToast } from '@/hooks/use-toast';
import type { Message, User } from '@/types/talent-space';
import { messages as mockMessages } from '@/data/talent-space';

interface ChatInterfaceProps {
  groupId?: string;
  groupName?: string;
  users?: User[];
}

export function ChatInterface({ groupId, groupName, users = [] }: ChatInterfaceProps) {
  const { language } = useLanguage();
  const t = translations[language].talentSpace;
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    loadMessages();
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const fetchedMessages = await getMessages(groupId);
      
      // Filter mock messages based on groupId
      const filteredMockMessages = mockMessages.filter(msg => {
        if (groupId) {
          return msg.groupId === groupId;
        } else {
          return !msg.groupId; // Global chat messages
        }
      });
      
      // If Firestore is empty, use mock messages
      if (fetchedMessages.length === 0) {
        console.log('No messages in Firestore, using mock messages');
        setMessages(filteredMockMessages);
      } else {
        setMessages(fetchedMessages);
      }
    } catch (error) {
      console.error('Error fetching messages, using mock messages:', error);
      // On error, fallback to mock messages
      const filteredMockMessages = mockMessages.filter(msg => {
        if (groupId) {
          return msg.groupId === groupId;
        } else {
          return !msg.groupId;
        }
      });
      setMessages(filteredMockMessages);
    }
  };

  const handleSend = async () => {
    if (!user) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar'
          ? 'يجب تسجيل الدخول لإرسال الرسائل.'
          : 'You must be logged in to send messages.',
        variant: 'destructive',
      });
      return;
    }

    if (!messageText.trim()) return;

    setIsSending(true);
    try {
      console.log('Sending message:', messageText);
      const success = await sendMessage(user.uid, messageText, groupId);
      if (success) {
        console.log('Message sent successfully');
        toast({
          title: t.toast.messageSent,
          description: language === 'ar'
            ? 'تم إرسال رسالتك بنجاح!'
            : 'Your message has been sent successfully!',
        });
        setMessageText('');
        // Reload messages
        await loadMessages();
      } else {
        console.error('Failed to send message');
        toast({
          title: t.toast.messageError,
          description: language === 'ar'
            ? 'فشل في إرسال الرسالة. الرجاء المحاولة مرة أخرى.'
            : 'Failed to send message. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: t.toast.messageError,
        description: language === 'ar'
          ? 'حدث خطأ غير متوقع. الرجاء التحقق من اتصالك بالإنترنت.'
          : 'An unexpected error occurred. Please check your internet connection.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const getUserName = (userId: string) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? foundUser.name : 'Unknown User';
  };

  return (
    <Card className="sticky top-[10rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="w-5 h-5 text-primary" />
          {groupName ? `${t.chat.groupChat}: ${groupName}` : t.chat.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-40 bg-muted/50 rounded-md p-2 overflow-y-auto text-xs flex flex-col gap-2">
          {messages.length > 0 ? (
            messages.map((message) => (
              <p key={message.id}>
                <strong className="text-primary">{getUserName(message.userId)}:</strong>{' '}
                {message.content}
              </p>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">
              {language === 'ar' ? 'لا توجد رسائل بعد' : 'No messages yet'}
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex gap-2 mt-2">
          <Input 
            placeholder={t.chat.placeholder}
            className="h-9"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={isSending}
          />
          <Button 
            size="sm" 
            onClick={handleSend}
            disabled={isSending || !messageText.trim()}
          >
            {isSending ? t.chat.sending : t.chat.send}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
