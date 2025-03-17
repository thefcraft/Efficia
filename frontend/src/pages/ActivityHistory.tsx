
import React from 'react';
import { SideNavigation } from '@/components/layout/SideNavigation';
import { Header } from '@/components/Header';
import { 
  History, 
  Calendar, 
  Clock, 
  BarChart3, 
  Filter, 
  Download, 
  Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActivityHistory as ActivityHistoryComponent } from '@/components/activity/ActivityHistory';

const ActivityHistory = () => {
  return (
    <div className="flex min-h-screen">
      <SideNavigation />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 py-6 px-6 bg-background">
          <div className="max-w-6xl mx-auto fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h1 className="text-2xl font-display font-bold mb-1">Activity History</h1>
                <p className="text-muted-foreground">Track how you spend your time across different applications and websites.</p>
              </div>
              <div className="flex items-center gap-3 mt-4 md:mt-0">
                <Select defaultValue="today">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
                <Button className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI Insights
                </Button>
              </div>
            </div>
            
            <div className="mb-6">
              <ActivityHistoryComponent />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ActivityHistory;
