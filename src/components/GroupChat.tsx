
'use client';

import { useState, useEffect, useRef } from 'react';
import { GroupChatService, type GroupChatMessage } from '@/services/group-chat-service';
import { useAuth } from '@/contexts/auth-provider';

export default function GroupChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<GroupChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    
    // الاشتراك في التحديثات المباشرة
    const unsubscribe = GroupChatService.subscribeToMessages((newMessages) => {
      setMessages(newMessages);
      setLoading(false);
    });

    return () => {
      GroupChatService.unsubscribeFromMessages();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const result = await GroupChatService.getMessages();
      
      if (result.success) {
        setMessages(result.data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !user) return;

    try {
      setSending(true);
      
      const result = await GroupChatService.sendMessage({
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
        alert('فشل في إرسال الرسالة');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('فشل في إرسال الرسالة');
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
    <div className="group-chat bg-white rounded-xl shadow-lg h-[600px] flex flex-col">
      
      {/* هيدر الشات */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">💬 الشات الجماعي</h3>
            <p className="text-blue-100 text-sm">محادثة عامة لجميع الأعضاء</p>
          </div>
          <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
            {messages.length} رسالة
          </div>
        </div>
      </div>

      {/* قائمة الرسائل */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">💬</div>
            <p>لا توجد رسائل بعد</p>
            <p className="text-sm">كن أول من يرسل رسالة في الشات الجماعي</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {message.sender.name.charAt(0)}
              </div>
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

      {/* حقل إرسال الرسالة */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex space-x-3">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="اكتب رسالتك هنا..."
              rows={2}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={sending || !user}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={sending || !newMessage.trim() || !user}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-2"></div>
            ) : (
              'إرسال'
            )}
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2 text-center">
          اضغط Enter للإرسال • Shift+Enter للسطر الجديد
        </div>
      </div>
    </div>
  );
}
