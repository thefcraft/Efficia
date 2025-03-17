
import React from 'react';
import { SideNavigation } from '@/components/layout/SideNavigation';
import { Header } from '@/components/Header';
import { AIChatbot } from '@/components/ai/AIChatbot';
import { 
  Brain, 
  Sparkles, 
  Lightbulb, 
  Bot, 
  Target, 
  Clock, 
  CheckSquare, 
  ArrowRight,
  Wrench
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AIChat = () => {
  return (
    <div className="flex min-h-screen">
      <SideNavigation />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 py-6 px-6 bg-background">
          <AIChatbot />
        </main>
      </div>
    </div>
  );
};

export default AIChat;
