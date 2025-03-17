
import React, { useEffect, useState } from 'react';
import { SideNavigation } from '@/components/layout/SideNavigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, ArrowUpDown, ExternalLink, Edit, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { base64UrlEncode, stringToColor } from '@/lib/utils';
import api, {Category as apiCategory} from '@/lib/api';

// Define the category interface
interface Category {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  type: 'app' | 'url' | 'both';
  isActive: boolean;
}

// New Category Dialog Component
const NewCategoryDialog = ({ onAdd }: { onAdd: (category: Omit<Category, 'id' | 'itemCount'>) => void }) => {
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState<boolean>(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      const res = await api.post(`/categories`, {
        Category: name,
        BlockId: null
      });
      const data: apiCategory = res.data; // You can map it to your ActivityEntry format here
      onAdd({
        name: data.Category,
        description: "",
        type: "both",
        isActive: true
      });
      setName('');
      toast({
        title: "Category Added",
        description: `"${name}" has been added to your categories.`
      });
    } catch (e) {
      console.error('Error fetching activities:', e);
      toast({
        title: "Error",
        description: `${e}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full gap-2">
          <Plus className="h-4 w-4" />
          Add New Category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter category name"
              required
            />
          </div>
          
          
          <div className="space-y-2">
            <Label>Color</Label>
            <div 
              className="flex-1 h-10 rounded-md border"
              style={{ backgroundColor: stringToColor(name) }}
            />
          </div>
        
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Category</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Category card component
const CategoryCard = ({ category }: { category: Category }) => {
  return (
    <Card className="overflow-hidden">
      <div 
        className="h-3"
        style={{ backgroundColor: stringToColor(category.name) }}
      ></div>
      <CardContent className="pt-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{category.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
            
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="text-xs">
                {category.itemCount} items
              </Badge>
              
              {category.type === 'app' && (
                <Badge variant="secondary" className="text-xs">
                  Apps Only
                </Badge>
              )}
              
              {category.type === 'url' && (
                <Badge variant="secondary" className="text-xs">
                  URLs Only
                </Badge>
              )}
              
              {category.type === 'both' && (
                <Badge variant="secondary" className="text-xs">
                  Apps & URLs
                </Badge>
              )}
              
              {!category.isActive && (
                <Badge variant="destructive" className="text-xs">
                  Inactive
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/categories/${base64UrlEncode(category.id)}`}>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Categories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const loadCategory = async () => {
    if (loading) return;
    setLoading(true);
    try {
        const res = await api.get(`/categories`);
        const data = res.data; // You can map it to your ActivityEntry format here
        setCategories(data.map((item: apiCategory) => ({
          id: item.Category,
          name: item.Category,
          description: "",
          itemCount: item.itemCount,
          type: 'both',
          isActive: false,
        })));
      } catch (e) {
        console.error('Error fetching activities:', e);
        alert('Error fetching activities');
      } finally {
        setLoading(false);
      }
  }
  useEffect(() => {
    loadCategory();
  }, [])


  // Add a new category
  const addCategory = (categoryData: Omit<Category, 'id' | 'itemCount'>) => {
    const newId = (Math.max(...categories.map(c => parseInt(c.id))) + 1).toString();
    setCategories([...categories, { id: newId, itemCount: 0, ...categoryData }]);
  };

  // Toggle category active status
  const toggleCategoryStatus = (categoryId: string) => {
    setCategories(prev => 
      prev.map(category => 
        category.id === categoryId ? { ...category, isActive: !category.isActive } : category
      )
    );
    
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      toast({
        title: category.isActive ? "Category Deactivated" : "Category Activated",
        description: `"${category.name}" has been ${category.isActive ? 'deactivated' : 'activated'}.`
      });
    }
  };

  // Filter and sort categories
  const filteredCategories = categories
    .filter(category => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(category => !typeFilter || category.type === typeFilter || (typeFilter === 'both' && category.type === 'both'))
    .sort((a, b) => {
      const aVal = a[sortBy as keyof Category];
      const bVal = b[sortBy as keyof Category];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' 
          ? aVal - bVal 
          : bVal - aVal;
      }
      
      if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        return sortDirection === 'asc' 
          ? Number(aVal) - Number(bVal) 
          : Number(bVal) - Number(aVal);
      }
      
      return 0;
    });

  // Toggle sort direction or change sort field
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="flex min-h-screen">
      <SideNavigation />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 py-6 px-6 bg-background">
          <div className="max-w-6xl mx-auto fade-in">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-display font-bold">Categories</h1>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-grid"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                  )}
                </Button>
                <NewCategoryDialog onAdd={addCategory} />
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search categories..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-3">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      {typeFilter ? (
                        typeFilter === 'app' ? "Apps Only" : 
                        typeFilter === 'url' ? "URLs Only" : "Both"
                      ) : "All Types"}
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Types">All Types</SelectItem>
                    <SelectItem value="app">Apps Only</SelectItem>
                    <SelectItem value="url">URLs Only</SelectItem>
                    <SelectItem value="both">Both Apps & URLs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No categories found matching your criteria
                  </div>
                ) : (
                  filteredCategories.map(category => (
                    <CategoryCard key={category.id} category={category} />
                  ))
                )}
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">Color</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                        <div className="flex items-center gap-1">
                          Name
                          {sortBy === 'name' && (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>
                        <div className="flex items-center gap-1">
                          Type
                          {sortBy === 'type' && (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('itemCount')}>
                        <div className="flex items-center gap-1">
                          Items
                          {sortBy === 'itemCount' && (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('isActive')}>
                        <div className="flex items-center gap-1">
                          Status
                          {sortBy === 'isActive' && (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No categories found matching your criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCategories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell>
                            <div 
                              className="h-8 w-8 rounded-md"
                              style={{ backgroundColor: stringToColor(category.name) }}
                            ></div>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div>
                              {category.name}
                              <div className="text-xs text-muted-foreground mt-1">{category.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {category.type === 'app' ? 'Apps Only' : 
                             category.type === 'url' ? 'URLs Only' : 'Apps & URLs'}
                          </TableCell>
                          <TableCell>{category.itemCount}</TableCell>
                          <TableCell>
                            <div className={`inline-block px-2 py-1 rounded-full text-xs ${
                              category.isActive 
                                ? 'bg-green-500/10 text-green-500' 
                                : 'bg-destructive/10 text-destructive'
                            }`}>
                              {category.isActive ? 'Active' : 'Inactive'}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant={category.isActive ? "destructive" : "outline"} 
                                size="sm"
                                onClick={() => toggleCategoryStatus(category.id)}
                              >
                                {category.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/categories/${base64UrlEncode(category.id)}`}>
                                  <ExternalLink className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Categories;
