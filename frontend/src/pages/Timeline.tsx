
import React, { useState } from 'react';
import { SideNavigation } from '@/components/layout/SideNavigation';
import { Header } from '@/components/Header';
import {
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Target,
  Ban,
  CheckSquare,
  AlarmClock,
  Filter,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TimelineEvent } from '@/components/timeline/TimelineEvent';
import { SelectDate } from '@/components/timeline/SelectDate';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Timeline = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Mock timeline data
  const timelineEvents = [
    {
      id: 1,
      time: '08:00 AM',
      duration: '30 min',
      title: 'Morning Exercise',
      type: 'session',
      category: 'Exercise',
      color: 'bg-green-500',
      details: 'Cardio workout session'
    },
    {
      id: 2,
      time: '09:00 AM',
      duration: '2 hr',
      title: 'Deep Work: Client Project',
      type: 'session',
      category: 'Work',
      color: 'bg-blue-500',
      details: 'Working on dashboard UI design',
      blocked: 6
    },
    {
      id: 3,
      time: '11:15 AM',
      duration: '15 min',
      title: 'Coffee Break',
      type: 'break',
      category: 'Break',
      color: 'bg-amber-500'
    },
    {
      id: 4,
      time: '11:30 AM',
      duration: '30 min',
      title: 'Team Meeting',
      type: 'session',
      category: 'Meeting',
      color: 'bg-purple-500',
      details: 'Weekly sync with design team'
    },
    {
      id: 5,
      time: '12:00 PM',
      duration: '1 hr',
      title: 'Lunch Break',
      type: 'break',
      category: 'Break',
      color: 'bg-amber-500'
    },
    {
      id: 6,
      time: '01:00 PM',
      duration: '2 hr',
      title: 'Python Learning',
      type: 'session',
      category: 'Learning',
      color: 'bg-indigo-500',
      details: 'Machine learning course module',
      goal: 'Learn Python',
      blocked: 4
    },
    {
      id: 7,
      time: '03:00 PM',
      duration: '1 hr',
      title: 'Project Planning',
      type: 'session',
      category: 'Work',
      color: 'bg-blue-500',
      details: 'Roadmap for Q3 features'
    },
    {
      id: 8,
      time: '04:00 PM',
      duration: '30 min',
      title: 'Reading Session',
      type: 'session',
      category: 'Learning',
      color: 'bg-indigo-500',
      details: 'Book: Design Patterns',
      goal: 'Read 10 books'
    },
    {
      id: 9,
      time: '04:30 PM',
      duration: '1.5 hr',
      title: 'Bug Fixing',
      type: 'session',
      category: 'Work',
      color: 'bg-blue-500',
      details: 'Address client feedback'
    },
    {
      id: 10,
      time: '06:00 PM',
      duration: '20 min',
      title: 'Daily Review',
      type: 'session',
      category: 'Planning',
      color: 'bg-rose-500',
      details: 'Update todos and plan tomorrow'
    }
  ];
  
  // Function to format date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  // Handle date navigation
  const navigateDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };
  
  // Calculate productivity metrics
  const totalHours = 8.5;
  const focusHours = 6.5;
  const distractionCount = 10;
  const completedTasks = 7;
  
  return (
    <div className="flex min-h-screen">
      <SideNavigation />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 py-6 px-6 bg-background">
          <div className="max-w-6xl mx-auto fade-in">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-display font-bold">Timeline</h1>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateDate(-1)} className="h-9 w-9 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <p className="text-sm font-medium px-2">{formatDate(selectedDate)}</p>
                <Button variant="outline" size="sm" onClick={() => navigateDate(1)} className="h-9 w-9 p-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <SelectDate selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Focus Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold">{focusHours}</span>
                    <span className="text-sm text-muted-foreground ml-1">hrs</span>
                    <span className="text-sm text-muted-foreground ml-2">/ {totalHours} hrs total</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{width: `${(focusHours/totalHours) * 100}%`}}
                    ></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Distractions Blocked</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold">{distractionCount}</span>
                    <div className="flex items-center ml-2 text-xs text-green-600 bg-green-100 rounded px-1">
                      <span>-30%</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">vs. your daily average</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold">{completedTasks}</span>
                    <span className="text-sm text-muted-foreground ml-2">tasks</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">3 tasks remaining for today</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Session Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold">76%</span>
                    <div className="flex items-center ml-2 text-xs text-green-600 bg-green-100 rounded px-1">
                      <span>+12%</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">AI-measured focus quality</p>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="timeline" className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="heatmap">Focus Heatmap</TabsTrigger>
                  <TabsTrigger value="apps">Apps & Sites</TabsTrigger>
                </TabsList>
                
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" /> Filter
                </Button>
              </div>
              
              <TabsContent value="timeline" className="mt-0">
                <Card>
                  <CardContent className="p-0">
                    <div className="p-6 border-b">
                      <div className="flex items-center gap-6">
                        <Badge className="bg-blue-500">Work</Badge>
                        <Badge className="bg-indigo-500">Learning</Badge>
                        <Badge className="bg-amber-500">Break</Badge>
                        <Badge className="bg-green-500">Exercise</Badge>
                        <Badge className="bg-purple-500">Meeting</Badge>
                        <Badge className="bg-rose-500">Planning</Badge>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute top-0 bottom-0 left-[39px] w-px bg-border"></div>
                        
                        {/* Timeline events */}
                        <div className="space-y-8">
                          {timelineEvents.map((event) => (
                            <TimelineEvent key={event.id} event={event} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="heatmap" className="mt-0">
                <Card className="p-6">
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium mb-2">Focus Heatmap</h3>
                    <p className="text-muted-foreground">This feature will show you when you're most productive during the day.</p>
                    <div className="flex justify-center mt-4">
                      <img 
                        src="https://via.placeholder.com/800x400?text=Focus+Heatmap+Visualization" 
                        alt="Focus Heatmap" 
                        className="max-w-full rounded-lg border"
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="apps" className="mt-0">
                <Card className="p-6">
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium mb-2">Application and Website Usage</h3>
                    <p className="text-muted-foreground">This feature will show which apps and websites you used most during the day.</p>
                    <div className="flex justify-center mt-4">
                      <img 
                        src="https://via.placeholder.com/800x400?text=App+Usage+Chart" 
                        alt="App Usage" 
                        className="max-w-full rounded-lg border"
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-between items-center mt-10 mb-4">
              <h2 className="text-xl font-semibold">AI Insights</h2>
              <Button variant="ghost" size="sm" className="gap-2">
                <Target className="h-4 w-4" /> Get More Insights
              </Button>
            </div>
            
            <Card className="border border-primary/20 bg-primary/5">
              <CardHeader className="pb-2 flex flex-row items-center gap-2">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">AI Productivity Insights</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm">Based on your activity patterns today:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-4 w-4 text-primary flex-shrink-0">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <p className="text-sm">Your most productive hours were between 9:00 AM and 11:00 AM. Consider scheduling important tasks during this time window.</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-4 w-4 text-primary flex-shrink-0">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <p className="text-sm">You had fewer distractions during Python learning sessions compared to work sessions. The learning focus techniques could be applied to work tasks.</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-4 w-4 text-primary flex-shrink-0">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <p className="text-sm">Taking short breaks after 2-hour focus sessions has improved your overall productivity. Continue this pattern for optimal results.</p>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Timeline;
