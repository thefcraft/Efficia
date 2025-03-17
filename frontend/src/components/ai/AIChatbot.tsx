
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, MicOff, Send, User, Bot, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define WebkitSpeechRecognition for TypeScript
interface Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function AIChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || 
                                  (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognitionAPI) {
        recognitionRef.current = new SpeechRecognitionAPI();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join('');
          
          setInput(transcript);
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          toast({
            title: "Voice Recognition Error",
            description: `Error: ${event.error}`,
            variant: "destructive"
          });
        };
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      toast({
        title: "Voice Input Stopped",
        description: "No longer listening for voice commands.",
      });
    } else {
      setIsListening(true);
      recognitionRef.current.start();
      toast({
        title: "Voice Input Active",
        description: "Listening for your voice...",
      });
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Simulated AI response
    setTimeout(() => {
      processUserMessage(userMessage.content);
      setIsLoading(false);
    }, 1000);
  };

  const processUserMessage = (userInput: string) => {
    const lowerInput = userInput.toLowerCase();
    let response = "I'm sorry, I don't understand that request. Can you try again?";
    
    // Email pattern detection
    if (lowerInput.includes('write mail') || lowerInput.includes('send email')) {
      const emailMatch = userInput.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
      const email = emailMatch ? emailMatch[0] : 'the recipient';
      response = `I'll help you draft an email to ${email}. What should the email be about?`;
    }
    
    // Learning plan detection
    else if (lowerInput.includes('learn') && (lowerInput.includes('day') || lowerInput.includes('week'))) {
      const subject = lowerInput.includes('python') 
        ? 'Python'
        : lowerInput.includes('javascript') 
        ? 'JavaScript'
        : lowerInput.includes('react') 
        ? 'React'
        : 'the subject';
        
      const duration = lowerInput.includes('30 day') 
        ? '30 days'
        : lowerInput.includes('week') 
        ? 'a week'
        : 'the specified timeframe';
        
      response = `I'll create a learning plan for ${subject} over ${duration}. The plan will include resources, practice exercises, and milestones to track your progress.`;
    }
    
    // Task management
    else if (lowerInput.includes('task') || lowerInput.includes('todo')) {
      response = "I can help you organize your tasks. Would you like me to create a new task, list your current tasks, or something else?";
    }
    
    // Time management
    else if (lowerInput.includes('schedule') || lowerInput.includes('calendar')) {
      response = "I can help with your schedule. Would you like to create a new event, check your calendar, or get time management advice?";
    }
    
    // General greeting
    else if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      response = "Hello! How can I assist you today? You can ask me to help with emails, learning plans, task management, and more.";
    }
    
    // Add assistant message
    const assistantMessage: ChatMessage = { role: 'assistant', content: response };
    setMessages((prev) => [...prev, assistantMessage]);
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: 'Hello! How can I assist you today?' }]);
    toast({
      title: "Chat Cleared",
      description: "All previous messages have been removed.",
    });
  };

  return (
    <Card className="w-full h-full flex flex-col overflow-y-auto">
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">AI Assistant</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearChat}
            className="gap-1"
          >
            <Trash className="h-4 w-4" />
            Clear Chat
          </Button>
        </div>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`flex gap-3 max-w-[80%] ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                  } p-3 rounded-lg`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {message.role === 'user' ? (
                      <User className="h-5 w-5" />
                    ) : (
                      <Bot className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    {message.content.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < message.content.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="mt-4 flex gap-2 mx-auto items-end">
          <Button
            size="icon"
            variant={isListening ? "default" : "outline"}
            onClick={toggleListening}
            className={isListening ? "bg-red-500 hover:bg-red-600" : ""}
          >
            {isListening ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="min-h-[60px] min-w-96 flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button 
            size="icon" 
            onClick={handleSubmit} 
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
