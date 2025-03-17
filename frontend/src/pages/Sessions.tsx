import React, { useState } from 'react';
import { SideNavigation } from '@/components/layout/SideNavigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Play, 
  Pause, 
  Ban, 
  Target, 
  AlarmClock, 
  Calendar, 
  BarChart,
  Timer,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from "@/hooks/use-toast";

interface Session {
  id: number;
  name: string;
  description?: string;
  duration?: number; // in minutes
  goalId?: number;
  goalName?: string;
  status: 'active' | 'completed' | 'scheduled';
  startTime?: string;
  endTime?: string;
  date?: string;
  blocked?: number;
}

const sessionTemplates = [
  { id: 1, name: 'Deep Work', description: 'Focused work without distractions', icon: <Clock /> },
  { id: 2, name: 'Pomodoro', description: '25min focus + 5min break', icon: <Timer /> },
  { id: 3, name: 'Learning', description: 'Dedicated to skill acquisition', icon: <Target /> },
  { id: 4, name: 'Reading', description: 'Distraction-free reading session', icon: <Ban /> },
  { id: 5, name: 'Meeting', description: 'Collaborative discussion session', icon: <Calendar /> },
];

const initialSessions: Session[] = [
  { 
    id: 1, 
    name: 'Deep Work', 
    description: 'Working on the client dashboard project',
    duration: 60,
    goalId: 2,
    goalName: 'Complete Project',
    status: 'active',
    startTime: '09:30 AM',
    blocked: 8
  },
  { 
    id: 2, 
    name: 'Python Learning', 
    description: 'Machine learning module',
    duration: 45,
    goalId: 1,
    goalName: 'Learn Python',
    status: 'scheduled',
    startTime: '02:00 PM',
    date: 'Today'
  },
  { 
    id: 3, 
    name: 'Reading Session', 
    description: 'Book: The Power of Habit',
    duration: 30,
    goalId: 3,
    goalName: 'Read 10 books',
    status: 'completed',
    startTime: '08:00 AM',
    endTime: '08:30 AM',
    date: 'Today',
    blocked: 3
  },
  { 
    id: 4, 
    name: 'Morning Exercise', 
    description: 'Cardio workout',
    duration: 30,
    goalId: 4,
    goalName: 'Exercise Daily',
    status: 'completed',
    startTime: '06:30 AM',
    endTime: '07:00 AM',
    date: 'Today',
    blocked: 0
  },
  { 
    id: 5, 
    name: 'Spanish Practice', 
    description: 'Vocabulary and grammar',
    duration: 25,
    goalId: 5,
    goalName: 'Learn Spanish',
    status: 'scheduled',
    startTime: '07:00 PM',
    date: 'Today'
  },
];

