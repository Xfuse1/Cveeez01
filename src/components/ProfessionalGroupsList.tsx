
'use client';

import { useState } from 'react';
import { type ProfessionalGroup, ProfessionalGroupsService } from '@/services/professional-groups-service';
import { useAuth } from '@/contexts/auth-provider';
import { useToast } from '@/hooks/use-toast';

interface ProfessionalGroupsListProps {
  groups: ProfessionalGroup[];
  loading: boolean;
  onGroupSelect: (groupId: string) => void;
  onRefresh: () => void;
}

export default function ProfessionalGroupsList({ groups, loading, onGroupSelect, onRefresh }: ProfessionalGroupsListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [joining, setJoining] = useState<string | null>(null);

  const handleJoinGroup = async (groupId: string) => {
    if(!user) {
        toast({ variant: 'destructive', title: 'مطلوب تسجيل الدخول', description: 'الرجاء تسجيل الدخول للانضمام' });
        return;
    }
    try {
      setJoining(groupId);
      const result = await ProfessionalGroupsService.joinGroup(groupId, user.uid);
      
      if (result.success) {
        toast({ title: '✅ تم الانضمام', description: 'تم الانضمام للجروب بنجاح!' });
        onRefresh();
      } else {
        toast({ variant: 'destructive', title: '❌ فشل', description: result.error || 'فشل في الانضمام' });
      }
    } catch (error: any) {
      console.error('Error joining group:', error);
      toast({ variant: 'destructive', title: '❌ فشل', description: error.message || 'فشل في الانضمام للجروب' });
    } finally {
      setJoining(null);
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
  
  return (
    <div className="professional-groups bg-white rounded-xl shadow-lg h-auto flex flex-col">
      
      {/* هيدر الجروبات */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">👥 الجروبات المهنية</h3>
            <p className="text-green-100 text-sm">انضم للمجتمعات المهنية المناسبة لك</p>
          </div>
        </div>
      </div>

      {/* قائمة الجروبات */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
           <div className="text-center py-12 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>جاري تحميل الجروبات...</p>
           </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">👥</div>
            <p>لا توجد جروبات مهنية بعد</p>
            <p className="text-sm">سيتم إضافة المجموعات من قبل الإدارة قريبًا</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <div 
                key={group.id} 
                className="group border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-blue-300 transition-all flex items-center space-x-3"
              >
                <div className="text-2xl">{getCategoryIcon(group.category)}</div>
                <button
                  className="flex-1 text-right"
                  onClick={() => onGroupSelect(group.id)}
                >
                  <h4 className="font-semibold text-gray-800">{group.name}</h4>
                  <p className="text-sm text-gray-500">{group.description}</p>
                  <div className="text-xs text-gray-400 mt-1">
                    {group.memberCount} عضو • {getCategoryName(group.category)}
                  </div>
                </button>
                <button
                  onClick={() => handleJoinGroup(group.id)}
                  disabled={joining === group.id}
                  className="bg-blue-100 text-blue-700 px-3 py-1 text-sm font-semibold rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50"
                >
                  {joining === group.id ? '...' : 'انضم'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
