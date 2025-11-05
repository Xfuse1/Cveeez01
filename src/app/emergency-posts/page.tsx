// 📍 المسار: src/app/emergency-posts/page.tsx

'use client';

import { useEffect } from 'react';
import EmergencyPostsFix from '@/components/EMERGENCY_POSTS_FIX';

export default function EmergencyPostsPage() {
  useEffect(() => {
    // إعداد أوامر الطوارئ في الكونسول
    if (typeof window !== 'undefined') {
      // أمر فحص النظام
      (window as any).emergencyCheck = async () => {
        console.log('🚨 بدء الفحص الطارئ للنظام...');
        
        // فحص Firebase
        try {
          const { collection, getDocs } = await import('firebase/firestore');
          const { db } = await import('@/firebase/config');
          const postsRef = collection(db, 'posts');
          const snapshot = await getDocs(postsRef);
          console.log('✅ اتصال Firestore: ناجح');
          console.log('📊 عدد البوستات في قاعدة البيانات:', snapshot.docs.length);
          
          // عرض كل البوستات
          snapshot.docs.forEach((doc, index) => {
            console.log(`📄 البوست ${index + 1}:`, { id: doc.id, ...doc.data() });
          });
        } catch (error) {
          console.log('❌ اتصال Firestore: فاشل', error);
        }
        
        // فحص localStorage
        const savedData = localStorage.getItem('talent-space-posts');
        console.log('💾 البيانات المحفوظة:', savedData);
        
        console.log('🔧 فحص حالة React: يحتاج فحص يدوي');
      };

      // أمر إعادة التعيين
      (window as any).emergencyReset = () => {
        localStorage.removeItem('talent-space-posts');
        sessionStorage.clear();
        console.log('🧹 تم مسح البيانات المحفوظة');
        window.location.reload();
      };

      console.log('🔧 أوامر الطوارئ جاهزة:');
      console.log('   - emergencyCheck() - فحص النظام');
      console.log('   - emergencyReset() - إعادة التعيين');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* هيدر الصفحة */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🚨 نظام طوارئ عرض البوستات
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            نظام تشخيص فوري لاكتشاف ومشكلة عدم ظهور البوستات في Talent Space
          </p>
        </div>

        {/* نظام الطوارئ */}
        <EmergencyPostsFix />

        {/* تعليمات الطوارئ */}
        <div className="mt-8 bg-white border border-blue-200 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-blue-800 mb-4">📋 تعليمات الطوارئ</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">🛠️ خطوات التشخيص:</h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>افتح Console المتصفح (زر F12)</li>
                <li>انقر على أزرار "فحص مفصل" و"فحص الاتصال"</li>
                <li>في Console اكتب: <code>emergencyCheck()</code></li>
                <li>التقط لقطة شاشة للConsole والصفحة</li>
                <li>أرسل اللقطات للمطور</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">🔍 ما يتم فحصه:</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>اتصال Firestore وقاعدة البيانات</li>
                <li>عدد البوستات الحقيقية في النظام</li>
                <li>البيانات التجريبية والعرض</li>
                <li>أي أخطاء في الاتصال أو البيانات</li>
                <li>حالة التطبيق والذاكرة</li>
              </ul>
            </div>
          </div>

          {/* إجراءات سريعة */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">⚡ إجراءات سريعة:</h4>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => (window as any).emergencyCheck()}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
              >
                فحص النظام (Console)
              </button>
              <button 
                onClick={() => (window as any).emergencyReset()}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
              >
                إعادة تعيين كاملة
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm"
              >
                إعادة تحميل الصفحة
              </button>
            </div>
          </div>
        </div>

        {/* معلومات الاتصال */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>🚨 نظام الطوارئ - تم التطوير للفحص الفوري - {new Date().toLocaleDateString('ar-EG')}</p>
        </div>
      </div>
    </div>
  );
}
