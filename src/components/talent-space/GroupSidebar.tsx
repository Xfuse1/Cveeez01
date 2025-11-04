'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { Group } from '@/types/talent-space';
import { Users } from 'lucide-react';

interface GroupSidebarProps {
  groups: Group[];
}

export function GroupSidebar({ groups }: GroupSidebarProps) {
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <span>My Groups</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {groups.map((group) => (
            <li key={group.id}>
              <a href="#" className="flex items-center gap-3 hover:bg-accent p-2 rounded-md">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={group.avatarUrl} />
                  <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm">{group.name}</span>
              </a>
            </li>
          ))}
        </ul>
        <Button variant="link" className="w-full mt-2">
          Discover more groups
        </Button>
      </CardContent>
    </Card>
  );
}
