
import React from 'react';
import { Clock, Ban, Target } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useThemeStore } from '@/stores/useThemeStore';
import { cn } from '@/lib/utils';

interface TimelineEventProps {
  event: {
    id: number;
    time: string;
    duration: string;
    title: string;
    type: string;
    category: string;
    color: string;
    details?: string;
    goal?: string;
    blocked?: number;
  };
}

export function TimelineEvent({ event }: TimelineEventProps) {
  const {systemTheme, theme} = useThemeStore()
  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  return (
    <div className="flex group">
      {/* Time column */}
      <div className="w-20 flex-shrink-0 text-right pr-4">
        <span className="text-sm font-medium relative bg-background rounded-lg px-1 py-0.5 inline-block">{event.time}</span>
      </div>
      
      {/* Dot */}
      <div className="flex-shrink-0 relative">
        <div className={`w-6 h-6 rounded-full ${event.color} flex items-center justify-center text-white z-10 relative`}>
          <span className="text-xs">{event.duration.split(' ')[0]}</span>
        </div>
      </div>
      
      {/* Event content */}
      <div className="flex-grow pl-4 pb-8">
        <Card className="hover:shadow-md transition-all group-hover:border-primary/50">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{event.title}</h3>
                <Badge variant="outline" className={event.color}>
                  {event.category}
                </Badge>
              </div>
              <div className="flex items-center text-sm text-muted-foreground mt-1 md:mt-0">
                <Clock className="h-3 w-3 mr-1" />
                <span>{event.duration}</span>
              </div>
            </div>
            
            {event.details && (
              <p className="text-sm text-muted-foreground mb-2">{event.details}</p>
            )}
            
            <div className="flex flex-wrap gap-3 mt-2">
              {event.goal && (
                <div className="flex items-center gap-1 text-xs bg-secondary/50 px-2 py-1 rounded-full">
                  <Target className="h-3 w-3 text-muted-foreground" />
                  <span>{event.goal}</span>
                </div>
              )}
              
              {event.blocked && (
                <div className="flex items-center gap-1 text-xs bg-secondary/50 px-2 py-1 rounded-full">
                  <Ban className="h-3 w-3 text-muted-foreground" />
                  <span>{event.blocked} blocked</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
