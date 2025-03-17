
import React, { useState } from 'react';
import { SideNavigation } from '@/components/layout/SideNavigation';
import { Header } from '@/components/Header';
import { useParams, Link } from 'react-router-dom';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { 
  BarChart,
  ChevronLeft,
  Tags,
  Edit,
  Check,
  Ban,
  Pencil,
  Save,
  X,
  FileSymlink,
  AppWindow,
  Globe,
  Clock,
  Trash,
  Play,
  Pause
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { base64UrlDecode } from '@/lib/utils';


// Define interfaces
interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  type: 'app' | 'url' | 'both';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AppItem {
  id: string;
  name: string;
  exeFileName: string;
  icon: string;
  isBlocked: boolean;
}

interface URLItem {
  id: string;
  url: string;
  title: string;
  icon: string;
  isBlocked: boolean;
}

// Mock data
const mockCategories: Record<string, Category> = {
  '1': {
    id: '1',
    name: 'Social Media',
    description: 'Social networking platforms',
    color: '#FF5733',
    type: 'both',
    isActive: true,
    createdAt: '2023-01-15T12:00:00Z',
    updatedAt: '2023-10-20T08:45:00Z'
  },
  '2': {
    id: '2',
    name: 'Productivity',
    description: 'Tools that help get work done',
    color: '#33FF57',
    type: 'app',
    isActive: true,
    createdAt: '2023-02-28T14:30:00Z',
    updatedAt: '2023-11-05T16:20:00Z'
  },
  '3': {
    id: '3',
    name: 'Entertainment',
    description: 'Games and media platforms',
    color: '#3357FF',
    type: 'both',
    isActive: true,
    createdAt: '2023-03-10T09:15:00Z',
    updatedAt: '2023-10-30T11:40:00Z'
  }
};

const mockApps: AppItem[] = [
  { id: '1', name: 'Chrome', exeFileName: 'chrome.exe', icon: 'C', isBlocked: false },
  { id: '2', name: 'Firefox', exeFileName: 'firefox.exe', icon: 'F', isBlocked: true },
  { id: '3', name: 'Discord', exeFileName: 'discord.exe', icon: 'D', isBlocked: true },
  { id: '4', name: 'Slack', exeFileName: 'slack.exe', icon: 'S', isBlocked: false }
];

const mockURLs: URLItem[] = [
  { id: '1', url: 'https://facebook.com', title: 'Facebook', icon: 'F', isBlocked: true },
  { id: '2', url: 'https://twitter.com', title: 'Twitter', icon: 'T', isBlocked: true },
  { id: '3', url: 'https://instagram.com', title: 'Instagram', icon: 'I', isBlocked: false },
  { id: '4', url: 'https://linkedin.com', title: 'LinkedIn', icon: 'L', isBlocked: false }
];

// Usage statistics
const mockUsageStats = {
  totalItems: 8,
  blockedItems: 4,
  usageByDay: [
    { day: 'Mon', usage: 30 },
    { day: 'Tue', usage: 45 },
    { day: 'Wed', usage: 25 },
    { day: 'Thu', usage: 60 },
    { day: 'Fri', usage: 35 },
    { day: 'Sat', usage: 15 },
    { day: 'Sun', usage: 10 }
  ],
  lastAccessed: '2023-11-15T16:30:00Z'
};

const CategoryView = () => {
  const { categoryIdb64 } = useParams<{ categoryIdb64: string }>();
  const categoryId = base64UrlDecode(categoryIdb64);  
  const [category, setCategory] = useState<Category | null>(categoryId ? mockCategories['1'] : null);
  const [apps, setApps] = useState<AppItem[]>(mockApps);
  const [urls, setUrls] = useState<URLItem[]>(mockURLs);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCategory, setEditedCategory] = useState<Partial<Category>>({});

  // Handle case when category is not found
  if (!category) {
    return (
      <div className="flex min-h-screen">
        <SideNavigation />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 py-6 px-6 bg-background">
            <div className="max-w-4xl mx-auto text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
              <p className="text-muted-foreground mb-8">The category you're looking for doesn't exist or has been removed.</p>
              <Button asChild>
                <Link to="/categories">Return to Categories</Link>
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Toggle edit mode
  const handleToggleEdit = () => {
    if (isEditing) {
      // Cancel editing
      setEditedCategory({});
    } else {
      // Start editing - populate form with current values
      setEditedCategory({ ...category });
    }
    setIsEditing(!isEditing);
  };

  // Save category changes
  const handleSaveCategory = () => {
    if (!editedCategory.name) {
      toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }

    const updatedCategory = {
      ...category,
      ...editedCategory,
      updatedAt: new Date().toISOString()
    };

    setCategory(updatedCategory);
    setIsEditing(false);
    setEditedCategory({});

    toast({
      title: "Category Updated",
      description: "Category details have been updated successfully"
    });
  };

  // Toggle block status for an app
  const toggleAppBlock = (appId: string) => {
    setApps(prev => 
      prev.map(app => 
        app.id === appId ? { ...app, isBlocked: !app.isBlocked } : app
      )
    );

    const app = apps.find(app => app.id === appId);
    if (app) {
      toast({
        title: app.isBlocked ? "App Unblocked" : "App Blocked",
        description: `"${app.name}" has been ${app.isBlocked ? 'unblocked' : 'blocked'}.`
      });
    }
  };

  // Toggle block status for a URL
  const toggleURLBlock = (urlId: string) => {
    setUrls(prev => 
      prev.map(url => 
        url.id === urlId ? { ...url, isBlocked: !url.isBlocked } : url
      )
    );

    const url = urls.find(url => url.id === urlId);
    if (url) {
      toast({
        title: url.isBlocked ? "URL Unblocked" : "URL Blocked",
        description: `"${url.title}" has been ${url.isBlocked ? 'unblocked' : 'blocked'}.`
      });
    }
  };

  // Delete category
  const handleDeleteCategory = () => {
    toast({
      title: "Category Deleted",
      description: `"${category.name}" has been deleted.`
    });
    // In a real app, would redirect to categories page
  };

  // Toggle category active status
  const toggleCategoryStatus = () => {
    const updatedCategory = {
      ...category,
      isActive: !category.isActive,
      updatedAt: new Date().toISOString()
    };

    setCategory(updatedCategory);

    toast({
      title: updatedCategory.isActive ? "Category Activated" : "Category Deactivated",
      description: `"${category.name}" has been ${updatedCategory.isActive ? 'activated' : 'deactivated'}.`
    });
  };

  return (
    <div className="flex min-h-screen">
      <SideNavigation />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 py-6 px-6 bg-background">
          <div className="max-w-6xl mx-auto fade-in">
            <div className="flex items-center gap-2 mb-6">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/categories">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Categories
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category details */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-6 w-6 rounded-md"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <CardTitle className="text-xl">
                      {isEditing ? (
                        <Input 
                          value={editedCategory.name || ''}
                          onChange={(e) => setEditedCategory({...editedCategory, name: e.target.value})}
                          className="max-w-xs"
                        />
                      ) : (
                        category.name
                      )}
                    </CardTitle>
                  </div>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button variant="outline" size="sm" onClick={handleToggleEdit}>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                        <Button variant="default" size="sm" onClick={handleSaveCategory}>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" size="sm" onClick={handleToggleEdit}>
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium">Description</div>
                      {isEditing ? (
                        <Input 
                          value={editedCategory.description || ''}
                          onChange={(e) => setEditedCategory({...editedCategory, description: e.target.value})}
                          placeholder="Enter description"
                          className="mt-1"
                        />
                      ) : (
                        <div className="text-sm text-muted-foreground mt-1">
                          {category.description || "No description provided"}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium">Color</div>
                        {isEditing ? (
                          <div className="flex gap-2 mt-1">
                            <Input 
                              type="color" 
                              value={editedCategory.color || '#000000'}
                              onChange={(e) => setEditedCategory({...editedCategory, color: e.target.value})}
                              className="w-12 h-8 p-1"
                            />
                            <div 
                              className="flex-1 h-8 rounded-md border"
                              style={{ backgroundColor: editedCategory.color || '#000000' }}
                            ></div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mt-1">
                            <div 
                              className="w-4 h-4 rounded-md"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <span className="text-sm text-muted-foreground">{category.color}</span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium">Applied To</div>
                        {isEditing ? (
                          <Select 
                            value={editedCategory.type || 'both'}
                            onValueChange={(value) => setEditedCategory({...editedCategory, type: value as 'app' | 'url' | 'both'})}
                            // className="mt-1"
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="app">Applications Only</SelectItem>
                              <SelectItem value="url">URLs Only</SelectItem>
                              <SelectItem value="both">Both Apps and URLs</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="text-sm text-muted-foreground mt-1">
                            {category.type === 'app'
                              ? 'Applications Only'
                              : category.type === 'url'
                              ? 'URLs Only'
                              : 'Both Apps and URLs'}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium">Status</div>
                        <div className="text-sm mt-1">
                          <Badge variant={category.isActive ? 'default' : 'destructive'}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium">Date Created</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {new Date(category.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="pt-2 flex justify-between">
                      <div>
                        <Button 
                          variant={category.isActive ? "outline" : "default"} 
                          onClick={toggleCategoryStatus}
                        >
                          {category.isActive ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <Button variant="destructive" onClick={handleDeleteCategory}>
                        <Trash className="h-4 w-4 mr-2" />
                        Delete Category
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Stats */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Usage Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/30 rounded-lg text-center">
                        <div className="text-2xl font-semibold">{mockUsageStats.totalItems}</div>
                        <div className="text-sm text-muted-foreground">Total Items</div>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-lg text-center">
                        <div className="text-2xl font-semibold">{mockUsageStats.blockedItems}</div>
                        <div className="text-sm text-muted-foreground">Blocked</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium mb-2">Usage by Day</div>
                      <div className="h-32">
                        {/* Simple bar chart */}
                        <div className="flex items-end h-24 gap-1">
                          {mockUsageStats.usageByDay.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center">
                              <div 
                                className="w-full bg-primary/80 rounded-t-sm" 
                                style={{ height: `${day.usage}%` }}
                              ></div>
                              <div className="text-xs mt-1">{day.day}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium">Last Accessed</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {new Date(mockUsageStats.lastAccessed).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Items in category */}
            <div className="mt-8">
              <Tabs defaultValue={category.type === 'url' ? "urls" : "apps"} className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <TabsList>
                    {(category.type === 'app' || category.type === 'both') && (
                      <TabsTrigger value="apps" className="flex items-center gap-1">
                        <AppWindow className="h-4 w-4" />
                        Applications
                      </TabsTrigger>
                    )}
                    {(category.type === 'url' || category.type === 'both') && (
                      <TabsTrigger value="urls" className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        URLs
                      </TabsTrigger>
                    )}
                  </TabsList>
                  
                  <Button variant="outline" size="sm">
                    <FileSymlink className="h-4 w-4 mr-2" />
                    Add Items
                  </Button>
                </div>
                
                {(category.type === 'app' || category.type === 'both') && (
                  <TabsContent value="apps" className="space-y-4">
                    {apps.length > 0 ? (
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-2">
                          {apps.map(app => (
                            <Card key={app.id}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center font-medium text-xl">
                                      {app.icon}
                                    </div>
                                    <div>
                                      <div className="font-medium">{app.name}</div>
                                      <div className="text-xs text-muted-foreground">{app.exeFileName}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={app.isBlocked ? "destructive" : "outline"}>
                                      {app.isBlocked ? 'Blocked' : 'Allowed'}
                                    </Badge>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => toggleAppBlock(app.id)}
                                    >
                                      {app.isBlocked ? (
                                        <Check className="h-4 w-4" />
                                      ) : (
                                        <Ban className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        No applications in this category
                      </div>
                    )}
                  </TabsContent>
                )}
                
                {(category.type === 'url' || category.type === 'both') && (
                  <TabsContent value="urls" className="space-y-4">
                    {urls.length > 0 ? (
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-2">
                          {urls.map(url => (
                            <Card key={url.id}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center font-medium text-xl">
                                      {url.icon}
                                    </div>
                                    <div>
                                      <div className="font-medium">{url.title}</div>
                                      <div className="text-xs text-primary">{url.url}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={url.isBlocked ? "destructive" : "outline"}>
                                      {url.isBlocked ? 'Blocked' : 'Allowed'}
                                    </Badge>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => toggleURLBlock(url.id)}
                                    >
                                      {url.isBlocked ? (
                                        <Check className="h-4 w-4" />
                                      ) : (
                                        <Ban className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        No URLs in this category
                      </div>
                    )}
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CategoryView;
