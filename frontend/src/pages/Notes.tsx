// src/pages/Notes.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { SideNavigation } from '@/components/layout/SideNavigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Search, Tag, Clock, Target, Plus, Eye, Loader2, Trash2, Edit, X } from 'lucide-react'; // Added icons
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'; // Added DialogClose
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api'; // Assuming api setup
import { Skeleton } from '@/components/ui/skeleton'; // For loading
import { formatDate } from '@/lib/utils'; // Assuming utils file

// Interface matching backend NoteResponse (more or less)
interface Note {
  note_id: number;
  title: string;
  content?: string;
  Timestamp: string; // ISO String from backend
  GoalId?: number;
  goalName?: string;
  tags: string[];
  // Frontend specific state (optional)
  displayDate?: string; // Formatted date for display
}

// Note Card Component
const NoteCard = ({ note, onView, onDelete }: { note: Note, onView: (note: Note) => void, onDelete: (noteId: number) => void }) => {
  return (
    <Card className="hover:shadow-md transition-shadow flex flex-col h-full">
      <CardContent className="pt-5 pb-4 flex-grow space-y-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-medium cursor-pointer hover:text-primary" onClick={() => onView(note)}>{note.title}</h3>
          {/* Maybe add an edit button here later */}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap break-words min-h-[60px]">
          {note.content || <span className="italic">No content</span>}
        </p>
      </CardContent>
       <div className="px-5 pb-4 mt-auto space-y-2">
            <div className="flex flex-wrap gap-1.5">
                {note.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs font-normal">{tag}</Badge>
                ))}
                {note.goalName && (
                    <Badge variant="outline" className="text-xs font-normal flex items-center gap-1"> <Target className="h-3 w-3" /> {note.goalName} </Badge>
                )}
            </div>
            <div className="flex justify-between items-center pt-1">
                 <span className="text-xs text-muted-foreground">{note.displayDate}</span>
                 <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive" onClick={(e) => {e.stopPropagation(); onDelete(note.note_id);}}>
                     <Trash2 className="h-4 w-4" />
                 </Button>
            </div>
       </div>
    </Card>
  );
};

// Note View Dialog Component
const NoteDialog = ({ isOpen, onOpenChange, note }: { isOpen: boolean, onOpenChange: (open: boolean) => void, note: Note | null }) => {
  if (!note) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{note.title}</DialogTitle>
          <DialogDescription>
            {note.displayDate} {note.goalName && `• Linked to: ${note.goalName}`}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-2 space-y-4 py-4">
            {note.tags && note.tags.length > 0 && (
                 <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag) => ( <Badge key={tag} variant="secondary">{tag}</Badge> ))}
                 </div>
            )}
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {note.content || <span className="italic text-muted-foreground">No content</span>}
          </div>
        </div>
         <DialogFooter>
            {/* <Button variant="outline"> <Edit className="h-4 w-4 mr-2"/> Edit </Button> */}
            <DialogClose asChild> <Button variant="default">Close</Button> </DialogClose>
         </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// New Note Dialog Component
const NewNoteDialog = ({ onAdd }: { onAdd: (note: Note) => void }) => { // Pass full Note object back
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // Add state for GoalId if needed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !title.trim()) {
       if (!title.trim()) toast({ title: "Error", description: "Note title is required", variant: "destructive" });
      return;
    }
    setIsSaving(true);

    const tagList = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    const noteData = {
      title: title.trim(),
      content: content.trim() || null,
      tags: tagList,
      // GoalId: selectedGoalId // Add goal ID if implemented
    };

    try {
        const res = await api.post<Note>('/notes/', noteData); // Expecting full Note response
        const newNote = { // Map response just in case format differs slightly
             ...res.data,
             displayDate: formatDate(res.data.Timestamp) // Add formatted date
        };
        onAdd(newNote); // Pass the new note back to the parent
        resetForm();
        setOpen(false);
        toast({ title: "Note Created", description: `"${newNote.title}" saved.` });
    } catch (error: any) {
         console.error("Failed to create note:", error);
         const errorMsg = error.response?.data?.detail || "Could not create the note.";
         toast({ title: "Error", description: errorMsg, variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };

  const resetForm = () => {
      setTitle('');
      setContent('');
      setTags('');
      // Reset goalId if added
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); setOpen(o);}}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9 gap-1"> <Plus className="h-4 w-4" /> New Note </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader> <DialogTitle>Create a New Note</DialogTitle> </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label htmlFor="note-title">Title</Label>
            <Input id="note-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="note-content">Content</Label>
            <Textarea id="note-content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your note..." className="min-h-[150px]" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="note-tags">Tags (comma separated)</Label>
            <Input id="note-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g., Work, Ideas, ProjectX" />
          </div>
           {/* Add Goal Selection Dropdown Here if needed */}
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}> Cancel </Button>
            <Button type="submit" disabled={isSaving}> {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Plus className="h-4 w-4 mr-2" />} Create Note </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};


