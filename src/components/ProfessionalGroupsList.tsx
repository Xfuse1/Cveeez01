
'use client';

import { useState } from 'react';
import { type ProfessionalGroup, ProfessionalGroupsService } from '@/services/professional-groups-service';
import { useAuth } from '@/contexts/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

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
        toast({ variant: 'destructive', title: 'Login Required', description: 'Please log in to join a group' });
        return;
    }
    try {
      setJoining(groupId);
      const result = await ProfessionalGroupsService.joinGroup(groupId, user.uid);
      
      if (result.success) {
        toast({ title: '✅ Joined Group', description: 'Successfully joined the group!' });
        onRefresh();
      } else {
        toast({ variant: 'destructive', title: '❌ Join Failed', description: result.error || 'Failed to join group' });
      }
    } catch (error: any) {
      console.error('Error joining group:', error);
      toast({ variant: 'destructive', title: '❌ Error', description: error.message || 'Failed to join group' });
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
  
  return (
    <div className="professional-groups bg-card rounded-xl shadow-lg h-auto flex flex-col border">
      
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">👥 Professional Groups</h3>
        <p className="text-muted-foreground text-sm">Join communities relevant to your field</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
           <div className="text-center py-12 text-muted-foreground">
            <Loader2 className="animate-spin h-6 w-6 mx-auto mb-2" />
            <p>Loading groups...</p>
           </div>
        ) : !groups || groups.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No professional groups available yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <div 
                key={group.id} 
                className="group border rounded-lg p-3 hover:shadow-md hover:border-primary/50 transition-all flex items-center space-x-3"
              >
                <div className="text-2xl bg-muted p-2 rounded-md">{getCategoryIcon(group.category)}</div>
                <button
                  className="flex-1 text-left"
                  onClick={() => onGroupSelect(group.id)}
                >
                  <h4 className="font-semibold text-sm">{group.name}</h4>
                  <p className="text-xs text-muted-foreground">{group.memberCount} members</p>
                </button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleJoinGroup(group.id)}
                  disabled={joining === group.id || (user && group.members.includes(user.uid))}
                  className="text-xs"
                >
                  {joining === group.id ? 'Joining...' : (user && group.members.includes(user.uid) ? 'Joined' : 'Join')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
