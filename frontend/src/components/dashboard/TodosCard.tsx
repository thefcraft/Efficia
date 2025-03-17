
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from "@/hooks/use-toast";

interface TodoItem {
  id: number;
  title: string;
  completed: boolean;
  dueDate?: string;
  subtasks?: TodoItem[];
}

const todos: TodoItem[] = [
  { 
    id: 1, 
    title: "Complete project proposal", 
    completed: false, 
    dueDate: "Tomorrow",
    subtasks: [
      { id: 11, title: "Research competitors", completed: true },
      { id: 12, title: "Create outline", completed: false },
    ]
  },
  { id: 2, title: "Review code changes", completed: true },
  { id: 3, title: "Update documentation", completed: false, dueDate: "Friday" },
  { 
    id: 4, 
    title: "Schedule team meeting", 
    completed: false,
    subtasks: [
      { id: 41, title: "Prepare agenda", completed: false },
      { id: 42, title: "Send calendar invite", completed: false },
    ]
  },
  { id: 5, title: "Fix database issue", completed: false, dueDate: "Today" },
];

export function TodosCard() {
  const [expandedTodos, setExpandedTodos] = useState<number[]>([]);
  const [todosList, setTodosList] = useState<TodoItem[]>(todos);

  const toggleExpand = (todoId: number) => {
    setExpandedTodos(prev => 
      prev.includes(todoId) 
        ? prev.filter(id => id !== todoId) 
        : [...prev, todoId]
    );
  };

  const toggleTodoStatus = (todoId: number, parentId?: number) => {
    setTodosList(prev => {
      const newList = [...prev];
      
      if (parentId) {
        // Handle subtask toggle
        const parentIndex = newList.findIndex(t => t.id === parentId);
        if (parentIndex !== -1 && newList[parentIndex].subtasks) {
          const subtaskIndex = newList[parentIndex].subtasks!.findIndex(st => st.id === todoId);
          if (subtaskIndex !== -1) {
            newList[parentIndex].subtasks![subtaskIndex].completed = 
              !newList[parentIndex].subtasks![subtaskIndex].completed;
            
            // Show toast notification
            const subtask = newList[parentIndex].subtasks![subtaskIndex];
            toast({
              title: subtask.completed ? "Task completed" : "Task uncompleted",
              description: subtask.title
            });
          }
        }
      } else {
        // Handle main task toggle
        const todoIndex = newList.findIndex(t => t.id === todoId);
        if (todoIndex !== -1) {
          newList[todoIndex].completed = !newList[todoIndex].completed;
          
          // Show toast notification
          const task = newList[todoIndex];
          toast({
            title: task.completed ? "Task completed" : "Task uncompleted",
            description: task.title
          });
          
          // Also toggle all subtasks if present
          if (newList[todoIndex].subtasks) {
            newList[todoIndex].subtasks = newList[todoIndex].subtasks!.map(st => ({
              ...st,
              completed: newList[todoIndex].completed
            }));
          }
        }
      }
      
      return newList;
    });
  };

  const addNewTodo = () => {
    const newId = Math.max(...todosList.map(t => t.id)) + 1;
    setTodosList(prev => [
      ...prev, 
      { id: newId, title: "New task", completed: false }
    ]);
    
    toast({
      title: "Task added",
      description: "New task has been added to your list."
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Todo List</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0" 
          onClick={addNewTodo}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {todosList.map((todo) => (
            <div key={todo.id}>
              <div 
                className={cn(
                  "flex items-center gap-3 p-2 rounded-md border cursor-pointer",
                  todo.completed && "bg-secondary/50"
                )}
              >
                <div className="flex-shrink-0" onClick={(e) => {
                  e.stopPropagation();
                  toggleTodoStatus(todo.id);
                }}>
                  {todo.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
                
                <div 
                  className="flex-1 min-w-0 flex items-center justify-between"
                  onClick={() => todo.subtasks && todo.subtasks.length > 0 && toggleExpand(todo.id)}
                >
                  <div>
                    <p className={cn(
                      "text-sm font-medium truncate",
                      todo.completed && "line-through text-muted-foreground"
                    )}>
                      {todo.title}
                    </p>
                    {todo.dueDate && !todo.completed && (
                      <p className="text-xs text-muted-foreground">Due: {todo.dueDate}</p>
                    )}
                  </div>
                  
                  {todo.subtasks && todo.subtasks.length > 0 && (
                    <div className="flex-shrink-0 ml-2">
                      {expandedTodos.includes(todo.id) ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Subtasks */}
              {todo.subtasks && expandedTodos.includes(todo.id) && (
                <div className="ml-7 mt-1 space-y-1 border-l pl-3 pt-1">
                  {todo.subtasks.map((subtask) => (
                    <div 
                      key={subtask.id} 
                      className={cn(
                        "flex items-center gap-2 p-1.5 rounded-md",
                        subtask.completed && "bg-secondary/30"
                      )}
                    >
                      <div
                        className="cursor-pointer"
                        onClick={() => toggleTodoStatus(subtask.id, todo.id)}
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
          ))}

          {/* Add new task button */}
          <div 
            className="flex items-center gap-3 p-2 rounded-md border border-dashed hover:bg-secondary/10 transition-colors cursor-pointer"
            onClick={addNewTodo}
          >
            <Plus className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Add new task</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
