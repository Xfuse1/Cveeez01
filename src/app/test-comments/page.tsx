
'use client';

import { useState, useEffect } from 'react';
import GuaranteedCommentsService from '@/services/guaranteed-comments-service';

export default function TestCommentsPage() {
  const [postId, setPostId] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [status, setStatus] = useState('أدخل ID البوست للاختبار');

  const testComments = async () => {
    if (!postId.trim()) {
      alert('⚠️ يرجى إدخال ID البوست');
      return;
    }

    try {
      setStatus('جاري اختبار نظام التعليقات...');
      
      const result = await GuaranteedCommentsService.getCommentsByPostId(postId);
      
      if (result.success) {
        setComments(result.data);
        setStatus(`✅ تم العثور على ${result.data.length} تعليق`);
        
        // اختبار إضافة تعليق
        const addResult = await GuaranteedCommentsService.addComment(postId, {
          content: 'هذا تعليق تجريبي من صفحة الاختبار - ' + new Date().toLocaleString('ar-EG'),
          authorId: 'test-user',
          authorName: 'مختبر النظام'
        });
        
        if (addResult.success) {
          setStatus(`✅ النظام يعمل! ${result.data.length} تعليق + تم إضافة تعليق جديد`);
          
          // إعادة تحميل التعليقات
          const newResult = await GuaranteedCommentsService.getCommentsByPostId(postId);
          if (newResult.success) {
            setComments(newResult.data);
          }
        }
      } else {
        setStatus(`❌ فشل: ${result.error}`);
      }
      
    } catch (error: any) {
      setStatus(`❌ خطأ: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">🧪 اختبار نظام التعليقات</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">ID البوست المراد اختباره:</label>
            <input
              type="text"
              value={postId}
              onChange={(e) => setPostId(e.target.value)}
              placeholder="أدخل ID البوست هنا..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={testComments}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            بدء الاختبار
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">النتيجة: {status}</h3>
          
          {comments.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">التعليقات ({comments.length}):</h4>
              <div className="space-y-3">
                {comments.map(comment => (
                  <div key={comment.id} className="border border-gray-200 rounded p-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>{comment.author.name}</span>
                      <span>{comment.createdAt.toLocaleDateString('ar-EG')}</span>
                    </div>
                    <p className="text-gray-800">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
