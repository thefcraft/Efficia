
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Note {
  id: number;
  title: string;
  content: string;
  date: string;
  tags?: string[];
}

const notes: Note[] = [
  { 
    id: 1, 
    title: "Project Ideas", 
    content: "Consider implementing a real-time analytics dashboard with filtering capabilities...", 
    date: "Today",
    tags: ["Work", "Ideas"] 
  },
  { 
    id: 2, 
    title: "Meeting Notes", 
    content: "Discussed quarterly goals and project timeline. Action items include...", 
    date: "Yesterday",
    tags: ["Work", "Meetings"] 
  },
  { 
    id: 3, 
    title: "Learning Resources", 
    content: "Useful resources for Python: - Automate the Boring Stuff - Python Crash Course...", 
    date: "3 days ago",
    tags: ["Learning", "Python"] 
  },
];

export function NotesPreview() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Recent Notes</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="space-y-2 p-3 rounded-md border hover-card cursor-pointer">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-sm">{note.title}</h3>
                <span className="text-xs text-muted-foreground">{note.date}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{note.content}</p>
              {note.tags && (
                <div className="flex gap-1.5 flex-wrap">
                  {note.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
