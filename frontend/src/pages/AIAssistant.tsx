
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

const AIAssistant = () => {
  return (
    <div className="flex min-h-screen">
      <SideNavigation />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 py-6 px-6 bg-background">
          <div className="max-w-7xl mx-auto fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h1 className="text-2xl font-display font-bold mb-1">AI Assistant</h1>
                <p className="text-muted-foreground">Your intelligent productivity companion</p>
              </div>
              <div className="flex items-center gap-3 mt-4 md:mt-0">
                <Button variant="outline" size="sm" className="gap-2">
                  <Bot className="h-4 w-4" />
                  Voice Commands
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Wrench className="h-4 w-4" />
                  Settings
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <AIChatbot />
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Quick Commands</CardTitle>
                    <CardDescription>Try these voice or text commands</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-2 rounded-md bg-accent hover:bg-accent/80 transition-colors cursor-pointer">
                        <p className="text-sm font-medium">Create a study plan for Python</p>
                      </div>
                      <div className="p-2 rounded-md bg-accent hover:bg-accent/80 transition-colors cursor-pointer">
                        <p className="text-sm font-medium">Write an email to my team about the project status</p>
                      </div>
                      <div className="p-2 rounded-md bg-accent hover:bg-accent/80 transition-colors cursor-pointer">
                        <p className="text-sm font-medium">Help me focus for the next 2 hours</p>
                      </div>
                      <div className="p-2 rounded-md bg-accent hover:bg-accent/80 transition-colors cursor-pointer">
                        <p className="text-sm font-medium">What were my most productive hours yesterday?</p>
                      </div>
                      <div className="p-2 rounded-md bg-accent hover:bg-accent/80 transition-colors cursor-pointer">
                        <p className="text-sm font-medium">Create a new goal for learning React</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">AI Features</CardTitle>
                    <CardDescription>What your AI assistant can do</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                          <Target className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Goal Planning</h4>
                          <p className="text-xs text-muted-foreground">Create detailed learning and achievement plans</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Focus Sessions</h4>
                          <p className="text-xs text-muted-foreground">AI-powered focus techniques and timers</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Content Creation</h4>
                          <p className="text-xs text-muted-foreground">Draft emails, notes, and other content</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                          <CheckSquare className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Task Management</h4>
                          <p className="text-xs text-muted-foreground">Optimize your task list and priorities</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Productivity Insights</h4>
                          <p className="text-xs text-muted-foreground">AI analysis of your work patterns</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full text-sm gap-2">
                      View All Features
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-3">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Recent AI Insights</CardTitle>
                  <CardDescription>Personalized productivity insights from your data</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="patterns">
                    <TabsList className="mb-4">
                      <TabsTrigger value="patterns">Work Patterns</TabsTrigger>
                      <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                      <TabsTrigger value="distractions">Distractions</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="patterns" className="space-y-4">
                      <div className="p-4 rounded-lg border bg-card/50">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-primary/10 text-primary">
                            <Lightbulb className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Morning Productivity Peak</h4>
                            <p className="text-sm text-muted-foreground">
                              Your data shows you're most productive between 9AM and 11AM. Consider scheduling your most important or challenging tasks during this time window.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg border bg-card/50">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-primary/10 text-primary">
                            <Lightbulb className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Post-Lunch Productivity Dip</h4>
                            <p className="text-sm text-muted-foreground">
                              You tend to have a productivity dip between 1PM and 2PM after lunch. This might be a good time for less demanding tasks or short breaks.
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="recommendations" className="space-y-4">
                      <div className="p-4 rounded-lg border bg-card/50">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-primary/10 text-primary">
                            <Sparkles className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Pomodoro Technique</h4>
                            <p className="text-sm text-muted-foreground">
                              Based on your work patterns, try using 25-minute focused work sessions followed by 5-minute breaks. This aligns well with your natural focus rhythm.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg border bg-card/50">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-primary/10 text-primary">
                            <Sparkles className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Meeting Optimization</h4>
                            <p className="text-sm text-muted-foreground">
                              Consider scheduling meetings in the afternoon between 3PM and 5PM when your focus on deep work tasks naturally declines.
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="distractions" className="space-y-4">
                      <div className="p-4 rounded-lg border bg-card/50">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-primary/10 text-primary">
                            <Brain className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Social Media Usage</h4>
                            <p className="text-sm text-muted-foreground">
                              You spent an average of 45 minutes per day on social media sites during work hours last week. This is a 15% increase from the previous week.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg border bg-card/50">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-primary/10 text-primary">
                            <Brain className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Email Checking Pattern</h4>
                            <p className="text-sm text-muted-foreground">
                              You check your email approximately every 15 minutes. Consider setting specific times for email (e.g., once per hour) to reduce context switching.
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AIAssistant;
