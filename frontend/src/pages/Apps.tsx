
import React, { useEffect, useState, useMemo } from 'react';
import { SideNavigation } from '@/components/layout/SideNavigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, ArrowUpDown, ExternalLink, Check, Ban, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import api, { AppResponse, Category as ApiCategory, SimpleSuccessResponse } from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';
import { base64UrlEncode } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

// App interface for frontend
interface App {
  id: string; // Base64 encoded AppId
  appId: string; // Original AppId
  name: string; // Use ProductName or AppId if missing
  exeFileName: string;
  exeDirName: string;
  isBrowser: boolean;
  icon: string; // Full URL to icon
  category?: string;
  companyName?: string;
  productName?: string;
  fileVersion?: string;
  productVersion?: string;
  fileDescription?: string;
  isBlocked: boolean; // Derived from BlockId
  blockId?: number;
}

const Apps = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All Categories'); // Default to All
  const [sortBy, setSortBy] = useState<keyof App>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [apps, setApps] = useState<App[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]); // Use ApiCategory type
  const [loading, setLoading] = useState<boolean>(true);
  const [blockingStatus, setBlockingStatus] = useState<Record<string, boolean>>({}); // Track loading state per app
  const [error, setError] = useState<string | null>(null);

  

  const loadAppsAndCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const [appsRes, categoriesRes] = await Promise.all([
        api.get<AppResponse[]>('/apps'),
        api.get<ApiCategory[]>('/categories') // Fetch categories
      ]);

      setApps(appsRes.data.map((item: AppResponse) => ({
        id: base64UrlEncode(item.AppId),
        appId: item.AppId,
        name: item.ProductName || item.AppId, // Fallback to AppId if ProductName is missing
        exeFileName: item.ExeFileName,
        exeDirName: item.ExeDirName,
        isBrowser: item.IsBrowser,
        icon: `${API_BASE_URL}/static/icons/${item.ICON}`,
        companyName: item.CompanyName,
        productName: item.ProductName,
        fileVersion: item.FileVersion,
        productVersion: item.ProductVersion,
        fileDescription: item.FileDescription,
        isBlocked: item.BlockId !== null,
        blockId: item.BlockId,
        category: item.Category
      })));
      setCategories(categoriesRes.data);
    } catch (e) {
      console.error('Error fetching data:', e);
      setError('Failed to load applications or categories.');
      toast({
        title: "Error",
        description: "Could not fetch data. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppsAndCategories();
  }, []);

  // Handle toggling block status
  const toggleBlockStatus = async (appToToggle: App) => {
    const originalStatus = appToToggle.isBlocked;
    const appID = appToToggle.appId; // Use original AppId for API call

    // Optimistic UI Update
    setApps(prevApps =>
      prevApps.map(app =>
        app.id === appToToggle.id ? { ...app, isBlocked: !originalStatus } : app
      )
    );
    setBlockingStatus(prev => ({ ...prev, [appID]: true })); // Set loading for this app

    try {
      const response = await api.put<SimpleSuccessResponse>(`/apps/${appID}/block`, { block: !originalStatus });
      toast({
        title: !originalStatus ? "App Blocked" : "App Unblocked",
        description: response.data.message || `"${appToToggle.name}" status updated.`
      });
      // State is already updated optimistically, no need to refetch unless necessary
    } catch (error: any) {
      console.error("Failed to toggle block status:", error);
      const errorMsg = error.response?.data?.detail || "Failed to update block status.";
      toast({ title: "Error", description: errorMsg, variant: "destructive" });
      // Rollback optimistic update on error
      setApps(prevApps =>
        prevApps.map(app =>
          app.id === appToToggle.id ? { ...app, isBlocked: originalStatus } : app
        )
      );
    } finally {
        setBlockingStatus(prev => ({ ...prev, [appID]: false })); // Reset loading for this app
    }
  };

  // Filter and sort apps (Client-side)
  const filteredAndSortedApps = useMemo(() => {
    return apps
      .filter(app =>
        (app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         app.exeFileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (app.fileDescription && app.fileDescription.toLowerCase().includes(searchTerm.toLowerCase())))
      )
      .filter(app => categoryFilter === 'All Categories' || app.category === categoryFilter)
      .sort((a, b) => {
        const aVal = a[sortBy] ?? '';
        const bVal = b[sortBy] ?? '';

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
         if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }

        return 0;
      });
  }, [apps, searchTerm, categoryFilter, sortBy, sortDirection]);

  // Toggle sort direction or change sort field
  const handleSort = (field: keyof App) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const renderSkeletons = (count = 5) => (
    Array.from({ length: count }).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-8 w-24" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <div className="flex min-h-screen">
      <SideNavigation />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 py-6 px-6 bg-background">
          <div className="max-w-6xl mx-auto fade-in">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-display font-bold">Applications</h1>
              {/* <Button className="rounded-full" asChild> <Link to="/blocks">Manage Blocks</Link> </Button> */}
              {/* Consider linking to settings or a dedicated block page if needed */}
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
                  <SelectTrigger className="w-full md:w-[180px]">
                    <div className="flex items-center gap-2 text-sm">
                      <Filter className="h-4 w-4" />
                      {categoryFilter}
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Categories">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.Category} value={category.Category}>
                        {category.Category}
                      </SelectItem>
                    ))}
                     <SelectItem value={undefined}>Uncategorized</SelectItem> {/* For apps without category */}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && <div className="text-red-500 text-center mb-4">{error}</div>}

            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Icon</TableHead>
                    <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                       <div className="flex items-center gap-1"> Name {sortBy === 'name' && <ArrowUpDown className="h-3 w-3" />}</div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('category')} className="cursor-pointer hidden md:table-cell">
                       <div className="flex items-center gap-1"> Category {sortBy === 'category' && <ArrowUpDown className="h-3 w-3" />}</div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('exeFileName')} className="cursor-pointer hidden lg:table-cell">
                       <div className="flex items-center gap-1"> File Name {sortBy === 'exeFileName' && <ArrowUpDown className="h-3 w-3" />}</div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('isBlocked')} className="cursor-pointer">
                       <div className="flex items-center gap-1"> Status {sortBy === 'isBlocked' && <ArrowUpDown className="h-3 w-3" />}</div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? renderSkeletons() :
                    filteredAndSortedApps.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No applications found matching your criteria
                        </TableCell>
                      </TableRow>
                  ) : (
                    filteredAndSortedApps.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>
                          <img src={app.icon} alt={`${app.name} icon`} className="h-8 w-8 min-w-8 min-h-8 object-contain" />
                        </TableCell>
                        <TableCell className="font-medium">{app.name}</TableCell>
                        <TableCell className="hidden md:table-cell">{app.category || 'Uncategorized'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">{app.exeFileName}</TableCell>
                        <TableCell>
                          <div className={`inline-block px-2 py-1 rounded-full text-xs ${
                            app.isBlocked
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-green-600/10 text-green-700' // Adjusted for better contrast
                          }`}>
                            {app.isBlocked ? 'Blocked' : 'Allowed'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-1 md:gap-2">
                              <Button
                                variant={app.isBlocked ? "outline" : "destructive"}
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); toggleBlockStatus(app); }}
                                className="text-xs px-2 h-7"
                                disabled={blockingStatus[app.appId]} // Disable button while loading
                              >
                                {blockingStatus[app.appId] ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  app.isBlocked ? <><Check className="h-3 w-3 md:mr-1"/> <span className='hidden md:inline'>Unblock</span></> : <><Ban className="h-3 w-3 md:mr-1"/> <span className='hidden md:inline'>Block</span></>
                                )}
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
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