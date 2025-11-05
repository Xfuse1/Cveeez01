// 📍 ملف: src/app/talent-space/emergency/page.tsx

'use client';

import EmergencyPostsFeed from '@/components/EmergencyPostsFeed';
import { useEffect } from 'react';

export default function EmergencyTalentSpace() {
  useEffect(() => {
    console.log('🚨 EMERGENCY MODE ACTIVATED');
    console.log('🔧 Debug mode enabled');
  }, []);

  return (
    <div className="emergency-talent-space min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* ✅ Header طوارئ */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Talent Space - Emergency Mode
          </h1>
          <p className="text-gray-600">
            Emergency posts display system
          </p>
        </div>

        {/* ✅ نظام البوستات */}
        <div className="max-w-4xl mx-auto">
          <EmergencyPostsFeed />
        </div>

        {/* ✅ معلومات الطوارئ */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Emergency Information</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• System is in emergency mode</li>
            <li>• Debug information is enabled</li>
            <li>• Check browser console for details</li>
            <li>• Contact developer if issues persist</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
