
import React, { useState, useEffect } from 'react';
import { SideNavigation } from '@/components/layout/SideNavigation';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Bell, 
  Timer, 
  Plus, 
  Play, 
  Pause, 
  RotateCcw, 
  Calendar, 
  Target, 
  Clock, 
  AlarmClock,
  Settings,
  CheckCircle2,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/hooks/use-toast";

interface TimerItem {
  id: number;
  title: string;
  duration: string; // formatted as MM:SS
  description?: string;
  goalId?: number;
  goalName?: string;
  isActive?: boolean;
  timeRemaining?: string; // formatted as MM:SS
}

interface AlarmItem {
  id: number;
  title: string;
  time: string; // formatted as HH:MM
  days: string[];
  description?: string;
  goalId?: number;
  goalName?: string;
  isActive: boolean;
}

const initialTimers: TimerItem[] = [
  { 
    id: 1, 
    title: "Pomodoro", 
    duration: "25:00", 
    description: "Focus session",
    goalId: 2,
    goalName: "Complete Project",
    isActive: true,
    timeRemaining: "12:42"
  },
  { 
    id: 2, 
    title: "Short Break", 
    duration: "05:00", 
    description: "Quick rest period"
  },
  { 
    id: 3, 
    title: "Long Break", 
    duration: "15:00", 
    description: "Extended rest period"
  },
  { 
    id: 4, 
    title: "Exercise", 
    duration: "30:00", 
    description: "Daily workout",
    goalId: 4,
    goalName: "Exercise Daily"
  },
  { 
    id: 5, 
    title: "Python Practice", 
    duration: "45:00", 
    goalId: 1,
    goalName: "Learn Python"
  },
];

