"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChatInterface() {
  return (
    <Card className="sticky top-[10rem]">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="w-5 h-5 text-primary" />
                Global Chat
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="h-40 bg-muted/50 rounded-md p-2 overflow-y-auto text-xs flex flex-col gap-2">
                <p><strong className="text-primary">Ahmed:</strong> Welcome everyone!</p>
                <p><strong className="text-primary">Fatima:</strong> Hey! Glad to be here.</p>
            </div>
            <div className="flex gap-2 mt-2">
                <Input placeholder="Type a message..." className="h-9"/>
                <Button size="sm">Send</Button>
            </div>
        </CardContent>
    </Card>
  );
}
