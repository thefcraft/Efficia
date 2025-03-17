
import React, { useState } from 'react';
import { SideNavigation } from '@/components/layout/SideNavigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Search, Tag, Clock, Target, Plus, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface Note {
  id: number;
  title: string;
  content: string;
  date: string;
  tags?: string[];
  goalId?: number;
  goalName?: string;
}

const initialNotes: Note[] = [
  { 
    id: 1, 
    title: "Project Ideas", 
    content: "Consider implementing a real-time analytics dashboard with filtering capabilities. Use React for frontend and Firebase for backend. Features should include user authentication, data visualization, and export functionality.", 
    date: "Today",
    tags: ["Work", "Ideas"],
    goalId: 2,
    goalName: "Complete Project"
  },
  { 
    id: 2, 
    title: "Meeting Notes", 
    content: "Discussed quarterly goals and project timeline. Action items include updating project documentation, scheduling followup meeting with design team, and preparing demo for next sprint review.", 
    date: "Yesterday",
    tags: ["Work", "Meetings"],
    goalId: 2,
    goalName: "Complete Project"
  },
  { 
    id: 3, 
    title: "Learning Resources", 
    content: "Useful resources for Python:\n- Automate the Boring Stuff with Python\n- Python Crash Course\n- Real Python website\n- DataCamp Python courses\n- PyImageSearch for computer vision", 
    date: "3 days ago",
    tags: ["Learning", "Python"],
    goalId: 1,
    goalName: "Learn Python"
  },
  { 
    id: 4, 
    title: "Book Notes: Atomic Habits", 
    content: "Key takeaways:\n1. Small habits compound over time\n2. Focus on systems rather than goals\n3. Make good habits obvious, attractive, easy, and satisfying\n4. Break bad habits by making them invisible, unattractive, difficult, and unsatisfying", 
    date: "1 week ago",
    tags: ["Books", "Self-improvement"],
    goalId: 3,
    goalName: "Read 10 books"
  },
  { 
    id: 5, 
    title: "Exercise Routine", 
    content: "Weekly schedule:\nMonday: Upper body\nTuesday: Lower body\nWednesday: Cardio\nThursday: Core\nFriday: Full body\nSaturday: Active recovery\nSunday: Rest", 
    date: "2 weeks ago",
    tags: ["Health", "Fitness"],
    goalId: 4,
    goalName: "Exercise Daily"
  },
  { 
    id: 6, 
    title: "Spanish Vocabulary", 
    content: "Common phrases:\n- Buenos días (Good morning)\n- Buenas tardes (Good afternoon)\n- Buenas noches (Good night)\n- ¿Cómo estás? (How are you?)\n- Estoy bien, gracias (I'm well, thank you)\n- ¿Dónde está...? (Where is...?)", 
    date: "3 weeks ago",
    tags: ["Learning", "Spanish"],
    goalId: 5,
    goalName: "Learn Spanish"
  },
];