// Main Notes Component
const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all"); // For client-side filtering
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null); // Loading state for delete

  const loadNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Note[]>('/notes/');
      setNotes(res.data.map(note => ({
          ...note,
          displayDate: formatDate(note.Timestamp) // Add formatted date
      })));
    } catch (e) {
      console.error('Error fetching notes:', e);
      setError("Failed to load notes.");
      toast({ title: "Error", description: "Could not fetch notes.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleViewNote = (note: Note) => {
    setSelectedNote(note);
    setIsNoteDialogOpen(true);
  };

  // Add new note to state after creation
  const addNewNote = (newNote: Note) => {
    setNotes(prev => [newNote, ...prev]); // Add to the beginning
  };

   const handleDeleteNote = async (noteId: number) => {
      const noteToDelete = notes.find(n => n.note_id === noteId);
      if (!noteToDelete) return;

      const originalNotes = [...notes];
      setDeletingNoteId(noteId); // Set loading state for this specific note

      // Optimistic Delete
      setNotes(currentNotes => currentNotes.filter(note => note.note_id !== noteId));

      try {
          await api.delete(`/notes/${noteId}`);
          toast({ title: "Note Deleted", description: `"${noteToDelete.title}" removed.` });
      } catch (error: any) {
          console.error("Failed to delete note:", error);
          const errorMsg = error.response?.data?.detail || "Could not delete the note.";
          toast({ title: "Error", description: errorMsg, variant: "destructive"});
          setNotes(originalNotes); // Rollback
      } finally {
          setDeletingNoteId(null); // Reset loading state
      }
   };


  // Filter notes (Client-side for now)
  const filteredNotes = useMemo(() => {
      let filtered = notes;

      // Search Filter
      if (searchQuery) {
         const lowerQuery = searchQuery.toLowerCase();
          filtered = filtered.filter(note =>
              note.title.toLowerCase().includes(lowerQuery) ||
              (note.content && note.content.toLowerCase().includes(lowerQuery)) ||
              (note.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)))
          );
      }

       // Tab Filter (Client-side examples)
       if (activeTab === "recent") {
         // Simple check based on formatted string - might need better date logic
         filtered = filtered.filter(note => note.displayDate === "Today" || note.displayDate === "Yesterday");
       } else if (activeTab.startsWith("goal-")) {
         const goalId = parseInt(activeTab.split('-')[1], 10);
         filtered = filtered.filter(note => note.GoalId === goalId);
       } else if (activeTab.startsWith("tag-")) {
          const tag = activeTab.split('-')[1];
          filtered = filtered.filter(note => note.tags?.includes(tag));
       }
       // Add other filters (date range, etc.) here if needed

      return filtered;
  }, [notes, searchQuery, activeTab]);

    // Extract unique goals and tags for filtering tabs (can be optimized)
    const goalsWithNotes = useMemo(() => {
        const goalMap = new Map<number, string>();
        notes.forEach(note => {
            if (note.GoalId && note.goalName && !goalMap.has(note.GoalId)) {
                goalMap.set(note.GoalId, note.goalName);
            }
        });
        return Array.from(goalMap.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
    }, [notes]);

    const uniqueTags = useMemo(() => {
        const tagSet = new Set<string>();
        notes.forEach(note => note.tags?.forEach(tag => tagSet.add(tag)));
        return Array.from(tagSet).sort();
    }, [notes]);


   const renderSkeletons = (count = 6) => (
       Array.from({ length: count }).map((_, index) => (
          <Card key={`skeleton-${index}`}>
              <CardContent className="pt-5 pb-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <div className="flex gap-2 pt-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
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
          <div className="max-w-6xl mx-auto fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
               <div>
                   <h1 className="text-2xl font-display font-bold">Notes</h1>
                   <p className="text-sm text-muted-foreground">Capture ideas, meeting minutes, and project details.</p>
               </div>
              <NewNoteDialog onAdd={addNewNote} />
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search notes..." className="pl-9 h-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              {/* Add optional Filter buttons here (Tag, Date, Goal) */}
               {/* <Button variant="outline" size="sm" className="h-9 gap-1 text-xs"><Tag className="h-3.5 w-3.5" /> Tag</Button> */}
               {/* <Button variant="outline" size="sm" className="h-9 gap-1 text-xs"><Calendar className="h-3.5 w-3.5" /> Date</Button> */}
            </div>

            {error && <div className="text-red-500 text-center mb-4">{error}</div>}

            {/* Tabs for Filtering */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="flex-wrap h-auto justify-start">
                    <TabsTrigger value="all">All Notes</TabsTrigger>
                    <TabsTrigger value="recent">Recent</TabsTrigger>
                    {goalsWithNotes.map(goal => (
                        <TabsTrigger key={`goal-${goal.id}`} value={`goal-${goal.id}`}>{goal.name}</TabsTrigger>
                    ))}
                    {uniqueTags.map(tag => (
                         <TabsTrigger key={`tag-${tag}`} value={`tag-${tag}`}>{tag}</TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {/* Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {loading ? renderSkeletons(6) :
                  filteredNotes.length === 0 ? (
                      <div className="col-span-full text-center py-16 text-muted-foreground">
                          {activeTab === 'all' && !searchQuery ? "No notes yet. Create one!" : "No notes match your current filter."}
                      </div>
                  ) : (
                      filteredNotes.map(note => (
                         <NoteCard
                              key={note.note_id}
                              note={note}
                              onView={handleViewNote}
                              onDelete={handleDeleteNote}
                         />
                      ))
                  )}

                  {/* Add New Note Inline Card (Optional) */}
                 {!loading && (
                      <Dialog>
                          <DialogTrigger asChild>
                              <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed min-h-[180px]">
                                  <CardContent className="pt-6 flex flex-col items-center justify-center h-full text-center">
                                  <div className="p-3 rounded-full bg-secondary text-secondary-foreground mb-3"> <Plus className="h-6 w-6" /> </div>
                                  <h3 className="text-base font-medium">Create New Note</h3>
                                  <p className="text-xs text-muted-foreground mt-1">Click to add a note</p>
                                  </CardContent>
                              </Card>
                          </DialogTrigger>
                          {/* Re-use NewNoteDialog content */}
                          <DialogContent>
                             {/* ... Content from NewNoteDialog ... */}
                          </DialogContent>
                      </Dialog>
                  )}

            </div>
            {/* Note View Dialog */}
            <NoteDialog isOpen={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen} note={selectedNote} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Notes;