
import React, { useEffect, useState } from 'react';
import { SideNavigation } from '@/components/layout/SideNavigation';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Circle, Calendar, Target, Clock, ListTodo, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import api, { GetTodo } from '@/lib/api';

interface Subtask {
  id: number;
  title: string;
  completed: boolean;
}

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  dueDate?: string;
  goalId?: number;
  goalName?: string;
  subtasks?: Subtask[];
  expanded?: boolean;
}

const initialTodos: Todo[] = [
  { 
    id: 1, 
    title: "Complete project proposal", 
    completed: false, 
    dueDate: "Tomorrow",
    goalId: 2,
    goalName: "Complete Project",
    subtasks: [
      { id: 101, title: "Research competitors", completed: true },
      { id: 102, title: "Create outline", completed: true },
      { id: 103, title: "Write introduction", completed: false }
    ],
    expanded: false
  },
  { 
    id: 2, 
    title: "Review code changes", 
    completed: true,
    goalId: 2,
    goalName: "Complete Project"
  },
  { 
    id: 3, 
    title: "Update documentation", 
    completed: false, 
    dueDate: "Friday",
    goalId: 2,
    goalName: "Complete Project"
  },
  { 
    id: 4, 
    title: "Complete Python tutorial - Part 3", 
    completed: false, 
    dueDate: "Today",
    goalId: 1,
    goalName: "Learn Python"
  },
  { 
    id: 5, 
    title: "Finish reading chapter 5", 
    completed: false, 
    dueDate: "Today",
    goalId: 3,
    goalName: "Read 10 books"
  },
  { 
    id: 6, 
    title: "30 minutes cardio exercise", 
    completed: true,
    goalId: 4,
    goalName: "Exercise Daily"
  },
  { 
    id: 7, 
    title: "Learn Spanish vocabulary", 
    completed: false, 
    dueDate: "Tomorrow",
    goalId: 5,
    goalName: "Learn Spanish"
  },
  { 
    id: 8, 
    title: "Schedule team meeting", 
    completed: true
  },
  { 
    id: 9, 
    title: "Buy groceries", 
    completed: false,
    subtasks: [
      { id: 201, title: "Vegetables", completed: false },
      { id: 202, title: "Fruits", completed: false },
      { id: 203, title: "Dairy", completed: false }
    ],
    expanded: false
  },
  { 
    id: 10, 
    title: "Fix database issue", 
    completed: false, 
    dueDate: "Today"
  },
];

