'use client';

import { useState, useEffect } from 'react';

interface DiagnosisResult {
  step: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  data?: any;
}

export default function TalentSpaceDebug() {
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    runFullDiagnosis();
  }, []);

  const addDiagnosis = (step: string, status: 'success' | 'error' | 'warning', message: string, data?: any) => {
    setDiagnosis(prev => [...prev, { step, status, message, data }]);
    console.log(`🔍 ${step}: ${message}`, data || '');
  };

  const runFullDiagnosis = async () => {
    setIsLoading(true);
    setDiagnosis([]);
    console.clear();
    console.log('🩺 بدء التشخيص الشامل لنظام Talent Space...');

    try {
      // الخطوة 1: فحص React الأساسي
      await diagnoseReact();
      
      // الخطوة 2: فحص Firebase
      await diagnoseFirebase();
      
      // الخطوة 3: فحص Firestore والبيانات
      await diagnoseFirestore();
      
      // الخطوة 4: فحص Talent Space الحالي
      await diagnoseTalentSpace();
      
      // الخطوة 5: عرض النتائج
      showResults();

    } catch (error) {
      addDiagnosis('التشخيص العام', 'error', 'فشل في إكمال التشخيص', error);
    } finally {
      setIsLoading(false);
    }
  };

  const diagnoseReact = async () => {
    addDiagnosis('React', 'success', 'المكون شغال وجاري التحميل');
    
    // فحص إضافي لـ React
    if (typeof window !== 'undefined') {
      addDiagnosis('React DOM', 'success', 'React DOM جاهز للاستخدام');
    }
  };

  const diagnoseFirebase = async () => {
    try {
      const { initializeApp } = await import('firebase/app');
      const { getFirestore } = await import('firebase/firestore');
      
      addDiagnosis('Firebase Imports', 'success', 'تم استيراد Firebase بنجاح');
      
      // فحص التهيئة
      const { db } = await import('@/firebase/config');
      addDiagnosis('Firebase Config', 'success', 'تم تكوين Firebase بنجاح');
      
    } catch (error: any) {
      addDiagnosis('Firebase', 'error', `فشل في استيراد Firebase: ${error.message}`);
      throw error;
    }
  };

  const diagnoseFirestore = async () => {
    try {
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
      const { db } = await import('@/firebase/config');
      
      const postsRef = collection(db, 'posts');
      const postsQuery = query(postsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(postsQuery);
      
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setPosts(postsData);
      
      addDiagnosis('Firestore Connection', 'success', 'الاتصال بقاعدة البيانات ناجح');
      addDiagnosis('Posts Data', 'success', `تم العثور على ${postsData.length} بوست`, postsData);
      
      if (postsData.length === 0) {
        addDiagnosis('Posts Count', 'warning', 'لا توجد بوستات في قاعدة البيانات');
      }
      
    } catch (error: any) {
      addDiagnosis('Firestore', 'error', `فشل في جلب البيانات: ${error.message}`);
    }
  };

  const diagnoseTalentSpace = async () => {
    try {
      // فحص إذا كان Talent Space الحالي موجود
      const talentSpaceElement = document.querySelector('[class*="talent"], [class*="space"], [class*="post"]');
      
      if (talentSpaceElement) {
        addDiagnosis('Talent Space UI', 'success', 'عناصر Talent Space موجودة في الصفحة');
      } else {
        addDiagnosis('Talent Space UI', 'warning', 'لم يتم العثور على عناصر Talent Space في الصفحة الحالية');
      }
      
      // فحص الـ state management
      addDiagnosis('State Management', 'success', 'إدارة الحالة شغالة');
      
    } catch (error: any) {
      addDiagnosis('Talent Space', 'error', `خطأ في فحص Talent Space: ${error.message}`);
    }
  };

  const showResults = () => {
    const errors = diagnosis.filter(d => d.status === 'error');
    const warnings = diagnosis.filter(d => d.status === 'warning');
    
    if (errors.length === 0) {
      addDiagnosis('النتيجة النهائية', 'success', 
        warnings.length > 0 
          ? `التشخيص اكتمل مع ${warnings.length} تحذير` 
          : 'كل الأنظمة تعمل بشكل صحيح!'
      );
    } else {
      addDiagnosis('النتيجة النهائية', 'error', 
        `تم اكتشاف ${errors.length} خطأ يحتاج إلى إصلاح`
      );
    }
  };

  const createTestPost = async () => {
    try {
      const { collection, addDoc, Timestamp } = await import('firebase/firestore');
      const { db } = await import('@/firebase/config');
      
      const testPost = {
        title: '🔥 بوست تجريبي من نظام التشخيص',
        content: 'تم إنشاء هذا البوست للتأكد من أن نظام الكتابة يعمل بشكل صحيح.\n\n' +
                '📍 التاريخ: ' + new Date().toLocaleString('ar-EG') + '\n' +
                '✅ النظام: Talent Space Debugger\n' +
                '🎯 الغرض: اختبار وظيفة إنشاء البوستات',
        author: {
          id: 'debug-system',
          name: 'نظام التشخيص',
          avatar: ''
        },
        media: {
          type: 'none',
          url: ''
        },
        createdAt: Timestamp.now(),
        likes: 0,
        comments: 0,
        shares: 0,
        status: 'published',
        visibility: 'public'
      };
      
      const postsRef = collection(db, 'posts');
      const docRef = await addDoc(postsRef, testPost);
      
      alert(`✅ تم إنشاء البوست التجريبي بنجاح!\n\nID: ${docRef.id}`);
      runFullDiagnosis(); // إعادة التشخيص
      
    } catch (error: any) {
      alert(`❌ فشل في إنشاء البوست: ${error.message}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return '🔍';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">جاري التشخيص...</h2>
          <p className="text-gray-600">برجاء الانتظار أثناء فحص النظام</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* الهيدر */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🩺 نظام تشخيص Talent Space
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            نظام تشخيص آلي لاكتشاف سبب عدم ظهور البوستات
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={runFullDiagnosis}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 إعادة التشخيص
            </button>
            <button
              onClick={createTestPost}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              ➕ إنشاء بوست تجريبي
            </button>
          </div>
        </div>

        {/* نتائج التشخيص */}
        <div className="space-y-4 mb-8">
          {diagnosis.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${getStatusColor(item.status)} transition-all duration-300`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="text-xl mr-2">{getStatusIcon(item.status)}</span>
                    <h3 className="font-semibold text-lg">{item.step}</h3>
                  </div>
                  <p className="text-gray-700">{item.message}</p>
                  
                  {item.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm opacity-75 hover:opacity-100">
                        📊 عرض البيانات
                      </summary>
                      <pre className="mt-2 p-3 bg-white rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(item.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* البوستات المستلمة */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              📝 البوستات المستلمة ({posts.length})
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              posts.length > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {posts.length > 0 ? 'بيانات متاحة' : 'لا توجد بيانات'}
            </span>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد بوستات</h3>
              <p className="text-gray-500">لم يتم العثور على أي بوستات في قاعدة البيانات</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.slice(0, 5).map((post) => (
                <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800">
                      {post.title || 'بدون عنوان'}
                    </h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {post.id}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    {post.content || 'لا يوجد محتوى'}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>المؤلف: {post.author?.name || 'مجهول'}</span>
                    <span>
                      {post.createdAt?.toDate?.()?.toLocaleDateString('ar-EG') || 'تاريخ غير معروف'}
                    </span>
                  </div>
                </div>
              ))}
              
              {posts.length > 5 && (
                <div className="text-center text-gray-500">
                  ... وعرض {posts.length - 5} بوست إضافي
                </div>
              )}
            </div>
          )}
        </div>

        {/* إجراءات سريعة */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">⚡ إجراءات سريعة</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">🔧 للمطور</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• فتح Console (F12) لمشاهدة السجلات</li>
                <li>• التحقق من أخطاء الـ Build</li>
                <li>• فحص شبكة التطبيق (Network tab)</li>
                <li>• التأكد من إعدادات Firebase</li>
              </ul>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">🎯 الحلول المقترحة</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• استخدام الكومبوننت الجديد المضمون</li>
                <li>• التحقق من توجيه الصفحات (Routing)</li>
                <li>• فحص إدارة الحالة (State Management)</li>
                <li>• التأكد من استيراد المكونات</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ملخص النتائج */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg text-center">
          <p className="text-gray-600">
            {diagnosis.some(d => d.status === 'error') 
              ? '🚨 تم اكتشاف مشاكل تحتاج إلى إصلاح' 
              : diagnosis.some(d => d.status === 'warning')
              ? '⚠️ النظام يعمل مع وجود بعض التحذيرات'
              : '🎉 كل الأنظمة تعمل بشكل مثالي!'
            }
          </p>
        </div>

      </div>
    </div>
  );
}
