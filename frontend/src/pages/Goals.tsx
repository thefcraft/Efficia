
import React, { useState } from 'react';
import { SideNavigation } from '@/components/layout/SideNavigation';
import { Header } from '@/components/Header';
import { Target, CheckCircle, CalendarClock, Clock, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Goal {
  id: number;
  name: string;
  description?: string;
  progress: number;
  category?: string;
  todos: { completed: number; total: number };
  sessions: number;
  lastActive: string;
}

// Initial goals data
const initialGoals: Goal[] = [
  { 
    id: 1, 
    name: "Learn Python", 
    description: "Master Python programming language with focus on data science libraries",
    progress: 65, 
    category: "Learning", 
    todos: { completed: 15, total: 25 },
    sessions: 12,
    lastActive: "Today"
  },
  { 
    id: 2, 
    name: "Complete Project", 
    description: "Finish the client dashboard project for XYZ Corp",
    progress: 42, 
    category: "Work", 
    todos: { completed: 8, total: 15 },
    sessions: 7,
    lastActive: "Yesterday"
  },
  { 
    id: 3, 
    name: "Read 10 books", 
    description: "Complete reading challenge for the quarter",
    progress: 30, 
    category: "Personal", 
    todos: { completed: 3, total: 10 },
    sessions: 6,
    lastActive: "3 days ago"
  },
  { 
    id: 4, 
    name: "Exercise Daily", 
    description: "Build a habit of exercising for at least 30 minutes every day",
    progress: 78, 
    category: "Health", 
    todos: { completed: 22, total: 30 },
    sessions: 24,
    lastActive: "Today"
  },
  { 
    id: 5, 
    name: "Learn Spanish", 
    description: "Become conversational in Spanish in 3 months",
    progress: 25, 
    category: "Learning", 
    todos: { completed: 5, total: 20 },
    sessions: 8,
    lastActive: "2 days ago"
  },
];

const GoalCard = ({ goal, onGoalClick }: { goal: Goal, onGoalClick: (goalId: number) => void }) => {
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer" 
      onClick={() => onGoalClick(goal.id)}
    >
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium">{goal.name}</h3>
              {goal.description && (
                <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
              )}
            </div>
            {goal.category && (
              <Badge variant="outline" className="ml-2">{goal.category}</Badge>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progress</span>
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
          
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <div className="flex items-center justify-center text-primary mb-1">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div className="text-xs font-medium">{goal.todos.completed}/{goal.todos.total}</div>
              <div className="text-xs text-muted-foreground">Tasks</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center text-primary mb-1">
                <CalendarClock className="h-4 w-4" />
              </div>
              <div className="text-xs font-medium">{goal.sessions}</div>
              <div className="text-xs text-muted-foreground">Sessions</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center text-primary mb-1">
                <Clock className="h-4 w-4" />
              </div>
              <div className="text-xs font-medium">{goal.lastActive}</div>
              <div className="text-xs text-muted-foreground">Last Active</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const NewGoalDialog = ({ onAdd }: { onAdd: (goal: Omit<Goal, 'id'>) => void }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Goal name is required",
        variant: "destructive"
      });
      return;
    }
    
    const newGoal = {
      name,
      description,
      category,
      progress: 0,
      todos: { completed: 0, total: 0 },
      sessions: 0,
      lastActive: "Just now"
    };
    
    onAdd(newGoal);
    setName('');
    setDescription('');
    setCategory('');
    setOpen(false);
    
    toast({
      title: "Goal Added",
      description: `"${name}" has been added to your goals.`
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full gap-2">
          <Target className="h-4 w-4" />
          Add New Goal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Goal Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter goal name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Describe your goal"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category (optional)</Label>
            <Input 
              id="category" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              placeholder="e.g., Work, Learning, Health"
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
            <Button type="submit">Create Goal</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const { toast } = useToast();

  const addNewGoal = (goalData: Omit<Goal, 'id'>) => {
    const newId = Math.max(...goals.map(g => g.id)) + 1;
    setGoals([...goals, { id: newId, ...goalData }]);
  };

  const handleGoalClick = (goalId: number) => {
    setSelectedGoalId(goalId);
    const goal = goals.find(g => g.id === goalId);
    
    if (goal) {
      toast({
        title: `${goal.name}`,
        description: `${goal.description || "No description provided"}`,
      });
    }
  };

  const handleCreateNewGoal = () => {
    toast({
      title: "Create New Goal",
      description: "Let's set up a new goal to track your progress"
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
              <h1 className="text-2xl font-display font-bold">Goals</h1>
              <NewGoalDialog onAdd={addNewGoal} />
            </div>
            
            <Tabs defaultValue="active" className="mb-8">
              <TabsList>
                <TabsTrigger value="active">Active Goals</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
              </TabsList>
              <TabsContent value="active" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {goals.map((goal) => (
                    <GoalCard 
                      key={goal.id} 
                      goal={goal} 
                      onGoalClick={handleGoalClick}
                    />
                  ))}
                  
                  {/* Add new goal card */}
                  <Card 
                    className="hover:shadow-md transition-shadow cursor-pointer border-dashed"
                    onClick={handleCreateNewGoal}
                  >
                    <CardContent className="pt-6 flex flex-col items-center justify-center h-full text-center">
                      <div className="p-3 rounded-full bg-secondary text-secondary-foreground mb-3">
                        <Plus className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-medium">Create New Goal</h3>
                      <p className="text-sm text-muted-foreground mt-1">Track your progress</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="completed" className="mt-6">
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No completed goals yet.</p>
                </div>
              </TabsContent>
              <TabsContent value="archived" className="mt-6">
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No archived goals.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Goals;
