import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Search,
  Edit,
  ChevronUp,
  Menu,
  MoreHorizontal,
  Share2,
  Edit2,
  Archive,
  Trash2,
  X,
  Check,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/useThemeStore';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import api, { ChatResponse } from '@/lib/chatbot/api';
import { categorizeTimestamp, ICategorizeTimestamp } from '@/lib/chatbot/utils';
interface NavItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  exact?: boolean;
  collapsed?: boolean;
}

const NavItem = ({ icon: Icon, label, to, exact = false, collapsed = false }: NavItemProps) => {
  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink 
              to={to} 
              end={exact}
              className={({ isActive }) => 
                cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive 
                    ? "bg-accent text-accent-foreground" 
                    : "text-muted-foreground"
                )
              }
            >
              <Icon className="w-5 h-5" />
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <NavLink 
      to={to} 
      end={exact}
      className={({ isActive }) => 
        cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
          "hover:bg-accent hover:text-accent-foreground",
          isActive 
            ? "bg-accent text-accent-foreground" 
            : "text-muted-foreground"
        )
      }
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </NavLink>
  );
};
interface ConversationItemProps {
  title: string;
  to: string;
  active?: boolean;
  onShare?: () => void;
  onRename?: (newTitle: string) => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

const ConversationItem = ({ title, to, active = false, onShare, onRename, onArchive, onDelete }: ConversationItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  const handleRenameSubmit = () => {
    if (onRename && newTitle.trim()) {
      onRename(newTitle);
    }
    setIsRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
      setNewTitle(title);
    }
  };

  if (isRenaming) {
    return (
      <div 
        className="flex items-center gap-2 px-4 py-2 bg-accent/30 rounded-lg mx-2 my-1"
      >
        <Input 
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 text-sm"
          autoFocus
        />
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={handleRenameSubmit}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={() => {
            setIsRenaming(false);
            setNewTitle(title);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <NavLink 
        to={to}
        className={({ isActive }) => 
          cn(
            "flex items-center px-4 py-2 text-sm font-medium transition-all duration-200",
            "rounded-lg mx-2 my-1",
            "hover:bg-accent/50",
            isActive || active
              ? "bg-accent/30 text-foreground" 
              : "text-muted-foreground"
          )
        }
      >
        {/* <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis pr-4">{title}</span> */}
        <span className="whitespace-nowrap overflow-hidden block">{title}</span>
        <div className="absolute right-0 top-0 h-full w-10 bg-gradient-to-r from-transparent to-background pointer-events-none"></div>
      </NavLink>
      
      { (isHovered || isOpen) && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-accent"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 rounded-md">
              <DropdownMenuItem onClick={() => onShare?.()}>
                <Share2 className="mr-2 h-4 w-4" />
                <span>Share</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                <span>Rename</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onArchive?.()}>
                <Archive className="mr-2 h-4 w-4" />
                <span>Archive</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.()}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};

export function SideNavigation() {
  const { sidebarCollapsed, toggleSidebar } = useThemeStore();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<{ [key: ICategorizeTimestamp]: { id: string, title: string, to: string, Category: ICategorizeTimestamp }[] }>({});

  useEffect(() => {
    api.get<ChatResponse[]>('/chats').then((chats) => {
      const categorizedChats = chats.data.map(chat => {
        return {
          Category: categorizeTimestamp(chat.Timestamp),
          id: chat.ChatId.toString(),
          title: chat.title,
          to: `/chat/${chat.ChatId}`
        }
      });
      setConversations(
        categorizedChats.reduce((acc, chat) => {
          if (!acc[chat.Category]) acc[chat.Category] = [];
          acc[chat.Category].push(chat);
          return acc;
        }, {} as {[key: ICategorizeTimestamp]: { Category: ICategorizeTimestamp, id: string, title: string, to: string }[] })
      )
    })
  }, [])

  const handleShare = (id: string) => {
    console.log(`Sharing conversation ${id}`);
    // Implementation for sharing
  };

  const handleRename = (id: string, newTitle: string) => {
    console.log(`Renaming conversation ${id} to "${newTitle}"`);
    
    setConversations(prev => {
      const updatedYesterday = prev.yesterday.map(conv => 
        conv.id === id ? { ...conv, title: newTitle } : conv
      );
      
      const updatedPrevious = prev.previous.map(conv => 
        conv.id === id ? { ...conv, title: newTitle } : conv
      );
      
      return {
        yesterday: updatedYesterday,
        previous: updatedPrevious
      };
    });
  };

  const handleArchive = (id: string) => {
    console.log(`Archiving conversation ${id}`);
    // Implementation for archiving
  };

  const handleDelete = (id: string) => {
    console.log(`Deleting conversation ${id}`);
    
    setConversations(prev => {
      return {
        yesterday: prev.yesterday.filter(conv => conv.id !== id),
        previous: prev.previous.filter(conv => conv.id !== id)
      };
    });
  };
  
  return (
    <aside className={cn(
      "h-screen top-0 border-r bg-background flex flex-col transition-all duration-300 w-80 shadow-sm relative",
      sidebarCollapsed ? "w-0" : "w-72 min-w-72 max-w-72"
    )}>
      <div className='absolute right-0 h-full w-4 -mr-4 flex flex-row items-center opacity-0 hover:opacity-100'>
        {sidebarCollapsed?
          <ChevronRight className="h-8 w-4 py-2 cursor-pointer" onClick={toggleSidebar} />
          :
          <ChevronLeft className="h-8 w-4 py-2 cursor-pointer" onClick={toggleSidebar} />
        }
      </div>
      <div className="p-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hover:bg-accent hover:text-accent-foreground rounded-full"
          >
            <Menu />
          </Button>
        </div>
        {!sidebarCollapsed && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/chat/search')}
            className="hover:bg-accent hover:text-accent-foreground rounded-full"
          >
            <Search className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/chat')}
            className="hover:bg-accent hover:text-accent-foreground rounded-full"
          >
            <Edit className="w-5 h-5" />
          </Button>
        </div>
        )}
      </div>
      
      
      {!sidebarCollapsed && (<>
        <nav className="flex-1 overflow-y-auto flex flex-col">
          {
            Object.keys(conversations).map((key) => {
              const value = conversations[key];
              return (<div key={key}>
                <div className="pt-4 pb-2">
                  <p className="px-4 text-sm font-semibold text-foreground">
                    {key}
                  </p>
                </div>
                <div className="flex flex-col">
                  {value.map((item) => (
                    <ConversationItem 
                      key={item.id} 
                      title={item.title} 
                      to={item.to}
                      onShare={() => handleShare(item.id)}
                      onRename={(newTitle) => handleRename(item.id, newTitle)}
                      onArchive={() => handleArchive(item.id)}
                      onDelete={() => handleDelete(item.id)}
                      />
                    ))}
                </div>
              </div>)
              }
            )
          }
        </nav>
        <div className={cn("border-t p-3")}>
          <NavItem icon={Settings} label="Settings" to="/settings" collapsed={sidebarCollapsed} />
        </div>
      </>)}
    </aside>
  );
}