const TodoItem = ({ todo, toggleCompletion, toggleExpand }: { 
  todo: Todo, 
  toggleCompletion: (id: number, isSubtask: boolean, parentId?: number) => void,
  toggleExpand: (id: number) => void 
}) => {
  return (
    <div className="mb-1">
      <div 
        className={cn(
          "flex flex-col gap-2 p-4 rounded-md border hover:shadow-sm transition-shadow",
          todo.completed && "bg-secondary/50"
        )}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div 
            className="mt-0.5 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              toggleCompletion(todo.id, false);
            }}
          >
            {todo.completed ? (
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            )}
          </div>
          
          {/* Todo content */}
          <div className="flex-1 min-w-0">
            <div 
              className="flex items-start justify-between cursor-pointer"
              onClick={() => todo.subtasks && todo.subtasks.length > 0 && toggleExpand(todo.id)}
            >
              <div>
                <p className={cn(
                  "font-medium",
                  todo.completed && "line-through text-muted-foreground"
                )}>
                  {todo.title}
                </p>
                
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                  {todo.dueDate && !todo.completed && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Due: {todo.dueDate}</span>
                    </div>
                  )}
                  
                  {todo.goalName && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Target className="h-3.5 w-3.5" />
                      <span>{todo.goalName}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {todo.subtasks && todo.subtasks.length > 0 && (
                <div>
                  {todo.expanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              )}
            </div>
            
            {/* Subtasks */}
            {todo.subtasks && todo.expanded && (
              <div className="mt-3 pl-2 border-l space-y-2">
                {todo.subtasks.map(subtask => (
                  <div key={subtask.id} className="flex items-center gap-2">
                    <div 
                      className="cursor-pointer"
                      onClick={() => toggleCompletion(subtask.id, true, todo.id)}
                    >
                      {subtask.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                    <p className={cn(
                      "text-sm",
                      subtask.completed && "line-through text-muted-foreground"
                    )}>
                      {subtask.title}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const NewTodoDialog = ({ onAdd }: { onAdd: (todo: Omit<Todo, 'id' | 'expanded'>) => void }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [goalName, setGoalName] = useState('');
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive"
      });
      return;
    }
    
    const newTodo = {
      title,
      completed: false,
      ...(dueDate ? { dueDate } : {}),
      ...(goalName ? { goalName } : {})
    };
    
    onAdd(newTodo);
    setTitle('');
    setDueDate('');
    setGoalName('');
    setOpen(false);
    
    toast({
      title: "Task Added",
      description: `"${title}" has been added to your tasks.`
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full gap-2">
          <ListTodo className="h-4 w-4" />
          Add New Task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Enter task title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date (optional)</Label>
            <Input 
              id="dueDate" 
              value={dueDate} 
              onChange={(e) => setDueDate(e.target.value)} 
              placeholder="e.g., Today, Tomorrow, Next week"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="goalName">Related Goal (optional)</Label>
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
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Todos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadTodos = async () => {
    if (loading || todos.length !== 0) return;  // Prevent multiple clicks if loading or no more data
    setLoading(true);
    try {
      const res = await api.get(`/todos/`);
      const data: GetTodo = res.data; // You can map it to your ActivityEntry format here
      setTodos(data.map((e) => ({
        id: e[0].todo_id,
        title: e[0].title,
        completed: e[0].completed,
        dueDate: formatDate(e[0].duedate),
        // goalId?: number;
        // goalName?: string;
        subtasks: e[1].map((v) => ({
          id: v.todo_id,
          title: v.title,
          completed: v.completed
        })),
        expanded: false,
      })))
    } catch (e) {
      console.error('Error fetching activities:', e);
      alert('Error fetching activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, [])

  const toggleTodoCompletion = (id: number, isSubtask: boolean, parentId?: number) => {
    setTodos(currentTodos => {
      return currentTodos.map(todo => {
        if (isSubtask && parentId === todo.id && todo.subtasks) {
          // Update subtask
          return {
            ...todo,
            subtasks: todo.subtasks.map(subtask => 
              subtask.id === id ? { ...subtask, completed: !subtask.completed } : subtask
            )
          };
        } else if (!isSubtask && todo.id === id) {
          // Update main task
          return { ...todo, completed: !todo.completed };
        }
        return todo;
      });
    });
  };

  const toggleTodoExpand = (id: number) => {
    setTodos(currentTodos => {
      return currentTodos.map(todo => {
        if (todo.id === id) {
          return { ...todo, expanded: !todo.expanded };
        }
        return todo;
      });
    });
  };

  const addNewTodo = (todoData: Omit<Todo, 'id' | 'expanded'>) => {
    const newId = Math.max(...todos.map(t => t.id)) + 1;
    setTodos([...todos, { id: newId, expanded: false, ...todoData }]);
  };

  // Filter todos based on the active tab
  const filteredTodos = todos.filter(todo => {
    switch (activeTab) {
      case "today":
        return todo.dueDate === "Today";
      case "upcoming":
        return todo.dueDate && todo.dueDate !== "Today" && !todo.completed;
      case "completed":
        return todo.completed;
      default:
        return true; // "all" tab
    }
  });

  return (
    <div className="flex min-h-screen">
      <SideNavigation />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 py-6 px-6 bg-background">
          <div className="max-w-4xl mx-auto fade-in">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-display font-bold">Todos</h1>
              <NewTodoDialog onAdd={addNewTodo} />
            </div>
            
            <Tabs 
              defaultValue="all" 
              className="mb-8"
              onValueChange={setActiveTab}
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              
              <div className="flex justify-between items-center mt-6 mb-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs gap-1">
                    <Target className="h-3.5 w-3.5" />
                    Filter by Goal
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Due Date
                  </Button>
                </div>
                <Badge variant="outline">
                  {todos.filter(t => !t.completed).length} tasks remaining
                </Badge>
              </div>
              
              <TabsContent value="all" className="mt-0">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      {filteredTodos.map(todo => (
                        <TodoItem 
                          key={todo.id} 
                          todo={todo} 
                          toggleCompletion={toggleTodoCompletion}
                          toggleExpand={toggleTodoExpand}
                        />
                      ))}
                      
                      {/* Add new task button */}
                      <div 
                        className="flex items-center gap-3 p-3 rounded-md border border-dashed hover:bg-secondary/10 transition-colors cursor-pointer"
                        onClick={() => {
                          toast({
                            title: "Let's add a new task",
                            description: "Click the 'Add New Task' button above to create a task."
                          });
                        }}
                      >
                        <Plus className="h-5 w-5 text-muted-foreground" />
                        <span className="text-muted-foreground">Add new task</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="today" className="mt-0">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      {filteredTodos.map(todo => (
                        <TodoItem 
                          key={todo.id} 
                          todo={todo} 
                          toggleCompletion={toggleTodoCompletion}
                          toggleExpand={toggleTodoExpand}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="upcoming" className="mt-0">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      {filteredTodos.map(todo => (
                        <TodoItem 
                          key={todo.id} 
                          todo={todo} 
                          toggleCompletion={toggleTodoCompletion}
                          toggleExpand={toggleTodoExpand}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="completed" className="mt-0">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      {filteredTodos.map(todo => (
                        <TodoItem 
                          key={todo.id} 
                          todo={todo} 
                          toggleCompletion={toggleTodoCompletion}
                          toggleExpand={toggleTodoExpand}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Todos;
