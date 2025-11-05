// 📍 المسار: src/components/EMERGENCY_POSTS_FIX.tsx

'use client';

import { useState, useEffect } from 'react';

// بيانات تجريبية للتأكد من أن الواجهة شغالة
const SAMPLE_POSTS = [
  {
    id: 'sample-1',
    title: '🚨 نظام الطوارئ يعمل!',
    content: 'إذا كنت تشاهد هذا البوست، فالنظام يعمل ولكن هناك مشكلة في بيانات Firestore.',
    author: {
      id: 'system',
      name: 'نظام الطوارئ',
      avatar: ''
    },
    media: {
      type: 'none',
      url: ''
    },
    createdAt: new Date(),
    likes: 99,
    comments: 0,
    visibility: 'public',
    status: 'published'
  },
  {
    id: 'sample-2',
    title: 'فحص النظام',
    content: 'يتم الآن فحص اتصال Firestore وجلب البيانات الحقيقية...',
    author: {
      id: 'system', 
      name: 'نظام الفحص',
      avatar: ''
    },
    media: {
      type: 'none',
      url: ''
    },
    createdAt: new Date(),
    likes: 50,
    comments: 0,
    visibility: 'public', 
    status: 'published'
  }
];

export default function EmergencyPostsFix() {
  const [posts, setPosts] = useState<any[]>([]);
  const [firestorePosts, setFirestorePosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [firestoreStatus, setFirestoreStatus] = useState<'checking' | 'connected' | 'failed'>('checking');

  // 1. أولاً: عرض البيانات التجريبية فوراً
  useEffect(() => {
    console.log('🚨 نظام الطوارئ: عرض البيانات التجريبية');
    setPosts(SAMPLE_POSTS);
    setLoading(false);
  }, []);

  // 2. ثانياً: محاولة جلب البيانات الحقيقية من Firestore
  useEffect(() => {
    const fetchRealPosts = async () => {
      try {
        console.log('🔄 جاري محاولة الاتصال بـ Firestore...');
        setFirestoreStatus('checking');

        const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
        const { db } = await import('@/firebase/config');
        
        const postsRef = collection(db, 'posts');
        const postsQuery = orderBy ? 
          query(postsRef, orderBy('createdAt', 'desc')) : 
          postsRef;
        
        const querySnapshot = await getDocs(postsQuery);
        
        const realPosts = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('📄 بيانات Firestore الخام:', { id: doc.id, ...data });
          
          return {
            id: doc.id,
            title: data.title || 'لا يوجد عنوان',
            content: data.content || 'لا يوجد محتوى',
            author: {
              id: data.author?.id || 'unknown',
              name: data.author?.name || 'مستخدم مجهول',
              avatar: data.author?.avatar || ''
            },
            media: {
              type: data.media?.type || 'none',
              url: data.media?.url || ''
            },
            createdAt: data.createdAt?.toDate?.() || new Date(),
            likes: data.likes || 0,
            comments: data.comments || 0,
            visibility: data.visibility || 'public',
            status: data.status || 'published'
          };
        });

        console.log(`✅ تم العثور على ${realPosts.length} بوست في Firestore`);
        setFirestorePosts(realPosts);
        setFirestoreStatus('connected');
        
        // إذا وجدنا بوستات حقيقية، نعرضها بدل التجريبية
        if (realPosts.length > 0) {
          setPosts(realPosts);
          console.log('🎉 تم تبديل البيانات التجريبية بالبيانات الحقيقية');
        } else {
          console.log('⚠️ لا توجد بوستات في Firestore, نعرض البيانات التجريبية');
        }
        
      } catch (err: any) {
        console.error('❌ فشل الاتصال بـ Firestore:', err);
        setError(err.message);
        setFirestoreStatus('failed');
      }
    };

    // تأخير بسيط لرؤية البيانات التجريبية أولاً
    setTimeout(fetchRealPosts, 1000);
  }, []);

  // إعادة تحميل كاملة
  const reloadEverything = () => {
    setLoading(true);
    window.location.reload();
  };

  // فحص مفصل للبيانات
  const detailedInspection = () => {
    console.log('🔍 فحص مفصل للبيانات:');
    console.log('📊 البيانات التجريبية:', SAMPLE_POSTS);
    console.log('🔥 بيانات Firestore:', firestorePosts);
    console.log('🖥️ البيانات المعروضة:', posts);
    console.log('🔄 حالة التحميل:', loading);
    console.log('❌ الخطأ:', error);
    console.log('📡 حالة Firestore:', firestoreStatus);
    
    // فحص إضافي للـ localStorage
    const savedPosts = localStorage.getItem('talent-space-posts');
    console.log('💾 البيانات المحفوظة:', savedPosts);
  };

  // فحص اتصال Firestore فقط
  const testFirestoreConnection = async () => {
    try {
      console.log('🧪 فحص اتصال Firestore...');
      const { collection, getDocs } = await import('firebase/firestore');
      const { db } = await import('@/firebase/config');
      
      const testRef = collection(db, 'posts');
      const snapshot = await getDocs(testRef);
      console.log('✅ اتصال Firestore ناجح');
      console.log(`📁 عدد المستندات: ${snapshot.docs.length}`);
      
      return true;
    } catch (err) {
      console.error('❌ اتصال Firestore فاشل:', err);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-lg text-gray-700">جاري تحميل نظام الطوارئ...</p>
        <p className="text-sm text-gray-500">برجاء الانتظار</p>
      </div>
    );
  }

  return (
    <div className="emergency-fix-container bg-white rounded-xl shadow-lg p-6">
      {/* هيدر الطوارئ */}
      <div className="emergency-header bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center mb-2">
          <span className="text-2xl mr-2">🚨</span>
          <h1 className="text-2xl font-bold text-red-800">نظام طوارئ عرض البوستات</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
          <div className={`p-2 rounded text-center ${
            firestoreStatus === 'connected' ? 'bg-green-100 text-green-800' :
            firestoreStatus === 'failed' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            Firestore: {
              firestoreStatus === 'connected' ? '🟢 متصل' :
              firestoreStatus === 'failed' ? '🔴 فاشل' :
              '🟡 جاري الفحص'
            }
          </div>
          <div className="bg-blue-100 text-blue-800 p-2 rounded text-center">
            البوستات المعروضة: {posts.length}
          </div>
          <div className="bg-purple-100 text-purple-800 p-2 rounded text-center">
            المصدر: {posts === SAMPLE_POSTS ? 'تجريبي' : 'Firestore'}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button 
            onClick={reloadEverything}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center"
          >
            🔄 إعادة تحميل كاملة
          </button>
          <button 
            onClick={detailedInspection}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
          >
            🔍 فحص مفصل
          </button>
          <button 
            onClick={testFirestoreConnection}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
          >
            🧪 فحص الاتصال
          </button>
        </div>
      </div>

      {/* معلومات التشخيص */}
      <div className="diagnostic-info bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-yellow-800 mb-3">معلومات التشخيص:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <strong>البيانات التجريبية:</strong> {SAMPLE_POSTS.length}
          </div>
          <div>
            <strong>بيانات Firestore:</strong> {firestorePosts.length}
          </div>
          <div>
            <strong>بيانات العرض:</strong> {posts.length}
          </div>
          <div>
            <strong>الحالة:</strong> {firestoreStatus === 'connected' ? 'متصل' : firestoreStatus === 'failed' ? 'فاشل' : 'فحص'}
          </div>
        </div>
        {error && (
          <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded">
            <strong>الخطأ:</strong> {error}
          </div>
        )}
      </div>

      {/* قائمة البوستات */}
      <div className="posts-feed space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-gray-100 rounded-lg">
            <div className="text-4xl mb-4">😵</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-700">لم يتم العثور على أي بوستات</h3>
            <p className="text-gray-600 mb-4">حتى البيانات التجريبية غير ظاهرة!</p>
            <button 
              onClick={reloadEverything}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold"
            >
              إعادة تحميل طارئة
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="post-card bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              {/* رأس البوست */}
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3">
                  {post.author.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-lg">{post.author.name}</div>
                  <div className="text-sm text-gray-500">
                    {post.createdAt.toLocaleDateString('ar-EG')}
                  </div>
                </div>
                <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  {post.id.startsWith('sample') ? 'تجريبي' : 'حقيقي'}
                </div>
              </div>

              {/* محتوى البوست */}
              {post.title && (
                <h3 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h3>
              )}
              
              <p className="text-gray-700 text-lg mb-4 leading-relaxed">{post.content}</p>

              {/* الوسائط */}
              {post.media.url && post.media.type !== 'none' && (
                <div className="mb-4">
                  {post.media.type === 'image' ? (
                    <img 
                      src={post.media.url} 
                      alt="ميديا البوست" 
                      className="rounded-lg max-w-full h-auto max-h-96 object-cover shadow"
                    />
                  ) : (
                    <video 
                      src={post.media.url} 
                      controls 
                      className="rounded-lg max-w-full h-auto max-h-96 shadow"
                    />
                  )}
                </div>
              )}

              {/* إجراءات البوست */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex space-x-6">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <span className="text-xl">👍</span>
                    <span className="font-medium">{post.likes}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <span className="text-xl">💬</span>
                    <span className="font-medium">{post.comments}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <span className="text-xl">🔄</span>
                    <span className="font-medium">مشاركة</span>
                  </button>
                </div>
                <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                  {post.id}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* لوحة التحكم */}
      <div className="control-panel bg-gray-50 border border-gray-200 rounded-lg p-4 mt-8">
        <h3 className="font-semibold text-gray-800 mb-3">🎯 لوحة تحكم الطوارئ</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>الإجراءات السريعة:</strong>
            <ul className="mt-2 space-y-1 text-gray-600">
              <li>• فتح Console (F12) لمشاهدة السجلات</li>
              <li>• التقاط لقطة شاشة للConsole والصفحة</li>
              <li>• استخدام الأزرار أعلاه للفحص</li>
            </ul>
          </div>
          <div>
            <strong>معلومات التصحيح:</strong>
            <ul className="mt-2 space-y-1 text-gray-600">
              <li>• البيانات التجريبية تظهر أولاً دائمًا</li>
              <li>• البيانات الحقيقية تستبدلها إذا وجدت</li>
              <li>• الأخطاء تظهر في الأعلى وفي Console</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