const NoteCard = ({ note, onView }: { note: Note, onView: (note: Note) => void }) => {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onView(note)}>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{note.title}</h3>
            <span className="text-xs text-muted-foreground">{note.date}</span>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-line">{note.content}</p>
          
          <div className="flex flex-wrap gap-2">
            {note.tags && note.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            
            {note.goalName && (
              <div className="flex items-center gap-1.5 text-xs border rounded-full px-2 py-0.5">
                <Target className="h-3 w-3" />
                <span>{note.goalName}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const NoteDialog = ({ isOpen, onOpenChange, note }: { isOpen: boolean, onOpenChange: (open: boolean) => void, note: Note | null }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{note?.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="flex flex-wrap gap-2">
            {note?.tags && note.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
            
            {note?.goalName && (
              <div className="flex items-center gap-1.5 border rounded-full px-2 py-0.5">
                <Target className="h-3 w-3" />
                <span>{note.goalName}</span>
              </div>
            )}
          </div>
          
          <div className="whitespace-pre-line text-sm">
            {note?.content}
          </div>
          
          <div className="text-xs text-muted-foreground text-right">
            Last updated: {note?.date}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const NewNoteDialog = ({ onAdd }: { onAdd: (note: Omit<Note, 'id' | 'date'>) => void }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Note title is required",
        variant: "destructive"
      });
      return;
    }
    
    const newNote = {
      title,
      content,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
    };
    
    onAdd(newNote);
    setTitle('');
    setContent('');
    setTags('');
    setOpen(false);
    
    toast({
      title: "Note Added",
      description: `"${title}" has been created.`
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full gap-2">
          <FileText className="h-4 w-4" />
          New Note
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a New Note</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Note title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea 
              id="content" 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              placeholder="Write your note..."
              className="min-h-[200px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input 
              id="tags" 
              value={tags} 
              onChange={(e) => setTags(e.target.value)} 
              placeholder="e.g., Work, Ideas, Learning"
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
            <Button type="submit">Create Note</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleViewNote = (note: Note) => {
    setSelectedNote(note);
    setIsNoteDialogOpen(true);
  };

  const addNewNote = (noteData: Omit<Note, 'id' | 'date'>) => {
    const newId = Math.max(...notes.map(n => n.id)) + 1;
    setNotes([
      ...notes,
      { 
        id: newId, 
        ...noteData,
        date: "Just now",
      }
    ]);
  };

  const handleCreateNewNote = () => {
    toast({
      title: "Create New Note",
      description: "Let's capture your thoughts or ideas"
    });
  };

  // Filter notes based on search query
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen">
      <SideNavigation />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 py-6 px-6 bg-background">
          <div className="max-w-6xl mx-auto fade-in">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-display font-bold">Notes</h1>
              <NewNoteDialog onAdd={addNewNote} />
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search notes..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Button variant="outline" size="icon" onClick={() => toast({ title: "Filter by tags", description: "This feature is coming soon" })}>
                <Tag className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="icon" onClick={() => toast({ title: "Filter by date", description: "This feature is coming soon" })}>
                <Clock className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="icon" onClick={() => toast({ title: "Filter by goal", description: "This feature is coming soon" })}>
                <Target className="h-4 w-4" />
              </Button>
            </div>
            
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All Notes</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="by-goal">By Goal</TabsTrigger>
                <TabsTrigger value="by-tag">By Tag</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredNotes.map(note => (
                    <NoteCard key={note.id} note={note} onView={handleViewNote} />
                  ))}
                  
                  {/* Add new note card */}
                  <Card 
                    className="hover:shadow-md transition-shadow cursor-pointer border-dashed"
                    onClick={handleCreateNewNote}
                  >
                    <CardContent className="pt-6 flex flex-col items-center justify-center h-full text-center min-h-[200px]">
                      <div className="p-3 rounded-full bg-secondary text-secondary-foreground mb-3">
                        <Plus className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-medium">Create New Note</h3>
                      <p className="text-sm text-muted-foreground mt-1">Capture your thoughts</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="recent" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {notes
                    .filter(note => note.date === "Today" || note.date === "Yesterday")
                    .map(note => (
                      <NoteCard key={note.id} note={note} />
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="by-goal" className="mt-6">
                <div className="space-y-8">
                  {Array.from(new Set(notes.filter(n => n.goalId).map(n => n.goalId))).map(goalId => {
                    const goalNotes = notes.filter(n => n.goalId === goalId);
                    const goalName = goalNotes[0].goalName;
                    
                    return (
                      <div key={goalId} className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          <h2 className="font-medium">{goalName}</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {goalNotes.map(note => (
                            <NoteCard key={note.id} note={note} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="by-tag" className="mt-6">
                <div className="space-y-8">
                  {Array.from(new Set(notes.flatMap(n => n.tags || []))).map(tag => {
                    const tagNotes = notes.filter(n => n.tags?.includes(tag));
                    
                    return (
                      <div key={tag} className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Tag className="h-5 w-5 text-primary" />
                          <h2 className="font-medium">{tag}</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {tagNotes.map(note => (
                            <NoteCard key={note.id} note={note} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
            
            {/* Note view dialog */}
            <NoteDialog 
              isOpen={isNoteDialogOpen} 
              onOpenChange={setIsNoteDialogOpen} 
              note={selectedNote}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Notes;
