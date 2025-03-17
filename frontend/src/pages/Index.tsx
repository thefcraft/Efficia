
import React from 'react';
import { Link } from 'react-router-dom'; 
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Target, 
  Clock, 
  Ban, 
  CheckSquare, 
  FileText,
  ArrowRight,
  Sparkles,
  BarChart,
  Brain,
  Bot,
  History,
  MonitorSmartphone,
  Zap,
  Shield,
  Lightbulb,
  UserCheck
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AIChatbot } from '@/components/ai/AIChatbot';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 fade-in">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white font-display font-bold">E</span>
            </div>
            <span className="font-display font-semibold text-xl">Efficia</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">Dashboard</Link>
            <Link to="/goals" className="text-sm font-medium text-muted-foreground hover:text-foreground">Goals</Link>
            <Link to="/sessions" className="text-sm font-medium text-muted-foreground hover:text-foreground">Sessions</Link>
            <Link to="/blocks" className="text-sm font-medium text-muted-foreground hover:text-foreground">Blocks</Link>
            <Link to="/activity-history" className="text-sm font-medium text-muted-foreground hover:text-foreground">Activity</Link>
            <Link to="/ai-assistant" className="text-sm font-medium text-muted-foreground hover:text-foreground">AI Assistant</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="outline">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-16">
        <section className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight">
            Your Productivity Revolution <span className="text-primary">Powered by AI</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Minimize distractions, track your productivity, and leverage AI to achieve your goals more effectively than ever before.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button size="lg" className="gap-2">
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/ai-assistant">
              <Button size="lg" variant="outline" className="gap-2">
                Try AI Assistant <Bot className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
        
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card>
            <CardHeader>
              <div className="p-2 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Brain className="h-6 w-6" />
              </div>
              <CardTitle>AI-Powered Insights</CardTitle>
              <CardDescription>Leverage AI to analyze your productivity patterns and get personalized recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm">Smart productivity analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm">Goal achievement predictions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm">Distraction pattern detection</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link to="/ai-assistant" className="text-sm text-primary hover:underline">
                Try AI features →
              </Link>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="p-2 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Ban className="h-6 w-6" />
              </div>
              <CardTitle>Smart Blocking</CardTitle>
              <CardDescription>Create focus sessions that intelligently block distracting apps and websites</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm">Website and app blocking</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm">AI-optimized block schedules</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm">Goal-specific block lists</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link to="/blocks" className="text-sm text-primary hover:underline">
                Set up blocking →
              </Link>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="p-2 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                <History className="h-6 w-6" />
              </div>
              <CardTitle>Activity Tracking</CardTitle>
              <CardDescription>Get detailed insights into how you spend your time with powerful tracking tools</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <MonitorSmartphone className="h-4 w-4 text-primary" />
                  <span className="text-sm">App & website usage analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <MonitorSmartphone className="h-4 w-4 text-primary" />
                  <span className="text-sm">Productivity timeline view</span>
                </li>
                <li className="flex items-center gap-2">
                  <MonitorSmartphone className="h-4 w-4 text-primary" />
                  <span className="text-sm">Detailed activity history</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link to="/activity-history" className="text-sm text-primary hover:underline">
                View your activity →
              </Link>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="p-2 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Target className="h-6 w-6" />
              </div>
              <CardTitle>Smart Goals</CardTitle>
              <CardDescription>Set and achieve your goals with AI-assisted planning and tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <span className="text-sm">AI goal recommendations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <span className="text-sm">Progress tracking & insights</span>
                </li>
                <li className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <span className="text-sm">Adaptive goal strategies</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link to="/goals" className="text-sm text-primary hover:underline">
                Set your goals →
              </Link>
            </CardFooter>
          </Card>
        </section>
        
        <section className="mb-16">
          <div className="bg-accent rounded-xl p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-display font-bold mb-4">Try Our AI Assistant</h2>
                <p className="text-muted-foreground mb-6">
                  Experience the power of our AI assistant that can help you plan your day, create learning paths, 
                  draft emails, and optimize your productivity through voice or text commands.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-primary mt-0.5" />
                    <p className="text-sm">
                      <span className="font-medium">Voice Commands</span> - Simply speak to get things done
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-primary mt-0.5" />
                    <p className="text-sm">
                      <span className="font-medium">Personalized Advice</span> - Get recommendations based on your data
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-primary mt-0.5" />
                    <p className="text-sm">
                      <span className="font-medium">Smart Automation</span> - Let AI handle routine productivity tasks
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <Link to="/ai-assistant">
                    <Button className="gap-2">
                      <Bot className="h-4 w-4" />
                      Start Using AI Assistant
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="lg:pl-8">
                <div className="rounded-lg border bg-card shadow-sm">
                  <div className="p-6">
                    <div className="flex items-center gap-2 pb-4 mb-4 border-b">
                      <Brain className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">AI Assistant Preview</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-end">
                        <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-[80%]">
                          <p className="text-sm">Help me learn Python in 30 days</p>
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-accent rounded-lg px-4 py-2 max-w-[80%]">
                          <p className="text-sm">Here's a 30-day Python learning plan:</p>
                          <ul className="text-sm mt-2 space-y-1">
                            <li>• Week 1: Python basics (variables, data types, loops)</li>
                            <li>• Week 2: Functions, modules, and file I/O</li>
                            <li>• Week 3: Object-oriented programming</li>
                            <li>• Week 4: Web development with Flask and APIs</li>
                          </ul>
                          <p className="text-sm mt-2">Would you like me to create a more detailed schedule?</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="md:col-span-3 text-center mb-8">
            <h2 className="text-3xl font-display font-bold mb-3">Real Results for Real Users</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our users are reporting significant improvements in their productivity and focus.
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Sarah T.</p>
                  <p className="text-xs text-muted-foreground">Software Developer</p>
                </div>
              </div>
              <CardDescription className="text-base text-foreground">
                "The AI assistant helped me create a realistic learning path for React, and the blocking features
                helped me stay focused. I've increased my productive hours by 35%!"
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Michael R.</p>
                  <p className="text-xs text-muted-foreground">UX Designer</p>
                </div>
              </div>
              <CardDescription className="text-base text-foreground">
                "The activity tracking gave me incredible insights into where my time was actually going.
                I was able to reclaim 2 hours per day that I didn't realize I was wasting."
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Jessica L.</p>
                  <p className="text-xs text-muted-foreground">Content Creator</p>
                </div>
              </div>
              <CardDescription className="text-base text-foreground">
                "I love being able to use voice commands to manage my todo list and set focus sessions.
                The AI insights have helped me identify my most productive hours."
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
        
        <section className="border-t pt-16 pb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Ready to Transform Your Productivity?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Join thousands of users who have improved their focus and productivity with Efficia's AI-powered platform
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <Link to="/dashboard">
              <Button size="lg">Go to Dashboard</Button>
            </Link>
            <Link to="/ai-assistant">
              <Button size="lg" variant="outline" className="gap-2">
                <Bot className="h-4 w-4" />
                Try AI Assistant
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
