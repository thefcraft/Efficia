
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ban } from 'lucide-react';

interface BlockedApp {
  id: string;
  name: string;
  icon: string;
  category: string;
}

const apps: BlockedApp[] = [
  { id: '1', name: 'YouTube', icon: 'Y', category: 'Social Media' },
  { id: '2', name: 'Facebook', icon: 'F', category: 'Social Media' },
  { id: '3', name: 'Twitter', icon: 'T', category: 'Social Media' },
  { id: '4', name: 'Instagram', icon: 'I', category: 'Social Media' },
  { id: '5', name: 'Discord', icon: 'D', category: 'Communication' },
];

export function BlockedApps() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Currently Blocked</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {apps.map((app) => (
            <div 
              key={app.id} 
              className="flex items-center justify-between p-2 rounded-md border"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center font-medium">
                  {app.icon}
                </div>
                <div>
                  <div className="font-medium text-sm">{app.name}</div>
                  <div className="text-xs text-muted-foreground">{app.category}</div>
                </div>
              </div>
              <Ban className="h-4 w-4 text-destructive" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
