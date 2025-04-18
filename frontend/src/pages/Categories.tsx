import React, { useEffect, useState, useMemo } from 'react';
import { SideNavigation } from '@/components/layout/SideNavigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, ArrowUpDown, ExternalLink, Edit, Plus, X, Grid, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { base64UrlEncode, stringToColor } from '@/lib/utils';
import api, { Category as ApiCategory } from '@/lib/api'; // Use ApiCategory
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { Loader2 } from 'lucide-react';

// Define the category interface for frontend state
interface Category {
  id: string; // Category name itself is the ID from backend
  name: string;
  description: string; // Maybe add later if needed
  itemCount: number;
  type: 'app' | 'url' | 'both'; // Backend doesn't specify, assume 'both' for now
  isActive: boolean; // Backend doesn't specify, add later if needed
  color: string; // Generated from name
  blockId?: number; // From backend
  timestamp: string; // From backend
}

// New Category Dialog Component
const NewCategoryDialog = ({ onAdd }: { onAdd: (category: Category) => void }) => { // Pass the full Category object
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !name.trim()) {
      if (!name.trim()) {
          toast({ title: "Error", description: "Category name is required", variant: "destructive" });
      }
      return;
    }
    setLoading(true);
    try {
      const res = await api.post<ApiCategory>(`/categories`, {
        Category: name.trim(),
        BlockId: null // Assuming new categories don't have blocks initially
      });
      const data = res.data;
      // Map backend response to frontend Category type
      const newCategory: Category = {
        id: data.Category,
        name: data.Category,
        description: "", // Add if backend supports
        itemCount: data.itemCount ?? 0, // Use itemCount from response if available
        type: "both", // Assume 'both' initially
        isActive: true, // Assume active initially
        color: stringToColor(data.Category),
        blockId: data.BlockId,
        timestamp: data.Timestamp
      };
      onAdd(newCategory); // Pass the mapped object
      setName('');
      setOpen(false); // Close dialog on success
      toast({
        title: "Category Added",
        description: `"${data.Category}" has been added.`
      });
    } catch (e: any) {
      console.error('Error adding category:', e);
      const errorMsg = e.response?.data?.detail || "Failed to add category. It might already exist.";
      toast({ title: "Error", description: errorMsg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9 gap-1"> <Plus className="h-4 w-4" /> Add Category </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader> <DialogTitle>Create a New Category</DialogTitle> </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Category Name</Label>
            <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter category name" required />
          </div>
          <div className="space-y-1.5">
            <Label>Preview Color</Label>
            <div className="h-8 rounded-md border" style={{ backgroundColor: stringToColor(name) }} />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}> Cancel </Button>
            <Button type="submit" disabled={loading}> {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Plus className="h-4 w-4 mr-2" />} Create </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Category card component
const CategoryCard = ({ category }: { category: Category }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-2" style={{ backgroundColor: category.color }}></div>
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium">{category.name}</h3>
          <Button variant="ghost" size="icon" className="h-7 w-7 -mr-2 -mt-1" asChild>
             <Link to={`/categories/${base64UrlEncode(category.id)}`}><ExternalLink className="h-4 w-4 text-muted-foreground" /></Link>
          </Button>
          {/* Add Edit button later */}
        </div>
        {/* <p className="text-sm text-muted-foreground mt-1 h-8 line-clamp-2">{category.description || "No description"}</p> */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline" className="text-xs font-normal"> {category.itemCount} items </Badge>
          {/* <Badge variant="secondary" className="text-xs font-normal"> {category.type === 'app' ? "Apps Only" : category.type === 'url' ? "URLs Only" : "Apps & URLs"} </Badge> */}
          {/* {!category.isActive && <Badge variant="destructive" className="text-xs">Inactive</Badge>} */}
        </div>
      </CardContent>
    </Card>
  );
};

const Categories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  // const [typeFilter, setTypeFilter] = useState<string>(''); // Backend doesn't support type yet
  const [sortBy, setSortBy] = useState<keyof Category>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiCategory[]>('/categories');
      setCategories(res.data.map(item => ({
        id: item.Category,
        name: item.Category,
        description: "", // Add if supported later
        itemCount: item.itemCount ?? 0,
        type: 'both', // Assume both until specified
        isActive: true, // Assume active until specified
        color: stringToColor(item.Category),
        blockId: item.BlockId,
        timestamp: item.Timestamp
      })));
    } catch (e) {
      console.error('Error fetching categories:', e);
      setError("Failed to load categories.");
      toast({ title: "Error", description: "Could not fetch categories.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Add a new category to the state
  const addCategory = (newCategory: Category) => {
    setCategories(prev => [newCategory, ...prev]); // Add to the beginning
  };

  // --- BACKEND REQUIRED for toggleCategoryStatus ---
  const toggleCategoryStatus = (categoryId: string) => {
     console.warn("Backend endpoint for activating/deactivating categories is missing.");
    // Optimistic update:
    setCategories(prev =>
      prev.map(category =>
        category.id === categoryId ? { ...category, isActive: !category.isActive } : category
      )
    );
     const category = categories.find(c => c.id === categoryId);
     if (category) {
      toast({
        title: category.isActive ? "Category Deactivated (Locally)" : "Category Activated (Locally)",
        description: `"${category.name}" status changed. Backend update needed.`
      });
    }
    // API Call Example: await api.put(`/categories/${categoryId}/status`, { active: !category.isActive });
  };

  // Filter and sort categories (Client-side)
  const filteredAndSortedCategories = useMemo(() => {
      return categories
      .filter(category => category.name.toLowerCase().includes(searchTerm.toLowerCase()))
       // Add type filter here if backend supports it later
      .sort((a, b) => {
          const aVal = a[sortBy];
          const bVal = b[sortBy];

          if (typeof aVal === 'string' && typeof bVal === 'string') {
             return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
          }
          if (typeof aVal === 'number' && typeof bVal === 'number') {
             return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
          }
           if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
             return sortDirection === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
          }
          return 0;
      });
  }, [categories, searchTerm, sortBy, sortDirection]); // Removed typeFilter

  // Toggle sort direction or change sort field
  const handleSort = (field: keyof Category) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

   const renderListSkeletons = (count = 5) => (
     Array.from({ length: count }).map((_, index) => (
        <TableRow key={`skeleton-list-${index}`}>
           <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
           <TableCell><Skeleton className="h-4 w-32 mb-1" /><Skeleton className="h-3 w-48" /></TableCell>
           {/* <TableCell><Skeleton className="h-4 w-20" /></TableCell> */}
           <TableCell><Skeleton className="h-4 w-12" /></TableCell>
           {/* <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell> */}
           <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
        </TableRow>
     ))
  );

   const renderGridSkeletons = (count = 6) => (
     Array.from({ length: count }).map((_, index) => (
        <Card key={`skeleton-grid-${index}`}>
            <Skeleton className="h-2 w-full" />
            <CardContent className="pt-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                 <Skeleton className="h-3 w-2/3" />
                 <div className="flex gap-2 pt-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    {/* <Skeleton className="h-5 w-20 rounded-full" /> */}
                 </div>
            </CardContent>
        </Card>
     ))
  );


  return (
    <div className="flex min-h-screen">
      <SideNavigation />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 py-6 px-6 bg-background">
          <div className="max-w-6xl mx-auto fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                 <h1 className="text-2xl font-display font-bold">Categories</h1>
                 <p className="text-sm text-muted-foreground">Group your apps and websites for better organization and blocking.</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}> {viewMode === 'grid' ? <List className="h-4 w-4"/> : <Grid className="h-4 w-4"/>} </Button>
                <NewCategoryDialog onAdd={addCategory} />
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search categories..." className="pl-9 h-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              {/* Add Type Filter if needed later */}
               {/* <Select value={typeFilter} onValueChange={setTypeFilter}> ... </Select> */}
            </div>

            {error && <div className="text-red-500 text-center mb-4">{error}</div>}

             {/* Content Area */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {loading ? renderGridSkeletons() :
                    filteredAndSortedCategories.length === 0 ? (
                     <div className="col-span-full text-center py-12 text-muted-foreground"> No categories found. </div>
                 ) : (
                    filteredAndSortedCategories.map(category => ( <CategoryCard key={category.id} category={category} /> ))
                 )}
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Color</TableHead>
                      <TableHead><Button variant="ghost" className="px-0 h-auto font-medium text-xs hover:bg-transparent" onClick={() => handleSort('name')}> Name {sortBy === 'name' && <ArrowUpDown className="h-3 w-3 ml-1"/>}</Button></TableHead>
                      {/* <TableHead>Type</TableHead> */}
                      <TableHead><Button variant="ghost" className="px-0 h-auto font-medium text-xs hover:bg-transparent" onClick={() => handleSort('itemCount')}> Items {sortBy === 'itemCount' && <ArrowUpDown className="h-3 w-3 ml-1"/>}</Button></TableHead>
                      {/* <TableHead>Status</TableHead> */}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? renderListSkeletons() :
                        filteredAndSortedCategories.length === 0 ? (
                          <TableRow> <TableCell colSpan={6} className="text-center py-8 text-muted-foreground"> No categories found. </TableCell> </TableRow>
                     ) : (
                        filteredAndSortedCategories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell> <div className="h-6 w-6 rounded-md" style={{ backgroundColor: category.color }}></div> </TableCell>
                            <TableCell className="font-medium text-sm"> {category.name} {/* <div className="text-xs text-muted-foreground mt-0.5">{category.description || "No description"}</div> */} </TableCell>
                            {/* <TableCell className="text-xs">{category.type === 'app' ? 'Apps' : category.type === 'url' ? 'URLs' : 'Both'}</TableCell> */}
                            <TableCell className="text-xs">{category.itemCount}</TableCell>
                            {/* <TableCell> <Badge variant={category.isActive ? 'default' : 'outline'} className="text-xs font-medium">{category.isActive ? 'Active' : 'Inactive'}</Badge> </TableCell> */}
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-0">
                                {/* <Button variant={category.isActive ? "outline" : "default"} size="sm" className="h-7 px-2 text-xs" onClick={() => toggleCategoryStatus(category.id)}> {category.isActive ? 'Deactivate' : 'Activate'} </Button> */}
                                <Button variant="ghost" size="icon" className="h-7 w-7" asChild> <Link to={`/categories/${base64UrlEncode(category.id)}`}> <ExternalLink className="h-4 w-4" /> </Link> </Button>
                                {/* Add Edit/Delete later */}
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