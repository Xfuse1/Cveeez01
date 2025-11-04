'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { Group } from '@/types/talent-space';
import { Users } from 'lucide-react';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';

interface GroupSidebarProps {
  groups: Group[];
  onGroupSelect?: (groupId: string) => void;
}

export function GroupSidebar({ groups, onGroupSelect }: GroupSidebarProps) {
  const { language } = useLanguage();
  const t = translations[language].talentSpace;

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <span>{t.groups.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {groups.length > 0 ? (
          <>
            <ul className="space-y-3">
              {groups.map((group) => (
                <li key={group.id}>
                  <button
                    onClick={() => onGroupSelect?.(group.id)}
                    className="flex items-center gap-3 hover:bg-accent p-2 rounded-md w-full text-left transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={group.avatarUrl} />
                      <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{group.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {group.memberCount} {t.groups.members}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <Button variant="link" className="w-full mt-2">
              {t.groups.discoverMore}
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t.groups.noGroups}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
