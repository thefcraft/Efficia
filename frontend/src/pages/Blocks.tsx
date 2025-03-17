
import React, { useState } from 'react';
import { SideNavigation } from '@/components/layout/SideNavigation';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ban, Plus, Clock, Target, Calendar, X } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface BlockedItem {
  id: string;
  name: string;
  icon: string;
  category: string;
  type: 'app' | 'website';
  permanent: boolean;
  activeIn?: { type: 'goal' | 'session', name: string }[];
}

const initialBlockedItems: BlockedItem[] = [
  { 
    id: '1', 
    name: 'YouTube', 
    icon: 'Y', 
    category: 'Social Media', 
    type: 'website',
    permanent: false,
    activeIn: [
      { type: 'goal', name: 'Learn Python' },
      { type: 'session', name: 'Deep Work' }
    ]
  },
  { 
    id: '2', 
    name: 'Facebook', 
    icon: 'F', 
    category: 'Social Media', 
    type: 'website',
    permanent: true
  },
  { 
    id: '3', 
    name: 'Twitter', 
    icon: 'T', 
    category: 'Social Media', 
    type: 'website',
    permanent: false,
    activeIn: [
      { type: 'session', name: 'Deep Work' }
    ]
  },
  { 
    id: '4', 
    name: 'Instagram', 
    icon: 'I', 
    category: 'Social Media', 
    type: 'website',
    permanent: false,
    activeIn: [
      { type: 'goal', name: 'Learn Python' }
    ]
  },
  { 
    id: '5', 
    name: 'Discord', 
    icon: 'D', 
    category: 'Communication', 
    type: 'app',
    permanent: false,
    activeIn: [
      { type: 'session', name: 'Deep Work' }
    ]
  },
  { 
    id: '6', 
    name: 'Steam', 
    icon: 'S', 
    category: 'Games', 
    type: 'app',
    permanent: false,
    activeIn: [
      { type: 'goal', name: 'Complete Project' }
    ]
  },
  { 
    id: '7', 
    name: 'Reddit', 
    icon: 'R', 
    category: 'Social Media', 
    type: 'website',
    permanent: true
  },
  { 
    id: '8', 
    name: 'Netflix', 
    icon: 'N', 
    category: 'Entertainment', 
    type: 'website',
    permanent: false,
    activeIn: [
      { type: 'goal', name: 'Complete Project' },
      { type: 'session', name: 'Deep Work' }
    ]
  },
];

