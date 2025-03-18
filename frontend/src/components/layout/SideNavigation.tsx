
import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  LayoutDashboard, 
  Target, 
  Clock, 
  Ban, 
  CheckSquare, 
  FileText, 
  Bell, 
  Settings,
  Calendar,
  BarChart3,
  Activity,
  Brain,
  History,
  ChevronLeft,
  ChevronRight,
  Bot,
  Menu,
  AppWindow,
  Globe,
  Tags
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/useThemeStore';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

export function SideNavigation() {
  const { sidebarCollapsed, toggleSidebar } = useThemeStore();
  
  return (
    <aside className={cn(
      "h-screen sticky top-0 border-r bg-sidebar flex flex-col overflow-hidden transition-all duration-300 select-none",
      sidebarCollapsed ? "w-16" : "w-60"
    )}>
      <div className={cn("p-3 border-b flex items-center justify-between", sidebarCollapsed?"pl-3":"")}>
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2 cursor-pointer" onClick={toggleSidebar}>
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white font-display font-bold">E</span>
            </div>
            <span className="font-display font-semibold text-xl">Efficia</span>
          </div>
        )}
        {/* {sidebarCollapsed && (
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center ml-0 cursor-pointer" onClick={toggleSidebar}>
            <span className="text-white font-display font-bold">E</span>
          </div>
        )} */}


        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            'transition-all duration-300',
            sidebarCollapsed ? 'rotate-180' : 'rotate-0'
          )}
        >
          <Menu />
        </Button>

        {/* {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />} */}
        {/* <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="rounded-full hover:bg-accent hover:text-accent-foreground"
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button> */}
      </div>
    {/* <aside className="w-60 h-screen sticky top-0 border-r bg-sidebar flex flex-col overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white font-display font-bold">E</span>
          </div>
          <span className="font-display font-semibold text-xl">Efficia</span>
        </div>
      </div> */}
      
      <nav className={cn(
        "flex-1 py-6 overflow-y-auto",
        sidebarCollapsed ? "px-3" : "px-3 space-y-1"
      )}>
        <div className={cn("flex flex-col", sidebarCollapsed ? "space-y-4" : "space-y-1")}>
          <NavItem icon={Home} label="Home" to="/" exact collapsed={sidebarCollapsed} />
          <NavItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" collapsed={sidebarCollapsed} />
          <NavItem icon={Calendar} label="Timeline" to="/timeline" collapsed={sidebarCollapsed} />
          <NavItem icon={History} label="Activity History" to="/activity-history" collapsed={sidebarCollapsed} />
          <NavItem icon={BarChart3} label="Analytics" to="/analytics" collapsed={sidebarCollapsed} />
        </div>
        
        {!sidebarCollapsed && (
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Productivity
            </p>
          </div>
        )}
        {sidebarCollapsed && <div className="my-4 border-t border-border" />}
        
        <div className={cn("flex flex-col", sidebarCollapsed ? "space-y-4" : "space-y-1")}>
          <NavItem icon={Target} label="Goals" to="/goals" collapsed={sidebarCollapsed} />
          <NavItem icon={Clock} label="Sessions" to="/sessions" collapsed={sidebarCollapsed} />
          <NavItem icon={Ban} label="Blocks" to="/blocks" collapsed={sidebarCollapsed} />
          <NavItem icon={CheckSquare} label="Todos" to="/todos" collapsed={sidebarCollapsed} />
          <NavItem icon={AppWindow} label="Apps" to="/apps" collapsed={sidebarCollapsed} />
          <NavItem icon={Tags} label="Categories" to="/categories" collapsed={sidebarCollapsed} />
          <NavItem icon={Globe} label="Urls" to="/urls" collapsed={sidebarCollapsed} />
        </div>
        
        {!sidebarCollapsed && (
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tools
            </p>
          </div>
        )}
        {sidebarCollapsed && <div className="my-4 border-t border-border" />}
        
        <div className={cn("flex flex-col", sidebarCollapsed ? "space-y-4" : "space-y-1")}>
          <NavItem icon={FileText} label="Notes" to="/notes" collapsed={sidebarCollapsed} />
          <NavItem icon={Bell} label="Alarms & Timers" to="/timers" collapsed={sidebarCollapsed} />
          <NavItem icon={Brain} label="AI Assistant" to="/chat" collapsed={sidebarCollapsed} />
        </div>
      </nav>
      
      <div className={cn("border-t", sidebarCollapsed ? "p-3" : "p-3")}>
        <NavItem icon={Settings} label="Settings" to="/settings" collapsed={sidebarCollapsed} />
      </div>
    </aside>
  );
}
