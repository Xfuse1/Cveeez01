'use client';

import { useState, useEffect, useRef } from 'react';
import { ProfessionalGroup, GroupChatMessage, ProfessionalGroupsService } from '@/services/professional-groups-service';
import { useAuth } from '@/contexts/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface GroupMessagesProps {
  group: ProfessionalGroup;
  onBack: () => void;
}

export default function GroupMessages({ group, onBack }: GroupMessagesProps) {
  const [messages, setMessages] = useState<GroupChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = ProfessionalGroupsService.subscribeToGroupMessages(
      group.id,
      (newMessages) => {
        setMessages(newMessages);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [group.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !user) return;

    try {
      setSending(true);
      
      const result = await ProfessionalGroupsService.sendGroupMessage({
        groupId: group.id,
        content: newMessage,
        sender: {
          id: user.uid,
          name: user.displayName || 'User',
          avatar: user.photoURL || ''
        }
      });

      if (result.success) {
        setNewMessage('');
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
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
    <div className="group-messages bg-white rounded-xl shadow-lg h-[600px] flex flex-col border">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              onClick={onBack}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h3 className="text-lg font-semibold">👥 {group.name}</h3>
              <p className="text-green-100 text-sm">{group.memberCount} أعضاء</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">💬</div>
            <p>لا توجد رسائل بعد</p>
            <p className="text-sm">كن أول من يرسل رسالة في الجروب</p>
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
                  <span className="font-semibold text-gray-800 text-sm">
                    {message.sender.name}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {message.createdAt.toLocaleTimeString('ar-EG', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-800 text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex space-x-3">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="اكتب رسالتك هنا..."
            rows={1}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            disabled={sending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={sending || !newMessage.trim()}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'إرسال'}
          </Button>
        </div>
      </div>
    </div>
  );
}
