
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Target, CheckSquare, Ban, FileText, ArrowRight } from 'lucide-react';

interface ActivityItem {
  id: number;
  title: string;
  time: string;
  type: 'session' | 'goal' | 'task' | 'block' | 'note';
  status?: string;
  description?: string;
}

const activities: ActivityItem[] = [
  {
    id: 1,
    title: 'Completed "Deep Work" Session',
    time: '35 minutes ago',
    type: 'session',
    description: '2 hours of focused work',
  },
  {
    id: 2,
    title: 'Blocked Facebook',
    time: '1 hour ago',
    type: 'block',
    status: 'During session',
  },
  {
    id: 3,
    title: 'Completed Task: "Finish UI Design"',
    time: '2 hours ago',
    type: 'task',
    status: 'Completed',
  },
  {
    id: 4,
    title: 'Added Note: "Project Ideas"',
    time: '3 hours ago',
    type: 'note',
    description: 'Added 3 new project ideas',
  },
  {
    id: 5,
    title: 'Updated Goal Progress: "Learn Python"',
    time: '5 hours ago',
    type: 'goal',
    status: '65% complete',
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case 'session':
      return <Clock className="h-4 w-4" />;
    case 'goal':
      return <Target className="h-4 w-4" />;
    case 'task':
      return <CheckSquare className="h-4 w-4" />;
    case 'block':
      return <Ban className="h-4 w-4" />;
    case 'note':
      return <FileText className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'session':
      return 'bg-blue-500';
    case 'goal':
      return 'bg-green-500';
    case 'task':
      return 'bg-purple-500';
    case 'block':
      return 'bg-red-500';
    case 'note':
      return 'bg-amber-500';
    default:
      return 'bg-gray-500';
  }
};

export function RecentActivity() {
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
        <Button variant="ghost" size="sm" className="text-xs gap-1">
          View all <ArrowRight className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
              <div className={`p-2 rounded-full ${getTypeColor(activity.type)} text-white mt-1`}>
                {getIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <span className="text-xs text-muted-foreground sm:ml-4 sm:whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
                
                {(activity.description || activity.status) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.description || activity.status}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
