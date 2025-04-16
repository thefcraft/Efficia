
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  Search, 
  MonitorSmartphone, 
  Globe, 
  FileText, 
  User, 
  Timer, 
  MousePointer, 
  History, 
  Filter,
  Sparkles
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { getCurrentDate, formatDate, formatDateWithOffset } from '@/lib/utils';
import api, {GetActivity} from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';
import { useBackend } from '@/hooks/use-backend';

// Define activity entry type
interface ActivityEntry {
  id: string;
  appName: string;
  exeName: string;
  exeIcon?: string;
  windowTitle: string;
  url?: string;
  isActive: boolean;
  duration: string; // formatted duration
  startTime: string; // formatted time
  endTime: string; // formatted time
  idleDuration: string; // formatted idle time
  category?: string;
}

export function ActivityHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredActivities, setFilteredActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);  // Track the current page for pagination
  const [hasMore, setHasMore] = useState(true);  // Track if more data is available
  
  const { timeDelta } = useBackend(); // Get time delta from backend context
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    // const term = e.target.value;
    // setSearchTerm(term);
    
    // if (term.trim() === '') {
    //   setFilteredActivities(sampleActivities);
    //   return;
    // }
    
    // const filtered = sampleActivities.filter(activity => 
    //   activity.appName.toLowerCase().includes(term.toLowerCase()) ||
    //   activity.windowTitle.toLowerCase().includes(term.toLowerCase()) ||
    //   activity.url?.toLowerCase().includes(term.toLowerCase()) ||
    //   activity.category?.toLowerCase().includes(term.toLowerCase())
    // );
    
    // setFilteredActivities(filtered);
  };

  const loadMoreActivities = async () => {
    if (loading || !hasMore) return;  // Prevent multiple clicks if loading or no more data

    setLoading(true);
    try {
      const res = await api.get(`/activity?limit=50&page=${page}`);
      const data = res.data; // You can map it to your ActivityEntry format here

      if (data.length === 0) {
        setHasMore(false);  // No more data
      } else {
        setFilteredActivities(prevActivities => [...prevActivities, ...data.map((item: GetActivity) => ({
          id: `${item.activity.EntryId}`,
          appName: item.app.FileDescription || item.app.ExeDirName,
          exeName: item.app.ExeFileName,
          exeIcon: `${API_BASE_URL}/static/icons/${item.app.ICON}`, // Add exeIcon if needed
          // exeIcon: item.activity.URL_ICON!==null?`${API_BASE_URL}/static/icons_url/${item.activity.URL_ICON}`:`${API_BASE_URL}/static/icons/${item.app.ICON}`, // Add exeIcon if needed
          windowTitle: item.activity.Title,
          url: item.activity.URL || undefined,
          isActive: item.activity.IsActive,
          duration: `${item.activity.Duration}`,
          startTime: formatDateWithOffset(item.activity.EndTime, item.activity.Duration, timeDelta),  // Adjust startTime as needed
          endTime: formatDate(item.activity.EndTime, timeDelta),
          idleDuration: `${item.activity.IdleDuration}`,
          category: undefined, // Add category if needed
        }))]);
        setPage(prevPage => prevPage + 1);  // Increment the page number
      }
    } catch (e) {
      console.error('Error fetching activities:', e);
      alert('Error fetching activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMoreActivities();  // Load the first page of data on mount
  }, []);
  
  // Calculate total productive/distracting time
  const totalProductiveTime = "5h 38m";
  const totalDistractingTime = "1h 20m";
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Activity History
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search activities..."
                className="pl-8 w-full md:w-[200px] lg:w-[300px]"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="all">
          <div className="px-6">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="all">All Activities</TabsTrigger>
              <TabsTrigger value="productive">Productive</TabsTrigger>
              <TabsTrigger value="distracting">Distracting</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0">
            <div className="flex items-center justify-between px-6 py-2 bg-muted/50">
              <div className="text-sm text-muted-foreground">
                Showing {filteredActivities.length} activities
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1 text-sm">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                  <span>Active: {totalProductiveTime}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
                  <span>Distracting: {totalDistractingTime}</span>
                </div>
              </div>
            </div>

            <ScrollArea className="h-[600px]">
              <div className="divide-y">
                {filteredActivities.map((activity, index) => (
                  <div key={activity.id} className="px-6 py-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* <div className="text-2xl">{activity.exeIcon}</div> */}
                      <img src={activity.exeIcon} alt="Executable Icon" className="h-8 w-8"/>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">{activity.appName}</h4>
                            <Badge variant={activity.isActive ? "default" : "outline"} className="h-5">
                              {activity.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {activity.category && (
                              <Badge variant="secondary" className="h-5">
                                {activity.category}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5 min-h-3.5 min-w-3.5" />
                            <span>{activity.duration}</span>
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground mt-1 truncate">
                          {activity.windowTitle}
                        </div>

                        {activity.url && (
                          <div className="text-sm text-primary flex items-center gap-1 mt-1">
                            <Globe className="h-3.5 w-3.5 min-h-3.5 min-w-3.5" />
                            <span className="truncate">{activity.url}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{activity.startTime} - {activity.endTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MonitorSmartphone className="h-3 w-3" />
                            <span>{activity.exeName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MousePointer className="h-3 w-3" />
                            <span>Idle: {activity.idleDuration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center mt-4 pb-4">
                <Button
                  variant="outline"
                  onClick={loadMoreActivities}
                  disabled={loading}
                  className="w-full max-w-xs bg-muted text-muted-foreground hover:bg-muted/80 transition-all rounded-md py-2"
                >
                  {loading ? (
                    <span className="flex justify-center items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-t-2 border-r-2 border-white rounded-full" /> Loading...
                    </span>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="productive" className="mt-0">
            <div className="flex items-center justify-between px-6 py-2 bg-muted/50">
              <div className="text-sm text-muted-foreground">
                Showing productive activities
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                <span>Total: {totalProductiveTime}</span>
              </div>
            </div>
            
            <ScrollArea className="h-[600px]">
              <div className="divide-y">
                {filteredActivities
                  .filter(a => ['Development', 'Research', 'Meeting', 'Design', 'File Management'].includes(a.category || ''))
                  .map((activity) => (
                    <div key={activity.id} className="px-6 py-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="text-2xl">{activity.exeIcon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium truncate">{activity.appName}</h4>
                              <Badge variant="default" className="h-5 bg-green-500">
                                Productive
                              </Badge>
                              {activity.category && (
                                <Badge variant="secondary" className="h-5">
                                  {activity.category}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3.5 w-3.5 min-h-3.5 min-w-3.5" />
                              <span>{activity.duration}</span>
                            </div>
                          </div>
                          
                          <div className="text-sm text-muted-foreground mt-1 truncate">
                            {activity.windowTitle}
                          </div>
                          
                          {activity.url && (
                            <div className="text-sm text-primary flex items-center gap-1 mt-1">
                              <Globe className="h-3.5 w-3.5 min-h-3.5 min-w-3.5" />
                              <span className="truncate">{activity.url}</span>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{activity.startTime} - {activity.endTime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MonitorSmartphone className="h-3 w-3" />
                              <span>{activity.exeName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MousePointer className="h-3 w-3" />
                              <span>Idle: {activity.idleDuration}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="distracting" className="mt-0">
            <div className="flex items-center justify-between px-6 py-2 bg-muted/50">
              <div className="text-sm text-muted-foreground">
                Showing distracting activities
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
                <span>Total: {totalDistractingTime}</span>
              </div>
            </div>
            
            <ScrollArea className="h-[600px]">
              <div className="divide-y">
                {filteredActivities
                  .filter(a => ['Entertainment', 'Communication'].includes(a.category || ''))
                  .map((activity) => (
                    <div key={activity.id} className="px-6 py-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="text-2xl">{activity.exeIcon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium truncate">{activity.appName}</h4>
                              <Badge variant="destructive" className="h-5">
                                Distracting
                              </Badge>
                              {activity.category && (
                                <Badge variant="secondary" className="h-5">
                                  {activity.category}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3.5 w-3.5 min-h-3.5 min-w-3.5" />
                              <span>{activity.duration}</span>
                            </div>
                          </div>
                          
                          <div className="text-sm text-muted-foreground mt-1 truncate">
                            {activity.windowTitle}
                          </div>
                          
                          {activity.url && (
                            <div className="text-sm text-primary flex items-center gap-1 mt-1">
                              <Globe className="h-3.5 w-3.5 min-h-3.5 min-w-3.5" />
                              <span className="truncate">{activity.url}</span>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{activity.startTime} - {activity.endTime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MonitorSmartphone className="h-3 w-3" />
                              <span>{activity.exeName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MousePointer className="h-3 w-3" />
                              <span>Idle: {activity.idleDuration}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
