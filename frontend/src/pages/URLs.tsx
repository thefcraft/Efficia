import React, { useState, useMemo, useEffect } from 'react';
import { SideNavigation } from '@/components/layout/SideNavigation';
import { Header } from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Plus, 
  Ban, 
  Check, 
  MoreVertical, 
  Globe,
  ArrowUpDown,
  Eye,
  ExternalLink,
  Filter,
  Loader2
} from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api, { BaseUrlResponse, Category as ApiCategory, SimpleSuccessResponse } from '@/lib/api';
import { base64UrlEncode } from '@/lib/utils';
import { ImageWithFallback } from '@/components/utils';

// URL interface
interface URL {
  id: string;
  url: string;
  title?: string;
  description?: string;
  icon?: string;
  category?: string;
  isBlocked: boolean;
  lastVisited?: string;
  visitCount?: number;
  dailyLimit?: string;
  tags?: string[];
}

// Sample categories
const categories = ['Entertainment', 'Social Media', 'Development', 'Professional', 'Shopping', 'News', 'Education'];

const URLs = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [blockStatusFilter, setBlockStatusFilter] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<'title' | 'lastVisited' | 'visitCount'>('lastVisited');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [newURLDialogOpen, setNewURLDialogOpen] = useState(false);
  const [blockingStatus, setBlockingStatus] = useState<Record<string, boolean>>({}); // Loading state per URL
  const [newURL, setNewURL] = useState({
    url: '',
    title: '',
    category: '',
    isBlocked: false,
    dailyLimit: ''
  });

  const [urls, setUrls] = useState<URL[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const loadUrls = async () => {
    if (loading) return;
    setLoading(true);
    try {
        const res = await api.get(`/baseUrls`);
        const data = res.data; // You can map it to your ActivityEntry format here
        setUrls(data.map((item: BaseUrlResponse) => ({
          id: base64UrlEncode(item.baseURL),
          url: item.baseURL,
          title: item.Title,
          description: item.Description,
          icon: item.icon_url,
          category: item.Category,
          isBlocked: false,
          lastVisited: item.lastVisited,
          visitCount: item.visitCount,
          // dailyLimit?: string;
          // tags?: string[];
        })));
      } catch (e) {
        console.error('Error fetching activities:', e);
        alert('Error fetching activities');
      } finally {
        setLoading(false);
      }
  }
  useEffect(() => {
    loadUrls();
  }, [])
  
  // Filtered and sorted URLs
  // const filteredURLs = useMemo(() => {
  //   return urls
  //     .filter(url => {
  //       const matchesSearch = 
  //         url.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //         (url.title && url.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
  //         (url.description && url.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
  //         (url.category && url.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
  //         (url.tags && url.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
          
  //       const matchesCategory = categoryFilter === null || url.category === categoryFilter;
  //       const matchesBlockStatus = blockStatusFilter === null || url.isBlocked === blockStatusFilter;
        
  //       return matchesSearch && matchesCategory && matchesBlockStatus;
  //     })
  //     .sort((a, b) => {
  //       if (sortBy === 'title') {
  //         const titleA = a.title || a.url;
  //         const titleB = b.title || b.url;
  //         return sortOrder === 'asc' 
  //           ? titleA.localeCompare(titleB)
  //           : titleB.localeCompare(titleA);
  //       } else if (sortBy === 'lastVisited') {
  //         if (!a.lastVisited && !b.lastVisited) return 0;
  //         if (!a.lastVisited) return sortOrder === 'asc' ? -1 : 1;
  //         if (!b.lastVisited) return sortOrder === 'asc' ? 1 : -1;
  //         return sortOrder === 'asc'
  //           ? new Date(a.lastVisited).getTime() - new Date(b.lastVisited).getTime()
  //           : new Date(b.lastVisited).getTime() - new Date(a.lastVisited).getTime();
  //       } else if (sortBy === 'visitCount') {
  //         const countA = a.visitCount || 0;
  //         const countB = b.visitCount || 0;
  //         return sortOrder === 'asc' ? countA - countB : countB - countA;
  //       }
  //       return 0;
  //     });
  // }, [searchTerm, categoryFilter, blockStatusFilter, sortBy, sortOrder]);
  const filteredURLs = urls;

  const handleSort = (column: 'title' | 'lastVisited' | 'visitCount') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handleToggleBlock = async (urlToToggle: URL) => {
    const originalStatus = urlToToggle.isBlocked;
    const baseURL = urlToToggle.url; // Use original baseURL for API call

    setBlockingStatus(prev => ({ ...prev, [baseURL]: true })); // Set loading
    // Optimistic UI Update
    setUrls(prevUrls =>
      prevUrls.map(url =>
        url.id === urlToToggle.id ? { ...url, isBlocked: !originalStatus } : url
      )
    );

    try {
      const response = await api.put<SimpleSuccessResponse>(`/urls/${encodeURIComponent(baseURL)}/block`, { block: !originalStatus }); // Ensure baseURL is encoded for the path
      toast({
        title: !originalStatus ? "URL Blocked" : "URL Unblocked",
        description: response.data.message || `"${urlToToggle.title || baseURL}" status updated.`
      });
    } catch (error: any) {
      console.error("Failed to toggle block status:", error);
      const errorMsg = error.response?.data?.detail || "Failed to update block status.";
      toast({ title: "Error", description: errorMsg, variant: "destructive" });
      // Rollback optimistic update
      setUrls(prevUrls =>
        prevUrls.map(url =>
          url.id === urlToToggle.id ? { ...url, isBlocked: originalStatus } : url
        )
      );
    } finally {
        setBlockingStatus(prev => ({ ...prev, [baseURL]: false })); // Reset loading
    }
  };

  const handleAddNewURL = () => {
    // Here you would add to your database
    setNewURLDialogOpen(false);
    toast({
      title: "URL Added",
      description: "The new URL has been added successfully."
    });
  };

  const handleViewURL = (urlId: string) => {
    navigate(`/urls/${urlId}`);
  };

  return (
    <div className="flex min-h-screen">
      <SideNavigation />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 py-6 px-6 bg-background">
          <div className="max-w-7xl mx-auto fade-in">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
              <div>
                <h1 className="text-3xl font-bold">URLs</h1>
                <p className="text-muted-foreground">Manage and monitor website visits</p>
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search URLs..."
                    className="pl-8 w-full md:w-[300px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <div className="p-2">
                      <div className="mb-2 text-xs font-medium">Category</div>
                      <div className="space-y-1">
                        <Button
                          variant={categoryFilter === null ? "default" : "outline"}
                          size="sm"
                          className="w-full justify-start text-xs"
                          onClick={() => setCategoryFilter(null)}
                        >
                          All Categories
                        </Button>
                        {categories.map(category => (
                          <Button
                            key={category}
                            variant={categoryFilter === category ? "default" : "outline"}
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => setCategoryFilter(category)}
                          >
                            {category}
                          </Button>
                        ))}
                      </div>
                      
                      <div className="mt-4 mb-2 text-xs font-medium">Status</div>
                      <div className="space-y-1">
                        <Button
                          variant={blockStatusFilter === null ? "default" : "outline"}
                          size="sm"
                          className="w-full justify-start text-xs"
                          onClick={() => setBlockStatusFilter(null)}
                        >
                          All
                        </Button>
                        <Button
                          variant={blockStatusFilter === false ? "default" : "outline"}
                          size="sm"
                          className="w-full justify-start text-xs"
                          onClick={() => setBlockStatusFilter(false)}
                        >
                          Allowed
                        </Button>
                        <Button
                          variant={blockStatusFilter === true ? "default" : "outline"}
                          size="sm"
                          className="w-full justify-start text-xs"
                          onClick={() => setBlockStatusFilter(true)}
                        >
                          Blocked
                        </Button>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button onClick={() => setNewURLDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add URL
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="list" className="mt-6">
              <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="list" className="mt-4">
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>
                            <Button variant="ghost" className="flex items-center gap-1 px-0 font-medium" onClick={() => handleSort('title')}>
                              URL
                              <ArrowUpDown className="h-3 w-3" />
                            </Button>
                          </TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>
                            <Button variant="ghost" className="flex items-center gap-1 px-0 font-medium" onClick={() => handleSort('lastVisited')}>
                              Last Visited
                              <ArrowUpDown className="h-3 w-3" />
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button variant="ghost" className="flex items-center gap-1 px-0 font-medium" onClick={() => handleSort('visitCount')}>
                              Visit Count
                              <ArrowUpDown className="h-3 w-3" />
                            </Button>
                          </TableHead>
                          <TableHead>Time Limit</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredURLs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                              No URLs found. Try changing your filters or adding a new URL.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredURLs.map((url) => (
                            <TableRow key={url.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewURL(url.id)}>
                              <TableCell className="font-medium text-xl">
                                <ImageWithFallback src={url.icon || 'none'} fallbackSrc={'http://localhost:8080/null_url.png'} alt="Executable Icon" className="h-8 w-8 min-w-8 min-h-8"/>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{url.title}</div>
                                <div className="text-sm text-muted-foreground truncate max-w-[250px]">
                                  {url.url}
                                </div>
                              </TableCell>
                              <TableCell>
                                {url.category ? (
                                  <Badge variant="outline">{url.category}</Badge>
                                ) : (
                                  <span className="text-muted-foreground text-sm">Uncategorized</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {url.lastVisited ? (
                                  <div className="text-sm">
                                    {new Date(url.lastVisited).toLocaleDateString()}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">Never</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {url.visitCount || 0}
                              </TableCell>
                              <TableCell>
                                {url.dailyLimit ? (
                                  <span>{url.dailyLimit}</span>
                                ) : (
                                  <span className="text-muted-foreground text-sm">None</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant={url.isBlocked ? "destructive" : "default"} className="h-5">
                                  {url.isBlocked ? "Blocked" : "Allowed"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-end gap-0" onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.open('https://'+url.url, '_blank')}><ExternalLink className="h-4 w-4" /></Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild> 
                                      <Button variant="ghost" size="icon" className="h-7 w-7" disabled={blockingStatus[url.url]}> 
                                        <MoreVertical className="h-4 w-4" /> 
                                      </Button> 
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleToggleBlock(url)} disabled={blockingStatus[url.url]}>
                                          {blockingStatus[url.url] ? 
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : (
                                            url.isBlocked ? <div><Check className="h-4 w-4 mr-2" />Unblock</div> : <div><Ban className="h-4 w-4 mr-2" />Block</div>)}
                                       </DropdownMenuItem>
                                      {/* Add other actions */}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="grid" className="mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredURLs.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      No URLs found. Try changing your filters or adding a new URL.
                    </div>
                  ) : (
                    filteredURLs.map((url) => (
                      <Card 
                        key={url.id} 
                        className="cursor-pointer hover:bg-muted/30 transition-colors overflow-hidden"
                        onClick={() => handleViewURL(url.id)}
                      >
                        <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between gap-2">
                          <div className="flex items-start gap-3">
                            {/* <div className="text-2xl">{url.icon || '🌐'}</div> */}
                            {/* <img src={url.icon} alt="Executable Icon" className="h-8 w-8"/> */}
                            <div className="truncate">
                              <CardTitle className="text-base truncate">{url.title}</CardTitle>
                              <p className="text-sm text-muted-foreground truncate">{url.url}</p>
                            </div>
                          </div>
                          <Badge variant={url.isBlocked ? "destructive" : "default"} className="h-5 flex-shrink-0">
                            {url.isBlocked ? "Blocked" : "Allowed"}
                          </Badge>
                        </CardHeader>
                        
                        <CardContent className="p-4 pt-2">
                          <div className="flex flex-col gap-2">
                            {url.category && (
                              <Badge variant="outline" className="w-fit">
                                {url.category}
                              </Badge>
                            )}
                            
                            <div className="text-sm text-muted-foreground mt-2">
                              <div className="flex items-center justify-between">
                                <span>Visit count:</span>
                                <span className="font-medium text-foreground">{url.visitCount || 0}</span>
                              </div>
                              
                              {url.dailyLimit && (
                                <div className="flex items-center justify-between mt-1">
                                  <span>Daily limit:</span>
                                  <span className="font-medium text-foreground">{url.dailyLimit}</span>
                                </div>
                              )}
                              
                              {url.lastVisited && (
                                <div className="flex items-center justify-between mt-1">
                                  <span>Last visited:</span>
                                  <span className="font-medium text-foreground">
                                    {new Date(url.lastVisited).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between mt-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(url.url, '_blank');
                                }}
                                className="px-2 gap-1"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Visit
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleBlock(url);
                                }}
                                className="px-2 gap-1"
                              >
                                {url.isBlocked ? (
                                  <>
                                    <Check className="h-3.5 w-3.5" />
                                    Unblock
                                  </>
                                ) : (
                                  <>
                                    <Ban className="h-3.5 w-3.5" />
                                    Block
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        
      {/* Add New URL Dialog */}
      <Dialog open={newURLDialogOpen} onOpenChange={setNewURLDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New URL</DialogTitle>
            <DialogDescription>
              Enter the details of the URL you want to add for tracking or blocking.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input 
                id="url" 
                placeholder="https://example.com" 
                value={newURL.url}
                onChange={(e) => setNewURL({ ...newURL, url: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input 
                id="title" 
                placeholder="Example Website" 
                value={newURL.title}
                onChange={(e) => setNewURL({ ...newURL, title: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <select 
                id="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newURL.category}
                onChange={(e) => setNewURL({ ...newURL, category: e.target.value })}
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="dailyLimit">Daily Time Limit (Optional)</Label>
              <Input 
                id="dailyLimit" 
                type="time"
                placeholder="HH:MM"
                value={newURL.dailyLimit}
                onChange={(e) => setNewURL({ ...newURL, dailyLimit: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Format: HH:MM (hours:minutes)</p>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="isBlocked">Block this URL</Label>
              <input
                id="isBlocked"
                type="checkbox"
                className="h-5 w-5"
                checked={newURL.isBlocked}
                onChange={(e) => setNewURL({ ...newURL, isBlocked: e.target.checked })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewURLDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNewURL}>
              <Plus className="h-4 w-4 mr-2" />
              Add URL
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      </div>
    </div>
  );
};

export default URLs;