const initialAlarms: AlarmItem[] = [
  { 
    id: 1, 
    title: "Morning Routine", 
    time: "06:30", 
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    description: "Start the day with exercise",
    goalId: 4,
    goalName: "Exercise Daily",
    isActive: true
  },
  { 
    id: 2, 
    title: "Python Study", 
    time: "17:00", 
    days: ["Mon", "Wed", "Fri"],
    goalId: 1,
    goalName: "Learn Python",
    isActive: true
  },
  { 
    id: 3, 
    title: "Reading Time", 
    time: "21:00", 
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    goalId: 3,
    goalName: "Read 10 books",
    isActive: false
  },
  { 
    id: 4, 
    title: "Spanish Practice", 
    time: "19:00", 
    days: ["Tue", "Thu", "Sat"],
    goalId: 5,
    goalName: "Learn Spanish",
    isActive: true
  },
];

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const NewTimerDialog = ({ onAdd }: { onAdd: (timer: Omit<TimerItem, 'id' | 'isActive' | 'timeRemaining'>) => void }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [minutes, setMinutes] = useState('25');
  const [seconds, setSeconds] = useState('00');
  const [goalName, setGoalName] = useState('');
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Timer name is required",
        variant: "destructive"
      });
      return;
    }
    
    const formattedSeconds = seconds.padStart(2, '0');
    const newTimer = {
      title,
      description,
      duration: `${minutes}:${formattedSeconds}`,
      goalName: goalName || undefined
    };
    
    onAdd(newTimer);
    resetForm();
    setOpen(false);
    
    toast({
      title: "Timer Created",
      description: `"${title}" timer has been created.`
    });
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setMinutes('25');
    setSeconds('00');
    setGoalName('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full gap-2">
          <Timer className="h-4 w-4" />
          New Timer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Timer</DialogTitle>
          <DialogDescription>
            Set up a new timer for your activities
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Timer Name</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Enter timer name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Describe what this timer is for"
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Duration</Label>
            <div className="flex gap-2 items-center">
              <Input 
                type="number" 
                value={minutes} 
                onChange={(e) => setMinutes(e.target.value)} 
                min="0"
                max="180"
                className="w-20"
              />
              <span>:</span>
              <Input 
                type="number" 
                value={seconds} 
                onChange={(e) => setSeconds(e.target.value.padStart(2, '0').slice(-2))} 
                min="0"
                max="59"
                className="w-20"
              />
              <span className="ml-2 text-sm text-muted-foreground">minutes : seconds</span>
            </div>
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
          
          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Create Timer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const NewAlarmDialog = ({ onAdd }: { onAdd: (alarm: Omit<AlarmItem, 'id'>) => void }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('08:00');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [goalName, setGoalName] = useState('');
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Alarm name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedDays.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one day",
        variant: "destructive"
      });
      return;
    }
    
    const newAlarm = {
      title,
      description,
      time,
      days: selectedDays,
      goalName: goalName || undefined,
      isActive: true
    };
    
    onAdd(newAlarm);
    resetForm();
    setOpen(false);
    
    toast({
      title: "Alarm Created",
      description: `"${title}" alarm has been set for ${time}.`
    });
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTime('08:00');
    setSelectedDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    setGoalName('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full gap-2">
          <AlarmClock className="h-4 w-4" />
          New Alarm
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Alarm</DialogTitle>
          <DialogDescription>
            Set up a recurring alarm for your schedule
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="alarmTitle">Alarm Name</Label>
            <Input 
              id="alarmTitle" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Enter alarm name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="alarmDescription">Description (optional)</Label>
            <Textarea 
              id="alarmDescription" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="What is this alarm for?"
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="alarmTime">Time</Label>
            <Input 
              id="alarmTime" 
              type="time" 
              value={time} 
              onChange={(e) => setTime(e.target.value)} 
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Repeat</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {weekdays.map(day => (
                <div 
                  key={day}
                  onClick={() => handleDayToggle(day)}
                  className={`
                    w-9 h-9 flex items-center justify-center rounded-full text-xs font-medium cursor-pointer
                    transition-colors
                    ${
                      selectedDays.includes(day) 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }
                  `}
                >
                  {day[0]}
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="alarmGoal">Goal (optional)</Label>
            <Input 
              id="alarmGoal" 
              value={goalName} 
              onChange={(e) => setGoalName(e.target.value)} 
              placeholder="Associated goal name"
            />
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Create Alarm</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const TimerCard = ({ timer, onStart, onPause, onReset }: { 
  timer: TimerItem, 
  onStart: (id: number) => void,
  onPause: (id: number) => void,
  onReset: (id: number) => void
}) => {
  return (
    <Card className={`hover:shadow-md transition-shadow ${timer.isActive ? 'border-primary border-2' : ''}`}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{timer.title}</h3>
            {timer.isActive && (
              <Badge>Active</Badge>
            )}
          </div>
          
          {timer.description && (
            <p className="text-sm text-muted-foreground">{timer.description}</p>
          )}
          
          <div className="flex items-center justify-center">
            <div className="text-3xl font-mono font-bold">
              {timer.isActive ? timer.timeRemaining : timer.duration}
            </div>
          </div>
          
          {timer.goalName && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>{timer.goalName}</span>
            </div>
          )}
          
          <div className="flex items-center justify-center gap-3 pt-2">
            {timer.isActive ? (
              <>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="rounded-full w-9 h-9 p-0"
                  onClick={() => onPause(timer.id)}
                >
                  <Pause className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="rounded-full w-9 h-9 p-0"
                  onClick={() => onReset(timer.id)}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button 
                size="sm" 
                className="rounded-full gap-1"
                onClick={() => onStart(timer.id)}
              >
                <Play className="h-3.5 w-3.5" />
                Start
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AlarmCard = ({ alarm, onToggle, onDelete }: { 
  alarm: AlarmItem, 
  onToggle: (id: number) => void,
  onDelete: (id: number) => void
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{alarm.title}</h3>
            <Switch 
              checked={alarm.isActive} 
              onCheckedChange={() => onToggle(alarm.id)}
            />
          </div>
          
          {alarm.description && (
            <p className="text-sm text-muted-foreground">{alarm.description}</p>
          )}
          
          <div className="flex items-center justify-center">
            <div className="text-3xl font-mono font-bold">
              {alarm.time}
            </div>
          </div>
          
          <div className="flex justify-center gap-1">
            {weekdays.map(day => (
              <div 
                key={day} 
                className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium ${
                  alarm.days.includes(day) 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {day[0]}
              </div>
            ))}
          </div>
          
          {alarm.goalName && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>{alarm.goalName}</span>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button 
              size="sm" 
              variant="outline" 
              className="rounded-full gap-1 text-destructive hover:text-destructive"
              onClick={() => onDelete(alarm.id)}
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Timers = () => {
  const [timers, setTimers] = useState<TimerItem[]>(initialTimers);
  const [alarms, setAlarms] = useState<AlarmItem[]>(initialAlarms);
  const [activeTimerId, setActiveTimerId] = useState<number | null>(1); // Default active timer
  const { toast } = useToast();

  useEffect(() => {
    // Simulate timer countdown for active timer
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (activeTimerId !== null) {
      interval = setInterval(() => {
        setTimers(prev => 
          prev.map(timer => {
            if (timer.id === activeTimerId && timer.isActive) {
              const [mins, secs] = timer.timeRemaining?.split(':').map(Number) || [0, 0];
              let newSecs = secs - 1;
              let newMins = mins;
              
              if (newSecs < 0) {
                newSecs = 59;
                newMins -= 1;
              }
              
              // Timer completed
              if (newMins < 0) {
                toast({
                  title: "Timer Completed",
                  description: `${timer.title} has finished!`,
                });
                return { ...timer, isActive: false, timeRemaining: timer.duration };
              }
              
              const newTimeRemaining = `${newMins.toString().padStart(2, '0')}:${newSecs.toString().padStart(2, '0')}`;
              return { ...timer, timeRemaining: newTimeRemaining };
            }
            return timer;
          })
        );
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimerId, toast]);

  const startTimer = (id: number) => {
    // If there's already an active timer, pause it
    if (activeTimerId !== null && activeTimerId !== id) {
      pauseTimer(activeTimerId);
    }
    
    setTimers(prev => 
      prev.map(timer => {
        if (timer.id === id) {
          // If timer doesn't have timeRemaining, set it to duration
          const timeRemaining = timer.timeRemaining || timer.duration;
          return { ...timer, isActive: true, timeRemaining };
        }
        return timer;
      })
    );
    
    setActiveTimerId(id);
    
    toast({
      title: "Timer Started",
      description: `${timers.find(t => t.id === id)?.title} timer has started.`
    });
  };

  const pauseTimer = (id: number) => {
    setTimers(prev => 
      prev.map(timer => 
        timer.id === id ? { ...timer, isActive: false } : timer
      )
    );
    
    if (activeTimerId === id) {
      setActiveTimerId(null);
    }
    
    toast({
      title: "Timer Paused",
      description: `${timers.find(t => t.id === id)?.title} timer has been paused.`
    });
  };

  const resetTimer = (id: number) => {
    setTimers(prev => 
      prev.map(timer => 
        timer.id === id 
          ? { ...timer, isActive: false, timeRemaining: timer.duration } 
          : timer
      )
    );
    
    if (activeTimerId === id) {
      setActiveTimerId(null);
    }
    
    toast({
      title: "Timer Reset",
      description: `${timers.find(t => t.id === id)?.title} timer has been reset.`
    });
  };

  const toggleAlarm = (id: number) => {
    setAlarms(prev => 
      prev.map(alarm => 
        alarm.id === id ? { ...alarm, isActive: !alarm.isActive } : alarm
      )
    );
    
    const alarm = alarms.find(a => a.id === id);
    if (alarm) {
      toast({
        title: alarm.isActive ? "Alarm Disabled" : "Alarm Enabled",
        description: `${alarm.title} is now ${alarm.isActive ? 'disabled' : 'enabled'}.`
      });
    }
  };

  const deleteAlarm = (id: number) => {
    const alarm = alarms.find(a => a.id === id);
    
    setAlarms(prev => prev.filter(alarm => alarm.id !== id));
    
    if (alarm) {
      toast({
        title: "Alarm Removed",
        description: `${alarm.title} has been removed.`
      });
    }
  };

  const addNewTimer = (timerData: Omit<TimerItem, 'id' | 'isActive' | 'timeRemaining'>) => {
    const newId = Math.max(0, ...timers.map(t => t.id)) + 1;
    const newTimer = { 
      id: newId, 
      ...timerData, 
      isActive: false
    };
    
    setTimers(prev => [...prev, newTimer]);
  };

  const addNewAlarm = (alarmData: Omit<AlarmItem, 'id'>) => {
    const newId = Math.max(0, ...alarms.map(a => a.id)) + 1;
    const newAlarm = { id: newId, ...alarmData };
    
    setAlarms(prev => [...prev, newAlarm]);
  };

  return (
    <div className="flex min-h-screen">
      <SideNavigation />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 py-6 px-6 bg-background">
          <div className="max-w-6xl mx-auto fade-in">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-display font-bold">Alarms & Timers</h1>
              <div className="flex gap-3">
                <NewAlarmDialog onAdd={addNewAlarm} />
                <NewTimerDialog onAdd={addNewTimer} />
              </div>
            </div>
            
            <Tabs defaultValue="timers">
              <TabsList>
                <TabsTrigger value="timers">Timers</TabsTrigger>
                <TabsTrigger value="alarms">Alarms</TabsTrigger>
              </TabsList>
              
              <TabsContent value="timers" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {timers.map(timer => (
                    <TimerCard 
                      key={timer.id} 
                      timer={timer} 
                      onStart={startTimer}
                      onPause={pauseTimer}
                      onReset={resetTimer}
                    />
                  ))}
                  
                  {/* Add new timer card */}
                  <NewTimerDialog onAdd={addNewTimer}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
                      <CardContent className="pt-6 flex flex-col items-center justify-center h-full text-center min-h-[200px]">
                        <div className="p-3 rounded-full bg-secondary text-secondary-foreground mb-3">
                          <Plus className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-medium">Add New Timer</h3>
                        <p className="text-sm text-muted-foreground mt-1">Create a custom timer</p>
                      </CardContent>
                    </Card>
                  </NewTimerDialog>
                </div>
              </TabsContent>
              
              <TabsContent value="alarms" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {alarms.map(alarm => (
                    <AlarmCard 
                      key={alarm.id} 
                      alarm={alarm} 
                      onToggle={toggleAlarm}
                      onDelete={deleteAlarm}
                    />
                  ))}
                  
                  {/* Add new alarm card */}
                  <NewAlarmDialog onAdd={addNewAlarm}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
                      <CardContent className="pt-6 flex flex-col items-center justify-center h-full text-center min-h-[200px]">
                        <div className="p-3 rounded-full bg-secondary text-secondary-foreground mb-3">
                          <Plus className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-medium">Add New Alarm</h3>
                        <p className="text-sm text-muted-foreground mt-1">Schedule recurring reminders</p>
                      </CardContent>
                    </Card>
                  </NewAlarmDialog>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Timers;
