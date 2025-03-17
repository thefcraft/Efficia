
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from '@/lib/utils';

interface Goal {
  id: number;
  name: string;
  progress: number;
  category?: string;
}

const goals: Goal[] = [
  { id: 1, name: "Learn Python", progress: 65, category: "Learning" },
  { id: 2, name: "Complete Project", progress: 42, category: "Work" },
  { id: 3, name: "Read 10 books", progress: 30, category: "Personal" },
  { id: 4, name: "Exercise Daily", progress: 78, category: "Health" },
];

export function GoalsCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Active Goals</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="font-medium text-sm">{goal.name}</div>
                  {goal.category && (
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground">
                      {goal.category}
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium">{goal.progress}%</span>
              </div>
              <Progress 
                value={goal.progress} 
                className={cn(
                  "h-2",
                  goal.progress > 66 ? "bg-muted [&>div]:bg-green-500" :
                  goal.progress > 33 ? "bg-muted [&>div]:bg-amber-500" :
                  "bg-muted [&>div]:bg-red-500"
                )}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
