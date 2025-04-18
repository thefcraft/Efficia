
import React, { useEffect, useState, useMemo } from 'react';
import { SideNavigation } from '@/components/layout/SideNavigation';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Circle, Calendar, Target, ListTodo, Plus, ChevronDown, ChevronRight, Loader2, Trash2 } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import api, { DeleteResponse, GetTodo, TodoBackend, TodoToggleResponse } from '@/lib/api'; // Import types
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

// Frontend Todo interface
interface Subtask {
  id: number;
  title: string;
  completed: boolean;
}

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  dueDate?: string; // Formatted string
  dueDateTime?: string | null; // Original ISO string from backend for editing
  goalId?: number; // Needs backend support
  goalName?: string; // Needs backend support
  subtasks?: Subtask[];
  expanded?: boolean;
}

const TodoItem = ({ todo, toggleCompletion, toggleExpand, deleteTodo, isLoading }: {
  todo: Todo,
  toggleCompletion: (id: number, isSubtask: boolean, parentId?: number) => void,
  toggleExpand: (id: number) => void,
  deleteTodo: (id: number) => void,
  isLoading: boolean // Pass loading state
}) => {
  // Check if the due date is past
  const isPastDue = !todo.completed && todo.dueDateTime && new Date(todo.dueDateTime) < new Date();

  return (
    <div className="mb-1 last:mb-0">
      <Card className={cn(
            "hover:shadow-sm transition-shadow",
            todo.completed ? "bg-secondary/40 border-secondary" : "bg-card",
            isPastDue && "border-destructive/50" // Highlight past due
        )}>
        <CardContent className="p-3 pr-2"> {/* Adjust padding */}
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <div className="pt-0.5 cursor-pointer" onClick={(e) => {!isLoading && toggleCompletion(todo.id, false); e.stopPropagation(); }}>
              {isLoading ? <Loader2 className="h-5 w-5 text-muted-foreground animate-spin flex-shrink-0"/> : (todo.completed ? <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" /> : <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors flex-shrink-0" />)}
            </div>

            {/* Todo content */}
            <div className="flex-1 min-w-0">
              <div
                className="flex items-start justify-between cursor-pointer"
                onClick={() => todo.subtasks && todo.subtasks.length > 0 && toggleExpand(todo.id)}
              >
                <div className="flex-1">
                  <p className={cn(
                    "font-medium text-sm leading-snug",
                    todo.completed && "line-through text-muted-foreground"
                  )}>
                    {todo.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    {todo.dueDate && !todo.completed && (
                      <div className={cn("flex items-center gap-1 text-xs", isPastDue ? "text-destructive font-medium" : "text-muted-foreground")}>
                        <Calendar className="h-3 w-3" />
                        <span>Due: {todo.dueDate}</span>
                      </div>
                    )}
                    {todo.goalName && ( <div className="flex items-center gap-1 text-xs text-muted-foreground"> <Target className="h-3 w-3" /> <span>{todo.goalName}</span> </div> )}
                  </div>
                </div>
                {todo.subtasks && todo.subtasks.length > 0 && (
                   <div className="p-1"> {todo.expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />} </div>
                )}
              </div>

              {/* Subtasks */}
              {todo.subtasks && todo.expanded && (
                <div className="mt-3 pl-3 border-l-2 border-border space-y-2">
                  {todo.subtasks.map(subtask => (
                    <div key={subtask.id} className="flex items-center gap-2">
                      <div className="cursor-pointer" onClick={() => toggleCompletion(subtask.id, true, todo.id)}>
                        {subtask.completed ? <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" /> : <Circle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors flex-shrink-0" />}
                      </div>
                      <p className={cn("text-xs", subtask.completed && "line-through text-muted-foreground")}> {subtask.title} </p>
                    </div>
                  ))}
                  {/* Add subtask button? */}
                </div>
              )}
            </div>
             {/* Edit/Delete buttons? */}
             {!todo.completed && ( // Maybe only show delete for incomplete? Or always show?
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={(e) => {e.stopPropagation(); deleteTodo(todo.id)}} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4"/>}
                </Button>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// New Todo Dialog Component
const NewTodoDialog = ({ onAdd }: { onAdd: (todo: Todo) => void }) => { // Pass full Todo
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(''); // Use YYYY-MM-DD format for input type="date"
  const [goalName, setGoalName] = useState(''); // Store goal name/id if needed
  const [parentId, setParentId] = useState<number | null>(null); // For subtasks
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !title.trim()) {
        if (!title.trim()) toast({ title: "Error", description: "Task title is required", variant: "destructive" });
        return;
    }
    setIsSaving(true);

    const todoData = {
      title: title.trim(),
      duedate: dueDate || null, // Send null if empty
      parent_id: parentId, // Send parent ID if creating subtask
      // goalId: findGoalIdByName(goalName) // Need logic to map goalName to goalId
    };

    try {
      const res = await api.post<TodoBackend>('/todos/', todoData);
      const addedTodo = res.data;

       // Map backend response to frontend Todo
      const newTodo: Todo = {
          id: addedTodo.todo_id,
          title: addedTodo.title,
          completed: addedTodo.completed,
          dueDate: addedTodo.duedate ? formatDate(addedTodo.duedate) : undefined,
          dueDateTime: addedTodo.duedate, // Store original for editing
          // goalId: addedTodo.GoalId, // Map if available
          // goalName: goalName, // Store if needed
          subtasks: [], // Initially no subtasks
          expanded: false,
      };

      onAdd(newTodo); // Pass the mapped object
      resetForm();
      setOpen(false);
      toast({ title: "Task Added", description: `"${newTodo.title}" added.` });

    } catch (error: any) {
        console.error("Failed to add todo:", error);
        const errorMsg = error.response?.data?.detail || "Could not add the task.";
        toast({ title: "Error", description: errorMsg, variant: "destructive"});
    } finally {
        setIsSaving(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDueDate('');
    setGoalName('');
    setParentId(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9 gap-1"> <Plus className="h-4 w-4" /> Add Task </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader> <DialogTitle>Create a New Task</DialogTitle> </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label htmlFor="todo-title">Task Title</Label>
            <Input id="todo-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter task title" required />
          </div>
          <div className="space-y-1.5">
             <Label htmlFor="todo-dueDate">Due Date (optional)</Label>
             {/* Use input type date for better UX */}
             <Input id="todo-dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
           {/* Add Goal Select if needed */}
          {/* <div className="space-y-1.5"> <Label htmlFor="todo-goalName">Related Goal (optional)</Label> <Input id="todo-goalName" value={goalName} onChange={(e) => setGoalName(e.target.value)} placeholder="Associated goal name" /> </div> */}
           {/* Add Parent Select for Subtasks if needed */}
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}> Cancel </Button>
            <Button type="submit" disabled={isSaving}> {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Plus className="h-4 w-4 mr-2" />} Create Task </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};


const Todos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true); // Start loading initially
  const [error, setError] = useState<string | null>(null);
  const [updatingTodos, setUpdatingTodos] = useState<Set<number>>(new Set()); // Track loading state per todo
  const { toast } = useToast();

  const loadTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<GetTodo>('/todos/');
      const data = res.data;
      setTodos(data.map(e => ({
        id: e[0].todo_id,
        title: e[0].title,
        completed: e[0].completed,
        dueDate: e[0].duedate ? formatDate(e[0].duedate) : undefined, // Format date for display
        dueDateTime: e[0].duedate, // Store original for potential editing
        // goalId: e[0].GoalId, // Add if backend provides
        // goalName: findGoalNameById(e[0].GoalId), // Add if needed
        subtasks: e[1].map(v => ({
          id: v.todo_id,
          title: v.title,
          completed: v.completed
        })),
        expanded: false,
      })));
    } catch (e) {
      console.error('Error fetching todos:', e);
      setError("Failed to load tasks.");
      toast({ title: "Error", description: "Could not fetch tasks.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);



  const toggleTodoCompletion = async (id: number, isSubtask: boolean, parentId?: number) => {
    const originalTodos = JSON.parse(JSON.stringify(todos)); // Deep copy for rollback
    setUpdatingTodos(prev => new Set(prev).add(id)); // Add to loading set

    // Optimistic UI Update
    setTodos(currentTodos =>
      currentTodos.map(todo => {
        if (isSubtask && parentId === todo.id && todo.subtasks) {
            const updatedSubtasks = todo.subtasks.map(sub => sub.id === id ? { ...sub, completed: !sub.completed } : sub);
            // Check if all subtasks are now complete to update parent
            const allSubtasksComplete = updatedSubtasks.every(s => s.completed);
             return { ...todo, subtasks: updatedSubtasks, completed: allSubtasksComplete }; // Update parent if needed
        } else if (!isSubtask && todo.id === id) {
            const newCompletedStatus = !todo.completed;
             // If marking parent incomplete, mark all subtasks incomplete too
            const updatedSubtasks = newCompletedStatus ? todo.subtasks : todo.subtasks?.map(s => ({...s, completed: false}));
            return { ...todo, completed: newCompletedStatus, subtasks: updatedSubtasks };
        }
        return todo;
      })
    );
    try {
      await api.put<TodoToggleResponse>(`/todos/${id}/toggle`);
      // Success - state already updated. Maybe show a small success toast?
      // toast({ title: "Status Updated", duration: 2000 });

      // If a subtask was toggled, we might need to refresh the parent's state from the backend
      // or rely on the optimistic update's parent calculation. Refetching is safer.
      if (isSubtask && parentId) {
          // Optional: Refetch parent todo or all todos for complete accuracy
          // loadTodos();
      }

    } catch (error) {
      console.error("Failed to update todo status:", error);
      toast({ title: "Error", description: "Failed to update task status.", variant: "destructive" });
      setTodos(originalTodos); // Rollback optimistic update
    } finally {
         setUpdatingTodos(prev => { const next = new Set(prev); next.delete(id); return next; }); // Remove from loading set
    }
  };

  const deleteTodo = async (id: number) => {
    const todoToDelete = todos.find(t => t.id === id);
    if (!todoToDelete) return;

    const originalTodos = [...todos];
    setUpdatingTodos(prev => new Set(prev).add(id)); // Add to loading set

    // Optimistic Remove
    setTodos(currentTodos => currentTodos.filter(todo => todo.id !== id));

    try {
        await api.delete<DeleteResponse>(`/todos/${id}`);
        toast({ title: "Task Deleted", description: `"${todoToDelete.title}" removed.` });
    } catch (error: any) {
        console.error("Failed to delete todo:", error);
        const errorMsg = error.response?.data?.detail || "Could not delete the task.";
        toast({ title: "Error", description: errorMsg, variant: "destructive"});
        setTodos(originalTodos); // Rollback
    } finally {
         setUpdatingTodos(prev => { const next = new Set(prev); next.delete(id); return next; }); // Remove from loading set
    }
  };


  const toggleTodoExpand = (id: number) => {
    setTodos(currentTodos =>
      currentTodos.map(todo =>
        todo.id === id ? { ...todo, expanded: !todo.expanded } : todo
      )
    );
  };

  // Add new todo to state after successful API call
  const addNewTodo = (newTodo: Todo) => {
    setTodos(prev => [newTodo, ...prev]); // Add to the beginning
  };

  // Filter todos based on the active tab
  const filteredTodos = useMemo(() => {
      return todos.filter(todo => {
          // Always show main tasks, filter subtasks based on completion for the 'completed' tab if needed
          if (activeTab === "completed") return todo.completed;
          if (activeTab === "today") return !todo.completed && todo.dueDate === "Today";
          // Add logic for "upcoming" if needed based on dueDateTime
           if (activeTab === "upcoming") {
             if (todo.completed || !todo.dueDateTime) return false;
             const dueDate = new Date(todo.dueDateTime);
             const today = new Date();
             today.setHours(0,0,0,0); // Start of today
             return dueDate > today;
           }
          return !todo.completed; // Default 'all' shows incomplete
      }).sort((a,b) => {
          // Basic sorting: due today first, then by ID
          const dueTodayA = a.dueDate === "Today" ? 0 : 1;
          const dueTodayB = b.dueDate === "Today" ? 0 : 1;
          if (dueTodayA !== dueTodayB) return dueTodayA - dueTodayB;
          return a.id - b.id; // Or sort by creation date if available
      });
  }, [todos, activeTab]);

   const renderSkeletons = (count = 5) => (
     Array.from({ length: count }).map((_, index) => (
        <Card key={`skeleton-${index}`} className="mb-1">
            <CardContent className="p-3">
                <div className="flex items-start gap-3">
                    <Skeleton className="h-5 w-5 rounded-full mt-0.5" />
                    <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                </div>
            </CardContent>
        </Card>
     ))
  );

  return (
    <div className="flex min-h-screen">
      <SideNavigation />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 py-6 px-6 bg-background">
          <div className="max-w-4xl mx-auto fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                 <h1 className="text-2xl font-display font-bold">Todos</h1>
                 <p className="text-sm text-muted-foreground">Manage your tasks and stay organized.</p>
              </div>
              <NewTodoDialog onAdd={addNewTodo} />
            </div>

            {/* Tabs and Filters */}
            <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 h-auto">
                <TabsTrigger value="all" className="py-2 text-xs sm:text-sm">All Active</TabsTrigger>
                <TabsTrigger value="today" className="py-2 text-xs sm:text-sm">Today</TabsTrigger>
                <TabsTrigger value="upcoming" className="py-2 text-xs sm:text-sm">Upcoming</TabsTrigger>
                <TabsTrigger value="completed" className="py-2 text-xs sm:text-sm">Completed</TabsTrigger>
              </TabsList>
               {/* Filter buttons can be added here if needed */}
            </Tabs>

            {error && <div className="text-red-500 text-center mb-4">{error}</div>}

            {/* Todo List */}
            <Card>
              <CardContent className="p-3 md:p-4">
                 <div className="max-h-[calc(100vh-300px)] overflow-y-auto pr-1 space-y-1"> {/* Added scroll */}
                      {loading ? renderSkeletons() :
                        filteredTodos.length === 0 ? (
                          <div className="text-center py-10 text-muted-foreground">
                             {activeTab === 'all' && "No active tasks. Add one!"}
                             {activeTab === 'today' && "No tasks due today."}
                             {activeTab === 'upcoming' && "No upcoming tasks."}
                             {activeTab === 'completed' && "No completed tasks yet."}
                         </div>
                        ) : (
                        filteredTodos.map(todo => (
                             <TodoItem
                                 key={todo.id}
                                 todo={todo}
                                 toggleCompletion={toggleTodoCompletion}
                                 toggleExpand={toggleTodoExpand}
                                 deleteTodo={deleteTodo}
                                 isLoading={updatingTodos.has(todo.id)} // Pass loading state
                             />
                        ))
                       )}
                      {/* Add new task inline button */}
                     {activeTab !== 'completed' && !loading && (
                        <Dialog>
                           <DialogTrigger asChild>
                              <div className="flex items-center gap-3 p-3 rounded-md border border-dashed hover:bg-secondary/10 transition-colors cursor-pointer text-muted-foreground">
                                 <Plus className="h-5 w-5" /> <span>Add new task</span>
                              </div>
                           </DialogTrigger>
                           {/* Re-use NewTodoDialog content or create inline form */}
                           <DialogContent>
                              {/* Content of NewTodoDialog */}
                              <DialogHeader><DialogTitle>Create a New Task</DialogTitle></DialogHeader>
                              {/* ... Form from NewTodoDialog component ... */}
                           </DialogContent>
                        </Dialog>
                     )}
                 </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Todos;