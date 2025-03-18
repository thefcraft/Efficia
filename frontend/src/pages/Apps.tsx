
import React, { useEffect, useState } from 'react';
import { SideNavigation } from '@/components/layout/SideNavigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, ArrowUpDown, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import api, { AppResponse, Category } from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';

// App interface based on the provided database schema
interface App {
  id: string;
  name: string;
  exeFileName: string;
  exeDirName: string;
  isBrowser: boolean;
  icon: string;
  category?: string;
  companyName?: string;
  productName?: string;
  fileVersion?: string;
  productVersion?: string;
  fileDescription?: string;
  isBlocked: boolean;
}

// Mock data for the apps - in a real app, this would come from a database
const mockApps: App[] = [
  {
    id: '1',
    name: 'Chrome',
    exeFileName: 'chrome.exe',
    exeDirName: 'C:\\Program Files\\Google\\Chrome\\Application',
    isBrowser: true,
    icon: 'C',
    category: 'Web Browser',
    companyName: 'Google LLC',
    productName: 'Google Chrome',
    fileVersion: '119.0.6045.160',
    productVersion: '119.0.6045.160',
    fileDescription: 'Google Chrome Web Browser',
    isBlocked: false
  },
  {
    id: '2',
    name: 'Firefox',
    exeFileName: 'firefox.exe',
    exeDirName: 'C:\\Program Files\\Mozilla Firefox',
    isBrowser: true,
    icon: 'F',
    category: 'Web Browser',
    companyName: 'Mozilla Corporation',
    productName: 'Mozilla Firefox',
    fileVersion: '119.0',
    productVersion: '119.0',
    fileDescription: 'Mozilla Firefox Web Browser',
    isBlocked: true
  },
  {
    id: '3',
    name: 'Visual Studio Code',
    exeFileName: 'Code.exe',
    exeDirName: 'C:\\Program Files\\Microsoft VS Code',
    isBrowser: false,
    icon: 'V',
    category: 'Development Tools',
    companyName: 'Microsoft Corporation',
    productName: 'Visual Studio Code',
    fileVersion: '1.83.1',
    productVersion: '1.83.1',
    fileDescription: 'Code Editing. Redefined.',
    isBlocked: false
  },
  {
    id: '4',
    name: 'Discord',
    exeFileName: 'Discord.exe',
    exeDirName: 'C:\\Users\\AppData\\Local\\Discord',
    isBrowser: false,
    icon: 'D',
    category: 'Communication',
    companyName: 'Discord Inc.',
    productName: 'Discord',
    fileVersion: '1.0.9005',
    productVersion: '1.0.9005',
    fileDescription: 'Discord - Chat for Gamers',
    isBlocked: true
  },
  {
    id: '5',
    name: 'Steam',
    exeFileName: 'steam.exe',
    exeDirName: 'C:\\Program Files (x86)\\Steam',
    isBrowser: false,
    icon: 'S',
    category: 'Games',
    companyName: 'Valve Corporation',
    productName: 'Steam',
    fileVersion: '7.54.26.36',
    productVersion: '7.54.26.36',
    fileDescription: 'Steam Client Bootstrapper',
    isBlocked: false
  }
];

const Apps = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [apps, setApps] = useState<App[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const loadApps = async () => {
    if (loading) return;
    setLoading(true);
    try {
        const res = await api.get(`/apps`);
        const data = res.data; // You can map it to your ActivityEntry format here
        setApps(data.map((item: AppResponse) => ({
          id: `${item.id}`,
          name: item.AppId,
          exeFileName: item.ExeFileName,
          exeDirName: item.ExeDirName,
          isBrowser: item.IsBrowser,
          icon: `${API_BASE_URL}/static/icons/${item.ICON}`, // Add exeIcon if needed
          companyName: item.CompanyName,
          productName: item.ProductName,
          fileVersion: item.FileVersion,
          productVersion: item.ProductVersion,
          fileDescription: item.FileDescription,
          isBlocked: item.BlockId !== null,
          category: item.Category
        })));
        const resCategory = await api.get(`/categories`);
        const dataCategory: Category[] = resCategory.data;
        setCategories(dataCategory.map((category) => category.Category))
      } catch (e) {
        console.error('Error fetching activities:', e);
        alert('Error fetching activities');
      } finally {
        setLoading(false);
      }
  }
  useEffect(() => {
    loadApps();
  }, [])

  // Get unique categories from apps
//   const categories = Array.from(new Set(apps.map(app => app.category).filter(Boolean)));

  // Handle toggling block status
  const toggleBlockStatus = (appId: string) => {
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

  // Filter and sort apps
  const filteredApps = apps
    .filter(app => 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.exeFileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.fileDescription && app.fileDescription.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(app => !categoryFilter || categoryFilter === "All Categories" || app.category === categoryFilter)
    .sort((a, b) => {
      const aVal = a[sortBy as keyof App] || '';
      const bVal = b[sortBy as keyof App] || '';
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
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
              <h1 className="text-2xl font-display font-bold">Applications</h1>
              <Button className="rounded-full" asChild>
                <Link to="/blocks">Manage Blocks</Link>
              </Button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search applications..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-3">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      {categoryFilter || "All Categories"}
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Categories">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category || ""}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Icon</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-1">
                        Name
                        {sortBy === 'name' && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('category')}>
                      <div className="flex items-center gap-1">
                        Category
                        {sortBy === 'category' && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('exeFileName')}>
                      <div className="flex items-center gap-1">
                        File Name
                        {sortBy === 'exeFileName' && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('isBlocked')}>
                      <div className="flex items-center gap-1">
                        Status
                        {sortBy === 'isBlocked' && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApps.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No applications found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApps.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>
                          <img src={app.icon} alt="Executable Icon" className="h-8 w-8"/>
                        </TableCell>
                        <TableCell className="font-medium">{app.name}</TableCell>
                        <TableCell>{app.category || 'Uncategorized'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{app.exeFileName}</TableCell>
                        <TableCell>
                          <div className={`inline-block px-2 py-1 rounded-full text-xs ${
                            app.isBlocked 
                              ? 'bg-destructive/10 text-destructive' 
                              : 'bg-green-500/10 text-green-500'
                          }`}>
                            {app.isBlocked ? 'Blocked' : 'Allowed'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant={app.isBlocked ? "outline" : "destructive"} 
                              size="sm"
                              onClick={() => toggleBlockStatus(app.id)}
                            >
                              {app.isBlocked ? 'Unblock' : 'Block'}
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/apps/${app.id}`}>
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default Apps;
