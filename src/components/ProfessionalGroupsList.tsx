
'use client';

import { useState, useEffect } from 'react';
import { ProfessionalGroupsService, type ProfessionalGroup } from '@/services/professional-groups-service';
import { useAuth } from '@/contexts/auth-provider';

export default function ProfessionalGroupsList() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<ProfessionalGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<ProfessionalGroup | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  // حالات نموذج الإنشاء
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    category: 'tech' as const,
    isPublic: true,
    tags: [] as string[],
    rules: ''
  });

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const result = await ProfessionalGroupsService.getAllGroups();
      
      if (result.success) {
        setGroups(result.data);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim() || !newGroup.description.trim() || !user) {
      alert('⚠️ يرجى ملء جميع الحقول المطلوبة وتسجيل الدخول');
      return;
    }

    try {
      setCreating(true);
      
      const result = await ProfessionalGroupsService.createGroup({
        ...newGroup,
        createdBy: user.uid 
      });

      if (result.success) {
        setShowCreateForm(false);
        setNewGroup({
          name: '',
          description: '',
          category: 'tech',
          isPublic: true,
          tags: [],
          rules: ''
        });
        await loadGroups(); // إعادة تحميل القائمة
        alert('🎉 تم إنشاء الجروب بنجاح!');
      } else {
        alert(`❌ فشل في إنشاء الجروب: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert('❌ فشل في إنشاء الجروب');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if(!user) {
        alert('الرجاء تسجيل الدخول للانضمام');
        return;
    }
    try {
      const result = await ProfessionalGroupsService.joinGroup(groupId, user.uid);
      
      if (result.success) {
        alert('✅ تم الانضمام للجروب بنجاح!');
        await loadGroups(); // تحديث القائمة
      } else {
        alert(`❌ فشل في الانضمام: ${result.error}`);
      }
    } catch (error) {
      console.error('Error joining group:', error);
      alert('❌ فشل في الانضمام للجروب');
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      tech: '👨‍💻',
      design: '🎨',
      marketing: '📊',
      management: '👔',
      finance: '💰',
      healthcare: '🏥',
      education: '🎓',
      other: '👥'
    };
    return icons[category] || '👥';
  };

  const getCategoryName = (category: string) => {
    const names: { [key: string]: string } = {
      tech: 'التقنية',
      design: 'التصميم',
      marketing: 'التسويق',
      management: 'الإدارة',
      finance: 'المالية',
      healthcare: 'الرعاية الصحية',
      education: 'التعليم',
      other: 'أخرى'
    };
    return names[category] || 'أخرى';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">جاري تحميل الجروبات...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="professional-groups bg-white rounded-xl shadow-lg h-[600px] flex flex-col">
      
      {/* هيدر الجروبات */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">👥 الجروبات المهنية</h3>
            <p className="text-green-100 text-sm">انضم للمجتمعات المهنية المناسبة لك</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors font-semibold"
          >
            ➕ إنشاء جروب
          </button>
        </div>
      </div>

      {/* نموذج إنشاء جروب جديد */}
      {showCreateForm && (
        <div className="p-4 border-b border-gray-200 bg-yellow-50">
          <h4 className="font-semibold text-gray-800 mb-3">إنشاء جروب مهني جديد</h4>
          
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">اسم الجروب *</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                  placeholder="مثال: جروب المبرمجين"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">التصنيف *</label>
                <select
                  value={newGroup.category}
                  onChange={(e) => setNewGroup({...newGroup, category: e.target.value as any})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="tech">👨‍💻 التقنية</option>
                  <option value="design">🎨 التصميم</option>
                  <option value="marketing">📊 التسويق</option>
                  <option value="management">👔 الإدارة</option>
                  <option value="finance">💰 المالية</option>
                  <option value="healthcare">🏥 الرعاية الصحية</option>
                  <option value="education">🎓 التعليم</option>
                  <option value="other">👥 أخرى</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">الوصف *</label>
              <textarea
                value={newGroup.description}
                onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                placeholder="وصف مختصر للجروب وأهدافه..."
                rows={2}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={newGroup.isPublic}
                onChange={(e) => setNewGroup({...newGroup, isPublic: e.target.checked})}
                className="mr-2"
              />
              <label className="text-sm text-gray-600">جروب عام (يمكن للجميع رؤيته والانضمام إليه)</label>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleCreateGroup}
                disabled={creating}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {creating ? 'جاري الإنشاء...' : 'إنشاء الجروب'}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* قائمة الجروبات */}
      <div className="flex-1 overflow-y-auto p-4">
        {groups.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">👥</div>
            <p>لا توجد جروبات مهنية بعد</p>
            <p className="text-sm">كن أول من ينشئ جروباً مهنياً</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <div 
                key={group.id} 
                className="group border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-blue-300 transition-all flex items-center space-x-3"
              >
                <div className="text-2xl">{getCategoryIcon(group.category)}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{group.name}</h4>
                  <p className="text-sm text-gray-500">{group.description}</p>
                  <div className="text-xs text-gray-400 mt-1">
                    {group.memberCount} عضو • {getCategoryName(group.category)}
                  </div>
                </div>
                <button
                  onClick={() => handleJoinGroup(group.id)}
                  className="bg-blue-100 text-blue-700 px-3 py-1 text-sm font-semibold rounded-full hover:bg-blue-200 transition-colors"
                >
                  انضم
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
