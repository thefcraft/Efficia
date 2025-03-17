
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from "@/hooks/use-toast";

export function CurrentSession() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [dashOffset, setDashOffset] = useState(0);
  
  // Calculate the formatted time
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  // Calculate the circle progress
  useEffect(() => {
    const totalTime = 25 * 60; // 25 minutes in seconds
    const progress = 1 - (timeLeft / totalTime);
    const circumference = 2 * Math.PI * 58; // 2πr
    setDashOffset(circumference * progress);
  }, [timeLeft]);

  // Timer effect
  useEffect(() => {
    let intervalId: number;
    
    if (isPlaying && timeLeft > 0) {
      intervalId = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    
    return () => clearInterval(intervalId);
  }, [isPlaying, timeLeft]);

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
    toast({
      title: isPlaying ? "Session paused" : "Session resumed",
      description: isPlaying ? "You've paused your deep work session" : "Your deep work session has resumed"
    });
  };

  const skipSession = () => {
    setTimeLeft(25 * 60);
    setIsPlaying(false);
    toast({
      title: "Session skipped",
      description: "Your session has been reset to 25 minutes"
    });
  };

  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Current Session</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col items-center text-center py-4">
          <div className="relative">
            <svg className="w-32 h-32">
              <circle
                className="text-muted stroke-current"
                strokeWidth="4"
                stroke="currentColor"
                fill="transparent"
                r="58"
                cx="64"
                cy="64"
              />
              <circle
                className="text-primary stroke-current"
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="58"
                cx="64"
                cy="64"
                strokeDasharray="364.4"
                strokeDashoffset={dashOffset}
                transform="rotate(-90 64 64)"
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-3xl font-bold">{formattedTime}</p>
              <p className="text-xs text-muted-foreground">minutes remaining</p>
            </div>
          </div>
          
          <h3 className="text-xl font-medium mt-6">Deep Work Session</h3>
          <p className="text-sm text-muted-foreground mt-1">Focus on project completion</p>
          
          <div className="flex items-center gap-4 mt-6">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full h-12 w-12"
              onClick={skipSession}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
            <Button 
              size="icon" 
              className="rounded-full h-16 w-16 bg-primary"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full h-12 w-12"
              onClick={skipSession}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