const NewBlockDialog = ({ onAdd }: { onAdd: (item: Omit<BlockedItem, 'id'>) => void }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<'app' | 'website'>('website');
  const [permanent, setPermanent] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive"
      });
      return;
    }
    
    const newItem = {
      name,
      icon: name.charAt(0).toUpperCase(),
      category: category || 'Uncategorized',
      type,
      permanent,
    };
    
    onAdd(newItem);
    setName('');
    setCategory('');
    setType('website');
    setPermanent(false);
    setOpen(false);
    
    toast({
      title: "Block Added",
      description: `"${name}" has been added to your blocked items.`
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full gap-2">
          <Ban className="h-4 w-4" />
          Add New Block
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Block</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter name to block"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input 
              id="category" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              placeholder="e.g., Social Media, Games, etc."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select 
              value={type} 
              onValueChange={(value) => setType(value as 'app' | 'website')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="app">Application</SelectItem>
                <SelectItem value="website">Website</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between space-y-0 pt-2">
            <Label htmlFor="permanent">Permanently blocked</Label>
            <Switch 
              id="permanent" 
              checked={permanent} 
              onCheckedChange={setPermanent}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Block</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const BlockItem = ({ item, onToggle }: { item: BlockedItem, onToggle: (id: string) => void }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center font-medium text-xl">
              {item.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="font-medium">{item.name}</div>
                <Badge variant="outline" className="text-xs">
                  {item.type === 'app' ? 'Application' : 'Website'}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">{item.category}</div>
            </div>
          </div>
          <Switch checked={item.permanent} onCheckedChange={() => onToggle(item.id)} />
        </div>
        
        {item.activeIn && item.activeIn.length > 0 && (
          <div className="mt-4 border-t pt-3">
            <div className="text-xs text-muted-foreground mb-2">Active in:</div>
            <div className="flex flex-wrap gap-2">
              {item.activeIn.map((active, idx) => (
                <div key={idx} className="flex items-center gap-1 text-xs border rounded-full px-2 py-1">
                  {active.type === 'goal' ? (
                    <Target className="h-3 w-3" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  <span>{active.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const Blocks = () => {
  const [blockedItems, setBlockedItems] = useState<BlockedItem[]>(initialBlockedItems);
  const [showPermanentOnly, setShowPermanentOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const addNewBlock = (blockData: Omit<BlockedItem, 'id'>) => {
    const newId = (Math.max(...blockedItems.map(item => parseInt(item.id))) + 1).toString();
    setBlockedItems([...blockedItems, { id: newId, ...blockData }]);
  };

  const toggleBlockPermanent = (id: string) => {
    setBlockedItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, permanent: !item.permanent } : item
      )
    );
    
    const item = blockedItems.find(item => item.id === id);
    if (item) {
      toast({
        title: item.permanent ? "Block removed from permanent" : "Block set to permanent",
        description: `"${item.name}" will ${item.permanent ? 'now be active only during sessions' : 'now be permanently blocked'}.`
      });
    }
  };

  const addNewCategory = () => {
    toast({
      title: "Add New Category",
      description: "This feature is coming soon!"
    });
  };

  const createAppBlock = () => {
    toast({
      title: "Add App Block",
      description: "Block a desktop application from distracting you"
    });
  };

  const createWebsiteBlock = () => {
    toast({
      title: "Add Website Block",
      description: "Block a website from distracting you"
    });
  };

  const filteredItems = blockedItems.filter(item => {
    if (showPermanentOnly && !item.permanent) return false;
    if (activeTab === 'apps' && item.type !== 'app') return false;
    if (activeTab === 'websites' && item.type !== 'website') return false;
    return true;
  });

  const categories = Array.from(new Set(blockedItems.map(item => item.category)));

  return (
    <div className="flex min-h-screen">
      <SideNavigation />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 py-6 px-6 bg-background">
          <div className="max-w-6xl mx-auto fade-in">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-display font-bold">Blocks</h1>
              <NewBlockDialog onAdd={addNewBlock} />
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <div className="flex justify-between items-center">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="apps">Applications</TabsTrigger>
                  <TabsTrigger value="websites">Websites</TabsTrigger>
                  <TabsTrigger value="categories">Categories</TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show permanent only</span>
                  <Switch checked={showPermanentOnly} onCheckedChange={setShowPermanentOnly} />
                </div>
              </div>
              
              <TabsContent value="all" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map(item => (
                    <BlockItem key={item.id} item={item} onToggle={toggleBlockPermanent} />
                  ))}
                  
                  {/* Add new block card */}
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
                    <CardContent className="pt-6 flex flex-col items-center justify-center h-full text-center min-h-[180px]">
                      <div className="p-3 rounded-full bg-secondary text-secondary-foreground mb-3">
                        <Plus className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-medium">Add New Block</h3>
                      <p className="text-sm text-muted-foreground mt-1">Block an app or website</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="apps" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map(item => (
                    <BlockItem key={item.id} item={item} onToggle={toggleBlockPermanent} />
                  ))}
                  
                  {/* Add new block card */}
                  <Card 
                    className="hover:shadow-md transition-shadow cursor-pointer border-dashed"
                    onClick={createAppBlock}
                  >
                    <CardContent className="pt-6 flex flex-col items-center justify-center h-full text-center min-h-[180px]">
                      <div className="p-3 rounded-full bg-secondary text-secondary-foreground mb-3">
                        <Plus className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-medium">Add New App Block</h3>
                      <p className="text-sm text-muted-foreground mt-1">Block a desktop application</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="websites" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map(item => (
                    <BlockItem key={item.id} item={item} onToggle={toggleBlockPermanent} />
                  ))}
                  
                  {/* Add new block card */}
                  <Card 
                    className="hover:shadow-md transition-shadow cursor-pointer border-dashed"
                    onClick={createWebsiteBlock}
                  >
                    <CardContent className="pt-6 flex flex-col items-center justify-center h-full text-center min-h-[180px]">
                      <div className="p-3 rounded-full bg-secondary text-secondary-foreground mb-3">
                        <Plus className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-medium">Add New Website Block</h3>
                      <p className="text-sm text-muted-foreground mt-1">Block a website or domain</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="categories" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category, index) => {
                    const categoryItems = blockedItems.filter(item => item.category === category);
                    return (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center font-medium text-xl">
                                {category.substring(0, 2)}
                              </div>
                              <div>
                                <div className="font-medium">{category}</div>
                                <div className="text-xs text-muted-foreground">{categoryItems.length} {categoryItems.length === 1 ? 'item' : 'items'}</div>
                              </div>
                            </div>
                            <Switch 
                              checked={categoryItems.every(item => item.permanent)}
                              onCheckedChange={() => {
                                toast({
                                  title: "Toggle Category",
                                  description: `All items in "${category}" will be updated.`
                                });
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                  {/* Add new category card */}
                  <Card 
                    className="hover:shadow-md transition-shadow cursor-pointer border-dashed"
                    onClick={addNewCategory}
                  >
                    <CardContent className="pt-6 flex flex-col items-center justify-center h-full text-center min-h-[120px]">
                      <div className="p-3 rounded-full bg-secondary text-secondary-foreground mb-3">
                        <Plus className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-medium">Add New Category</h3>
                      <p className="text-sm text-muted-foreground mt-1">Create a group of blocks</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Blocks;
