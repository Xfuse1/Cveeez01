// 📍 ملف: src/utils/emergency-diagnostic.ts

export class EmergencyDiagnostic {
  // ✅ فحص سريع للنظام
  static async quickDiagnosis() {
    const diagnostics = {
      firestore: false,
      posts: 0,
      error: null as string | null
    };

    try {
      // فحص Firestore
      const { PostsFetcher } = await import('@/services/posts-fetcher');
      const result = await PostsFetcher.fetchAllPosts();
      
      diagnostics.firestore = result.success;
      diagnostics.posts = result.data.length;
      diagnostics.error = result.error || null;
      
    } catch (error: any) {
      diagnostics.error = error.message;
    }

    console.log('🩺 EMERGENCY DIAGNOSTIC RESULTS:');
    console.log('📊 Firestore Connection:', diagnostics.firestore);
    console.log('📝 Posts Count:', diagnostics.posts);
    console.log('❌ Error:', diagnostics.error);
    
    return diagnostics;
  }

  // ✅ تشغيل من الكونسول
  static enableConsoleCommands() {
    if (typeof window !== 'undefined') {
      (window as any).diagnose = this.quickDiagnosis;
      (window as any).reloadPosts = () => window.location.reload();
      console.log('🔧 Emergency commands enabled: diagnose(), reloadPosts()');
    }
  }
}

// ✅ التشغيل التلقائي
if (typeof window !== 'undefined') {
  EmergencyDiagnostic.enableConsoleCommands();
}
