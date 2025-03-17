
import React from 'react';
import { Link } from 'react-router-dom';
import { SideNavigation } from '@/components/layout/SideNavigation';
import { Header } from '@/components/Header';
import { 
  LayoutDashboard, 
  Target, 
  Clock, 
  Ban, 
  CheckSquare, 
  ListTodo,
  BarChart3,
  Sparkles,
  Brain,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { ActivityChart } from '@/components/dashboard/ActivityChart';
import { GoalsCard } from '@/components/dashboard/GoalsCard';
import { BlockedApps } from '@/components/dashboard/BlockedApps';
import { TodosCard } from '@/components/dashboard/TodosCard';
import { CurrentSession } from '@/components/dashboard/CurrentSession';
import { NotesPreview } from '@/components/dashboard/NotesPreview';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

const Dashboard = () => {
  return (
    <div className="flex min-h-screen">
      <SideNavigation />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 py-6 px-6 bg-background">
          <div className="max-w-6xl mx-auto fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h1 className="text-2xl font-display font-bold mb-1">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back! Here's an overview of your productivity.</p>
              </div>
              <div className="flex items-center gap-3 mt-4 md:mt-0">
                <Link to="/timeline">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    Timeline
                  </Button>
                </Link>
                <Link to="/analytics">
                  <Button variant="outline" size="sm" className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </Button>
                </Link>
                <Link to="/sessions">
                  <Button className="gap-2">
                    <Clock className="h-4 w-4" />
                    New Session
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard 
                title="Hours Focused" 
                value="24.5"
                description="Total focused hours this week"
                icon={<Clock className="h-5 w-5" />}
                trend={{ value: 12, positive: true }}
              />
              <StatCard 
                title="Active Goals" 
                value="4"
                description="2 on track, 2 behind schedule"
                icon={<Target className="h-5 w-5" />}
              />
              <StatCard 
                title="Blocked Distractions" 
                value="156"
                description="Attempts blocked this week"
                icon={<Ban className="h-5 w-5" />}
                trend={{ value: 8, positive: true }}
              />
              <StatCard 
                title="Completed Tasks" 
                value="27"
                description="Out of 35 total tasks"
                icon={<CheckSquare className="h-5 w-5" />}
                trend={{ value: 5, positive: true }}
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              <CurrentSession />
              <ActivityChart />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <RecentActivity />
              <Card className="border border-primary/20 bg-primary/5 col-span-1">
                <CardHeader className="pb-2 flex flex-row items-center gap-2">
                  <div className="p-2 rounded-md bg-primary/10 text-primary">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">AI Assistant</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <p className="text-sm">How can I help you be more productive today?</p>
                    <div className="grid grid-cols-1 gap-2">
                      <Button variant="outline" size="sm" className="justify-start text-left text-sm font-normal">Help me prioritize my tasks</Button>
                      <Button variant="outline" size="sm" className="justify-start text-left text-sm font-normal">Create a focused study plan</Button>
                      <Button variant="outline" size="sm" className="justify-start text-left text-sm font-normal">Recommend productivity techniques</Button>
                      <Button variant="outline" size="sm" className="justify-start text-left text-sm font-normal">Analyze my distractions</Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full gap-2">
                    <Sparkles className="h-4 w-4" />
                    Ask AI Assistant
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <GoalsCard />
              <TodosCard />
              <BlockedApps />
            </div>
            
            <div className="mt-6">
              <NotesPreview />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