const NewSessionDialog = ({ onAdd }: { onAdd: (session: Omit<Session, 'id' | 'status' | 'blocked'>) => void }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('25');
  const [goalName, setGoalName] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Session name is required",
        variant: "destructive"
      });
      return;
    }
    
    const newSession = {
      name,
      description,
      duration: parseInt(duration, 10) || 25,
      goalName: goalName || undefined,
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today'
    };
    
    onAdd(newSession);
    setName('');
    setDescription('');
    setDuration('25');
    setGoalName('');
    setOpen(false);
    
    toast({
      title: "Session Created",
      description: `"${name}" has been created and scheduled.`
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full gap-2">
          <Clock className="h-4 w-4" />
          Start New Session
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Session Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter session name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Describe your session"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input 
              id="duration" 
              type="number" 
              value={duration} 
              onChange={(e) => setDuration(e.target.value)} 
              min="1"
              max="180"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="goalName">Goal (optional)</Label>
            <Input 
              id="goalName" 
              value={goalName} 
              onChange={(e) => setGoalName(e.target.value)} 
              placeholder="Associated goal name"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Start Session</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const SessionCard = ({ session, onStartSession, onPauseSession }: { 
  session: Session, 
  onStartSession: (id: number) => void,
  onPauseSession: (id: number) => void
}) => {
  const isActive = session.status === 'active';
  const isCompleted = session.status === 'completed';
  
  return (
    <Card className={`hover:shadow-md transition-shadow ${isActive ? 'border-primary border-2' : ''}`}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium">{session.name}</h3>
              {session.description && (
                <p className="text-sm text-muted-foreground mt-1">{session.description}</p>
              )}
            </div>
            <Badge variant={isActive ? "default" : isCompleted ? "outline" : "secondary"}>
              {isActive ? "Active" : isCompleted ? "Completed" : "Scheduled"}
            </Badge>
          </div>
          
          {session.goalName && (
            <div className="flex items-center gap-1.5">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{session.goalName}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {session.duration} min
              </span>
            </div>
            
            {isActive && (
              <div className="flex items-center gap-1.5">
                <Ban className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {session.blocked} blocked
                </span>
              </div>
            )}
            
            {(session.startTime || session.date) && (
              <div className="text-sm text-muted-foreground">
                {session.status === 'completed' ? 
                  `${session.startTime} - ${session.endTime}` : 
                  `${session.startTime}${session.date && session.date !== 'Today' ? `, ${session.date}` : ''}`
                }
              </div>
            )}
          </div>
          
          {isActive && (
            <div className="flex justify-end pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={() => onPauseSession(session.id)}
              >
                <Pause className="h-3.5 w-3.5" />
                Pause
              </Button>
            </div>
          )}
          
          {!isActive && !isCompleted && (
            <div className="flex justify-end pt-2">
              <Button 
                size="sm" 
                className="gap-1"
                onClick={() => onStartSession(session.id)}
              >
                <Play className="h-3.5 w-3.5" />
                Start
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Sessions = () => {
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [currentTab, setCurrentTab] = useState("current");

  const startSession = (id: number) => {
    setSessions(prev => 
      prev.map(session => 
        session.id === id 
          ? { 
              ...session, 
              status: 'active', 
              startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
              blocked: 0 
            } 
          : session
      )
    );
    
    toast({
      title: "Session Started",
      description: "Your focus session has begun. Stay focused!"
    });
    
    setCurrentTab("current");
  };

  const pauseSession = (id: number) => {
    setSessions(prev => 
      prev.map(session => 
        session.id === id 
          ? { 
              ...session, 
              status: 'scheduled'
            } 
          : session
      )
    );
    
    toast({
      title: "Session Paused",
      description: "Your session has been paused. Resume when ready."
    });
  };

  const addNewSession = (sessionData: Omit<Session, 'id' | 'status' | 'blocked'>) => {
    const newId = Math.max(...sessions.map(s => s.id)) + 1;
    setSessions([
      ...sessions, 
      { 
        id: newId, 
        ...sessionData, 
        status: 'scheduled', 
        blocked: 0
      }
    ]);
  };

  const useTemplate = (templateId: number) => {
    const template = sessionTemplates.find(t => t.id === templateId);
    
    if (template) {
      const newId = Math.max(...sessions.map(s => s.id)) + 1;
      setSessions([
        ...sessions, 
        { 
          id: newId, 
          name: template.name, 
          description: template.description, 
          duration: 25, 
          status: 'scheduled', 
          startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: 'Today'
        }
      ]);
      
      toast({
        title: "Template Used",
        description: `${template.name} session has been created.`
      });
      
      setCurrentTab("scheduled");
    }
  };

  const createNewTemplate = () => {
    toast({
      title: "Create Template",
      description: "This feature is coming soon!"
    });
  };

  return (
    <div className="flex min-h-screen">
      <SideNavigation />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 py-6 px-6 bg-background">
          <div className="max-w-6xl mx-auto fade-in">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-display font-bold">Sessions</h1>
              <NewSessionDialog onAdd={addNewSession} />
            </div>
            
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="mb-8">
              <TabsList>
                <TabsTrigger value="current">Current</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
              </TabsList>
              
              <TabsContent value="current" className="mt-6">
                {sessions.filter(s => s.status === 'active').length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessions.filter(s => s.status === 'active').map(session => (
                      <SessionCard 
                        key={session.id} 
                        session={session} 
                        onStartSession={startSession}
                        onPauseSession={pauseSession}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No active sessions.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4 gap-2"
                      onClick={() => {
                        setCurrentTab("scheduled");
                        toast({
                          title: "Start a Session",
                          description: "Choose from your scheduled sessions or create a new one"
                        });
                      }}
                    >
                      <Play className="h-4 w-4" />
                      Start a Session
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="scheduled" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sessions.filter(s => s.status === 'scheduled').map(session => (
                    <SessionCard 
                      key={session.id} 
                      session={session} 
                      onStartSession={startSession}
                      onPauseSession={pauseSession}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sessions.filter(s => s.status === 'completed').map(session => (
                    <SessionCard 
                      key={session.id} 
                      session={session} 
                      onStartSession={startSession}
                      onPauseSession={pauseSession}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="templates" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sessionTemplates.map(template => (
                    <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-full bg-primary/10 text-primary">
                            {template.icon}
                          </div>
                          <h3 className="text-lg font-medium">{template.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-4 w-full gap-2"
                          onClick={() => useTemplate(template.id)}
                        >
                          <Play className="h-3.5 w-3.5" />
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Card 
                    className="hover:shadow-md transition-shadow cursor-pointer border-dashed"
                    onClick={createNewTemplate}
                  >
                    <CardContent className="pt-6 flex flex-col items-center justify-center h-full text-center">
                      <div className="p-3 rounded-full bg-secondary text-secondary-foreground mb-3">
                        <Plus className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-medium">New Template</h3>
                      <p className="text-sm text-muted-foreground mt-1">Create a custom session template</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Sessions;
