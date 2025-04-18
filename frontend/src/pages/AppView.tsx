import React, { useState, useEffect } from 'react';
import { SideNavigation } from '@/components/layout/SideNavigation';
import { Header } from '@/components/Header';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, ExternalLink, Ban, Check, Activity, Clock, Calendar,
  Edit, Save, FileIcon, Info, BarChart, PieChart, Layers, Loader2
} from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { StatCard } from '@/components/ui/stat-card';
import {
  LineChart, Line, BarChart as RechartsBarChart, Bar,
  PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api, { Category as ApiCategory, GetAppResponse, SimpleSuccessResponse } from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';
import { base64UrlDecode } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { Switch } from '@/components/ui/switch';

// App interface for frontend state
interface App {
  id: string; // Base64 encoded AppId
  appId: string; // Original AppId
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
  internalName?: string;
  legalCopyright?: string;
  legalTrademarks?: string;
  originalFilename?: string;
  comments?: string;
  privateBuild?: string;
  specialBuild?: string;
  isBlocked: boolean;
  blockId?: number;
  dailyLimit?: string; // Need backend support for this
}

// Mock usage data for charts - Replace with real data later
const usageByActivityData = [
  { name: 'Research', value: 40 },
  { name: 'Development', value: 30 },
  { name: 'Communication', value: 15 },
  { name: 'Entertainment', value: 15 },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AppView = () => {
  const { appId: encodedAppId } = useParams<{ appId: string }>(); // Rename for clarity
  const navigate = useNavigate();

  const [app, setApp] = useState<App | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editableApp, setEditableApp] = useState<Partial<App>>({}); // Use Partial for editing
  const [activeTab, setActiveTab] = useState('overview');

  // State for fetched stats
  const [usageByDayData, setUsageByDayData] = useState<{ day: string, hours: number }[]>([]);
  const [weeklyAppUses, setWeeklyAppUses] = useState<{
    total_uses_this_week: number;
    total_uses_this_week_increase_percentage: number;
    avg_uses_this_week: number;
    avg_uses_this_week_increase_percentage: number;
  } | null>(null);
  const [usageByHourData, setUsageByHourData] = useState<{ hour: string, minutes: number }[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]); // Use ApiCategory type

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false); // State for save button

  const appId = encodedAppId ? base64UrlDecode(encodedAppId) : null; // Decode the ID

  const loadAppData = async () => {
    if (!appId) {
      setError("Invalid App ID.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Fetch app details and categories in parallel
      const [appDetailRes, categoriesRes] = await Promise.all([
        api.post<GetAppResponse>(`/apps/get_detail`, { id: appId }),
        api.get<ApiCategory[]>('/categories')
      ]);

      const data = appDetailRes.data;
      const mappedApp: App = {
        id: encodedAppId!, // Use encoded ID for consistency in frontend routing
        appId: data.app.AppId,
        name: data.app.ProductName || data.app.AppId,
        exeFileName: data.app.ExeFileName,
        exeDirName: data.app.ExeDirName,
        isBrowser: data.app.IsBrowser,
        icon: `${API_BASE_URL}/static/icons/${data.app.ICON}`,
        companyName: data.app.CompanyName,
        productName: data.app.ProductName,
        fileVersion: data.app.FileVersion,
        productVersion: data.app.ProductVersion,
        fileDescription: data.app.FileDescription,
        internalName: data.app.InternalName,
        legalCopyright: data.app.LegalCopyright,
        legalTrademarks: data.app.LegalTrademarks,
        originalFilename: data.app.OriginalFilename,
        comments: data.app.Comments,
        privateBuild: data.app.PrivateBuild,
        specialBuild: data.app.SpecialBuild,
        isBlocked: data.app.BlockId !== null,
        blockId: data.app.BlockId,
        category: data.app.Category,
        // dailyLimit: data.app.DailyLimit // Add if backend provides this
      };
      setApp(mappedApp);
      setEditableApp(mappedApp); // Initialize editable state

      // Set stats
      setWeeklyAppUses({
        total_uses_this_week: data.total_uses_this_week,
        total_uses_this_week_increase_percentage: data.total_uses_this_week_increase_percentage,
        avg_uses_this_week: data.avg_uses_this_week,
        avg_uses_this_week_increase_percentage: data.avg_uses_this_week_increase_percentage
      });
      setUsageByDayData([
        { day: 'Mon', hours: Math.round(data.Mon * 100) / 100 },
        { day: 'Tue', hours: Math.round(data.Tue * 100) / 100 },
        { day: 'Wed', hours: Math.round(data.Wed * 100) / 100 },
        { day: 'Thu', hours: Math.round(data.Thu * 100) / 100 },
        { day: 'Fri', hours: Math.round(data.Fri * 100) / 100 },
        { day: 'Sat', hours: Math.round(data.Sat * 100) / 100 },
        { day: 'Sun', hours: Math.round(data.Sun * 100) / 100 },
      ]);
      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
          hour: `${i.toString().padStart(2, '0')}:00`,
          // minutes: Math.round(data[`hour_${i}` as keyof GetAppResponse] * 60 * 100) / 100
          minutes: Math.round(data[`hour_${i}`] * 60 * 100) / 100
      }));
      setUsageByHourData(hourlyData);

      // Set categories
      setCategories(categoriesRes.data);

    } catch (e) {
      console.error('Error fetching app details:', e);
      setError('Failed to load application details.');
      toast({ title: "Error", description: "Could not fetch app data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppData();
  }, [appId]); // Reload if appId changes

  const handleSaveChanges = async () => {
    if (!editableApp || !app || isSaving) return;
    setIsSaving(true);
    let changesMade = false;

    try {
      // --- Save Category ---
      if (editableApp.category !== app.category) {
        changesMade = true;
        await api.post(`/categories/app`, {
          AppId: app.appId, // Use original AppId
          Category: editableApp.category === 'Uncategorized' ? null : editableApp.category
        });
      }

      // --- Save Block Status ---
      if (editableApp.isBlocked !== app.isBlocked) {
        changesMade = true;
        await api.put<SimpleSuccessResponse>(`/apps/${app.appId}/block`, { block: !!editableApp.isBlocked });
      }

      // --- Save Daily Limit (Needs Backend Endpoint) ---
      if (editableApp.dailyLimit !== app.dailyLimit) {
          changesMade = true;
          console.warn("Backend endpoint for setting daily limit is missing.");
          // Example API Call: await api.put(`/apps/${app.appId}/limit`, { limit: editableApp.dailyLimit });
      }

      // Update local state only after ALL successful saves (or handle partial success)
      setApp(prev => ({ ...prev!, ...editableApp }));
      setIsEditing(false);

      if (changesMade) {
        toast({
          title: "Changes saved",
          description: `"${app.name}" has been updated successfully.`
        });
      } else {
          toast({
              title: "No Changes",
              description: "No modifications were made."
          })
      }
    } catch (e: any) {
      console.error('Error saving changes:', e);
      const errorMsg = e.response?.data?.detail || "Failed to save some changes.";
      toast({ title: "Error", description: errorMsg, variant: "destructive" });
       // Decide if you want to revert editableApp state here
       // setEditableApp({...app});
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
      setEditableApp(app ? { ...app } : {}); // Reset editable state to original app data
      setIsEditing(false);
  }

  // Simplified loading state
  if (loading) {
    return (
      <div className="flex min-h-screen">
        <SideNavigation />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 py-6 px-6 bg-background flex items-center justify-center">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </main>
        </div>
      </div>
    );
  }

  // Error state
   if (error || !app) {
    return (
      <div className="flex min-h-screen">
        <SideNavigation />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 py-6 px-6 bg-background flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">{error ? "Error Loading App" : "App Not Found"}</h1>
              <p className="text-muted-foreground mb-6">{error || "The application you're looking for doesn't exist or could not be loaded."}</p>
              <Button onClick={() => navigate('/apps')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Apps
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Render the component content
  return (
    <div className="flex min-h-screen">
      <SideNavigation />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 py-6 px-6 bg-background">
          <div className="max-w-6xl mx-auto fade-in">
            {/* Header Section */}
            <div className="flex items-center gap-3 mb-6">
              <Button variant="outline" size="icon" onClick={() => navigate('/apps')} className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <img src={app.icon} alt={`${app.name} icon`} className="h-10 w-10 object-contain" />
              <div className="flex-1">
                <h1 className="text-2xl font-display font-bold">{app.name}</h1>
                <p className="text-sm text-muted-foreground truncate">{app.fileDescription || app.exeFileName}</p>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveChanges} disabled={isSaving || !isEditing}>
                      {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => {setEditableApp({...app}); setIsEditing(true);}}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Total Usage"
                value={`${weeklyAppUses?.total_uses_this_week?.toFixed(1) ?? '-'}h`}
                description="This week"
                icon={<Clock />}
                trend={weeklyAppUses ? { value: weeklyAppUses.total_uses_this_week_increase_percentage, positive: weeklyAppUses.total_uses_this_week_increase_percentage >= 0 } : undefined}
              />
              <StatCard
                title="Avg Daily Usage"
                value={`${weeklyAppUses?.avg_uses_this_week?.toFixed(1) ?? '-'}h`}
                description="This week"
                icon={<Calendar />}
                 trend={weeklyAppUses ? { value: weeklyAppUses.avg_uses_this_week_increase_percentage, positive: weeklyAppUses.avg_uses_this_week_increase_percentage >= 0 } : undefined}
              />
              <StatCard
                title="Status"
                value={app.isBlocked ? "Blocked" : "Allowed"}
                description={app.dailyLimit ? `Limit: ${app.dailyLimit}` : "No limit"}
                icon={app.isBlocked ? <Ban /> : <Check />}
              />
               {/* Replace Mock Data */}
               <StatCard
                title="Top Activity"
                value={usageByActivityData[0]?.name ?? 'N/A'}
                description={`${usageByActivityData[0]?.value ?? 0}% of time`}
                icon={<Activity />}
              />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

               {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                 <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">App Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {isEditing ? (
                           <div className="space-y-1.5">
                             <Label htmlFor="category">Category</Label>
                             <Select
                               value={editableApp?.category || 'Uncategorized'}
                               onValueChange={(value) => setEditableApp(prev => ({...prev, category: value === 'Uncategorized' ? undefined : value}))}
                             >
                               <SelectTrigger id="category"> <SelectValue placeholder="Select category" /> </SelectTrigger>
                               <SelectContent>
                                 <SelectItem value="Uncategorized">Uncategorized</SelectItem>
                                 {categories.map((cat) => ( <SelectItem key={cat.Category} value={cat.Category}>{cat.Category}</SelectItem> ))}
                               </SelectContent>
                             </Select>
                           </div>
                         ) : (
                           <div> <Label>Category</Label> <p className="text-sm mt-1">{app.category || 'Uncategorized'}</p> </div>
                         )}
                          <div> <Label>Location</Label> <p className="text-sm mt-1 truncate">{app.exeDirName}</p> </div>
                          <div> <Label>Version</Label> <p className="text-sm mt-1">{app.fileVersion || 'N/A'}</p> </div>
                          <div> <Label>Company</Label> <p className="text-sm mt-1">{app.companyName || 'N/A'}</p> </div>
                           <div> <Label>Product Name</Label> <p className="text-sm mt-1">{app.productName || 'N/A'}</p> </div>
                            <div> <Label>Browser?</Label> <p className="text-sm mt-1">{app.isBrowser ? 'Yes' : 'No'}</p> </div>
                     </div>
                  </CardContent>
                 </Card>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {/* Usage This Week Chart */}
                     <Card>
                       <CardHeader className="pb-2"> <CardTitle className="text-base font-medium">Usage This Week (Hours)</CardTitle> </CardHeader>
                       <CardContent className="h-72">
                         <ResponsiveContainer width="100%" height="100%">
                           <RechartsBarChart data={usageByDayData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} />
                             <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false}/>
                             <YAxis fontSize={12} tickLine={false} axisLine={false} unit="h"/>
                             <Tooltip contentStyle={{ fontSize: '12px', padding: '4px 8px' }}/>
                             <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}/>
                           </RechartsBarChart>
                         </ResponsiveContainer>
                       </CardContent>
                     </Card>
                      {/* Usage by Activity Chart (Replace Mock Data) */}
                      <Card>
                       <CardHeader className="pb-2"> <CardTitle className="text-base font-medium">Usage by Activity Type</CardTitle> </CardHeader>
                       <CardContent className="h-72">
                           <ResponsiveContainer width="100%" height="100%">
                             <RechartsPieChart>
                               <Pie data={usageByActivityData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                                 {usageByActivityData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
                               </Pie>
                               <Tooltip contentStyle={{ fontSize: '12px', padding: '4px 8px' }}/>
                               <Legend wrapperStyle={{ fontSize: '12px' }}/>
                             </RechartsPieChart>
                           </ResponsiveContainer>
                         </CardContent>
                      </Card>
                 </div>
              </TabsContent>

               {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                 <div className="grid grid-cols-1 gap-6">
                     {/* Hourly Usage Chart */}
                     <Card>
                       <CardHeader className="pb-2"> <CardTitle className="text-lg font-medium">Average Usage by Hour (Minutes)</CardTitle> </CardHeader>
                       <CardContent className="h-96">
                           <ResponsiveContainer width="100%" height="100%">
                             <RechartsBarChart data={usageByHourData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                               <XAxis dataKey="hour" fontSize={12} tickLine={false} axisLine={false}/>
                               <YAxis fontSize={12} tickLine={false} axisLine={false} unit="m"/>
                               <Tooltip contentStyle={{ fontSize: '12px', padding: '4px 8px' }}/>
                               <Bar dataKey="minutes" fill="hsl(var(--primary) / 0.7)" radius={[4, 4, 0, 0]}/>
                             </RechartsBarChart>
                           </ResponsiveContainer>
                         </CardContent>
                     </Card>
                     {/* Daily Usage Trend Chart */}
                     <Card>
                       <CardHeader className="pb-2"> <CardTitle className="text-lg font-medium">Daily Usage Trend (Hours)</CardTitle> </CardHeader>
                       <CardContent className="h-96">
                           <ResponsiveContainer width="100%" height="100%">
                             <LineChart data={usageByDayData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                               <CartesianGrid strokeDasharray="3 3" />
                               <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false}/>
                               <YAxis fontSize={12} tickLine={false} axisLine={false} unit="h"/>
                               <Tooltip contentStyle={{ fontSize: '12px', padding: '4px 8px' }}/>
                               <Legend wrapperStyle={{ fontSize: '12px' }}/>
                               <Line type="monotone" dataKey="hours" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 6 }} />
                             </LineChart>
                           </ResponsiveContainer>
                         </CardContent>
                     </Card>
                 </div>
              </TabsContent>

               {/* Details Tab */}
              <TabsContent value="details" className="space-y-6">
                 {/* File Information Card */}
                 <Card>
                     <CardHeader className="pb-2"> <CardTitle className="text-lg font-medium">File Information</CardTitle> </CardHeader>
                     <CardContent>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                             <InfoItem label="Executable File" value={app.exeFileName} icon={<FileIcon/>}/>
                             <InfoItem label="Directory Path" value={app.exeDirName} truncate/>
                             <InfoItem label="Product Name" value={app.productName}/>
                             <InfoItem label="Company Name" value={app.companyName}/>
                             <InfoItem label="File Version" value={app.fileVersion}/>
                             <InfoItem label="Product Version" value={app.productVersion}/>
                             <InfoItem label="Internal Name" value={app.internalName}/>
                             <InfoItem label="Original Filename" value={app.originalFilename}/>
                             <InfoItem label="Legal Copyright" value={app.legalCopyright} fullWidth/>
                             <InfoItem label="Legal Trademarks" value={app.legalTrademarks} fullWidth/>
                             <InfoItem label="Comments" value={app.comments} fullWidth/>
                         </div>
                     </CardContent>
                 </Card>
                 {/* Blocking Settings Card */}
                 <Card>
                   <CardHeader className="pb-2"> <CardTitle className="text-lg font-medium">Blocking Settings</CardTitle> </CardHeader>
                   <CardContent>
                     {isEditing ? (
                           <div className="space-y-4">
                             <div className="flex items-center justify-between">
                               <Label htmlFor="isBlocked" className="flex flex-col space-y-1">
                                   <span>Block this application</span>
                                   <span className="font-normal leading-snug text-muted-foreground text-xs"> Prevent this app from running during focus sessions or permanently. </span>
                               </Label>
                               <Switch id="isBlocked" checked={!!editableApp?.isBlocked} onCheckedChange={(checked) => setEditableApp(prev => ({...prev, isBlocked: checked}))} />
                             </div>
                             {/* Daily Limit Input (Needs Backend) */}
                             <div className="space-y-1.5">
                               <Label htmlFor="dailyLimit">Daily time limit (optional)</Label>
                               <Input id="dailyLimit" type="time" value={editableApp?.dailyLimit || ''} onChange={(e) => setEditableApp(prev => ({...prev, dailyLimit: e.target.value}))} className="w-32" disabled={!!editableApp?.isBlocked} />
                               <p className="text-xs text-muted-foreground"> Format: HH:MM (e.g., 01:30 for 1 hour 30 mins). Only active if app is not fully blocked. </p>
                             </div>
                           </div>
                         ) : (
                           <div className="space-y-3">
                             <div> <Label>Block Status</Label> <p className={`text-sm mt-1 flex items-center gap-1.5 ${app.isBlocked ? 'text-destructive' : 'text-green-600'}`}> {app.isBlocked ? <><Ban className="h-4 w-4"/>Blocked</> : <><Check className="h-4 w-4"/>Allowed</>} </p> </div>
                             {app.dailyLimit && !app.isBlocked && ( <div> <Label>Daily Time Limit</Label> <p className="text-sm mt-1 flex items-center gap-1.5"> <Clock className="h-4 w-4"/> {app.dailyLimit} </p> </div> )}
                             <p className="text-xs text-muted-foreground"> {app.isBlocked ? 'This app is currently blocked.' : app.dailyLimit ? 'This app has a daily time limit.' : 'No restrictions applied.'} </p>
                           </div>
                         )}
                   </CardContent>
                 </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

// Helper component for displaying info items
const InfoItem = ({ label, value, icon, truncate = false, fullWidth = false }: { label: string; value?: string | null; icon?: React.ReactNode; truncate?: boolean, fullWidth?: boolean }) => {
  if (!value) return null;
  return (
    <div className={fullWidth ? "md:col-span-2" : ""}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <p className={`text-sm mt-0.5 flex items-center gap-1.5 ${truncate ? 'truncate' : ''}`}>
        {icon}
        {value}
      </p>
    </div>
  );
};


export default AppView;