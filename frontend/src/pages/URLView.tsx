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
  Edit, Save, Globe, Info, BarChart, PieChart, Layers, Loader2, Link2
} from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { StatCard } from '@/components/ui/stat-card';
import {
  LineChart, Line, BarChart as RechartsBarChart, Bar,
  PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api, { Category as ApiCategory, GetBaseUrlResponse, BaseUrlResponse, SimpleSuccessResponse } from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';
import { base64UrlDecode } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageWithFallback } from '@/components/utils';
import { Switch } from '@/components/ui/switch';


// Interface for URL details specific to this view
interface URLDetail extends BaseUrlResponse {
    id: string; // Base64 encoded baseURL
    isBlocked: boolean; // Derived from BlockId
    dailyLimit?: string; // Needs backend support
}

// Mock data (replace with real fetch)
const usageByActivityData = [
  { name: 'Social Media', value: 40 },
  { name: 'News', value: 25 },
  { name: 'Shopping', value: 15 },
  { name: 'Research', value: 20 },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const URLView = () => {
  const { urlId: encodedUrlId } = useParams<{ urlId: string }>(); // Renamed
  const navigate = useNavigate();

  const [urlDetail, setUrlDetail] = useState<URLDetail | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editableUrlDetail, setEditableUrlDetail] = useState<Partial<URLDetail>>({});
  const [activeTab, setActiveTab] = useState('overview');

  // Stats state
  const [usageByDayData, setUsageByDayData] = useState<{ day: string, hours: number }[]>([]);
  const [weeklyUrlUses, setWeeklyUrlUses] = useState<{
    total_uses_this_week: number;
    total_uses_this_week_increase_percentage: number;
    avg_uses_this_week: number;
    avg_uses_this_week_increase_percentage: number;
  } | null>(null);
  const [usageByHourData, setUsageByHourData] = useState<{ hour: string, minutes: number }[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const baseURL = encodedUrlId ? base64UrlDecode(encodedUrlId) : null; // Decode the ID (which is the baseURL)

  const loadURLData = async () => {
    if (!baseURL) {
      setError("Invalid URL identifier.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [urlDetailRes, categoriesRes] = await Promise.all([
         api.post<GetBaseUrlResponse>(`/baseUrls/get_detail`, { id: baseURL }),
         api.get<ApiCategory[]>('/categories')
      ]);

      const data = urlDetailRes.data;
      const mappedURL: URLDetail = {
          ...data.baseurl, // Spread the baseurl object from the response
          id: encodedUrlId!, // Use encoded ID
          isBlocked: data.baseurl.BlockId !== null,
          // dailyLimit: data.baseurl.DailyLimit // Add if backend provides this
      };

      setUrlDetail(mappedURL);
      setEditableUrlDetail(mappedURL); // Initialize editable state

       // Set stats
      setWeeklyUrlUses({
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
          // minutes: Math.round(data[`hour_${i}` as keyof GetBaseUrlResponse] * 60 * 100) / 100
          minutes: Math.round(data[`hour_${i}`] * 60 * 100) / 100
      }));
      setUsageByHourData(hourlyData);

      setCategories(categoriesRes.data);

    } catch (e) {
      console.error('Error fetching URL details:', e);
      setError('Failed to load URL details.');
      toast({ title: "Error", description: "Could not fetch URL data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadURLData();
  }, [baseURL]); // Reload if baseURL changes

  const handleSaveChanges = async () => {
    if (!editableUrlDetail || !urlDetail || isSaving) return;
    setIsSaving(true);
    let changesMade = false;

    try {
        // --- Save Category ---
        if (editableUrlDetail.Category !== urlDetail.Category) {
             changesMade = true;
             await api.post(`/categories/url`, {
                 baseURL: urlDetail.baseURL,
                 Category: editableUrlDetail.Category === 'Uncategorized' ? null : editableUrlDetail.Category
             });
        }

        // --- Save Block Status ---
        if (editableUrlDetail.isBlocked !== urlDetail.isBlocked) {
            changesMade = true;
            await api.put<SimpleSuccessResponse>(`/urls/${encodeURIComponent(urlDetail.baseURL)}/block`, { block: !!editableUrlDetail.isBlocked });
        }

        // --- Save Daily Limit (Needs Backend) ---
        if (editableUrlDetail.dailyLimit !== urlDetail.dailyLimit) {
            changesMade = true;
            console.warn("Backend endpoint for setting URL daily limit is missing.");
            // Example API: await api.put(`/urls/${urlDetail.baseURL}/limit`, { limit: editableUrlDetail.dailyLimit });
        }

        // --- Save Description (Needs Backend Update Endpoint) ---
         if (editableUrlDetail.Description !== urlDetail.Description) {
            changesMade = true;
             console.warn("Backend endpoint for updating URL description is missing.");
             // Example API: await api.put(`/urls/${urlDetail.baseURL}`, { Description: editableUrlDetail.Description });
        }

        // Update local state after ALL successful saves
        setUrlDetail(prev => ({ ...prev!, ...editableUrlDetail }));
        setIsEditing(false);

        if (changesMade) {
            toast({ title: "Changes saved", description: `"${urlDetail.Title || urlDetail.baseURL}" updated.` });
        } else {
             toast({ title: "No Changes", description: "No modifications were made." });
        }

    } catch (e: any) {
        console.error('Error saving URL changes:', e);
        const errorMsg = e.response?.data?.detail || "Failed to save some changes.";
        toast({ title: "Error", description: errorMsg, variant: "destructive" });
        // Optionally revert editableUrlDetail state here
    } finally {
        setIsSaving(false);
    }
 };


  const handleCancelEdit = () => {
      setEditableUrlDetail(urlDetail ? { ...urlDetail } : {});
      setIsEditing(false);
  }

  // Loading state
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

  // Error or not found state
  if (error || !urlDetail) {
    return (
      <div className="flex min-h-screen">
        <SideNavigation />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 py-6 px-6 bg-background flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">{error ? "Error Loading URL" : "URL Not Found"}</h1>
              <p className="text-muted-foreground mb-6">{error || "The URL you're looking for doesn't exist or could not be loaded."}</p>
              <Button onClick={() => navigate('/urls')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to URLs
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }


  // Render URL View
  return (
    <div className="flex min-h-screen">
      <SideNavigation />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 py-6 px-6 bg-background">
          <div className="max-w-6xl mx-auto fade-in">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <Button variant="outline" size="icon" onClick={() => navigate('/urls')} className="h-8 w-8"> <ArrowLeft className="h-4 w-4" /> </Button>
              <ImageWithFallback src={urlDetail.icon_url} fallbackSrc={'http://localhost:8080/null_url.png'} alt="URL icon" className="h-10 w-10 object-contain rounded-sm" />
              <div className="flex-1">
                <h1 className="text-xl font-display font-bold">{urlDetail.Title || urlDetail.baseURL}</h1>
                <a href={`https://${urlDetail.baseURL}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">
                  {urlDetail.baseURL} <ExternalLink className="inline-block h-3 w-3 ml-1" />
                </a>
                 {urlDetail.Description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{urlDetail.Description}</p>}
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>Cancel</Button>
                    <Button onClick={handleSaveChanges} disabled={isSaving || !isEditing}>
                         {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                         Save Changes
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => {setEditableUrlDetail({...urlDetail}); setIsEditing(true);}}> <Edit className="h-4 w-4 mr-1" /> Edit </Button>
                )}
              </div>
            </div>

            {/* Stats */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                 <StatCard title="Total Visits" value={`${urlDetail.visitCount ?? '-'}`} description="This week" icon={<Activity />} />
                 <StatCard title="Avg Daily Usage" value={`${weeklyUrlUses?.avg_uses_this_week?.toFixed(1) ?? '-'}h`} description="This week" icon={<Calendar />} trend={weeklyUrlUses ? { value: weeklyUrlUses.avg_uses_this_week_increase_percentage, positive: weeklyUrlUses.avg_uses_this_week_increase_percentage >= 0 } : undefined}/>
                 <StatCard title="Status" value={urlDetail.isBlocked ? "Blocked" : "Allowed"} description={urlDetail.dailyLimit ? `Limit: ${urlDetail.dailyLimit}` : "No limit"} icon={urlDetail.isBlocked ? <Ban /> : <Check />} />
                 <StatCard title="Total Usage" value={`${weeklyUrlUses?.total_uses_this_week?.toFixed(1) ?? '-'}h`} description="This week" icon={<Clock />} trend={weeklyUrlUses ? { value: weeklyUrlUses.total_uses_this_week_increase_percentage, positive: weeklyUrlUses.total_uses_this_week_increase_percentage >= 0 } : undefined}/>
             </div>


             {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

               {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                  {/* URL Info Card */}
                  <Card>
                     <CardHeader className="pb-2"> <CardTitle className="text-lg font-medium">Website Information</CardTitle> </CardHeader>
                     <CardContent>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {/* Editable Category */}
                             {isEditing ? (
                                 <div className="space-y-1.5">
                                     <Label htmlFor="url-category">Category</Label>
                                     <Select value={editableUrlDetail?.Category || 'Uncategorized'} onValueChange={(value) => setEditableUrlDetail(prev => ({...prev, Category: value === 'Uncategorized' ? undefined : value}))}>
                                         <SelectTrigger id="url-category"><SelectValue placeholder="Select category" /></SelectTrigger>
                                         <SelectContent>
                                             <SelectItem value="Uncategorized">Uncategorized</SelectItem>
                                             {categories.map((cat) => <SelectItem key={cat.Category} value={cat.Category}>{cat.Category}</SelectItem>)}
                                         </SelectContent>
                                     </Select>
                                 </div>
                             ) : (
                                 <div> <Label>Category</Label> <p className="text-sm mt-1">{urlDetail.Category || 'Uncategorized'}</p> </div>
                             )}
                             {/* Visit Count */}
                             <div> <Label>Total Visits (All Time)</Label> <p className="text-sm mt-1">{urlDetail.visitCount ?? 'N/A'}</p> </div>
                              {/* Last Visited */}
                             <div> <Label>Last Visited</Label> <p className="text-sm mt-1">{urlDetail.lastVisited ? new Date(urlDetail.lastVisited).toLocaleString() : 'Never'}</p> </div>
                              {/* Description (Editable) */}
                             {isEditing ? (
                                <div className="space-y-1.5 md:col-span-2">
                                  <Label htmlFor="url-description">Description</Label>
                                  <Input id="url-description" value={editableUrlDetail?.Description || ''} onChange={(e) => setEditableUrlDetail(prev => ({...prev, Description: e.target.value}))} placeholder="Website description"/>
                                </div>
                              ) : urlDetail.Description ? (
                                <div className="md:col-span-2"> <Label>Description</Label> <p className="text-sm mt-1">{urlDetail.Description}</p> </div>
                              ) : null}

                         </div>
                     </CardContent>
                  </Card>
                   {/* Charts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Usage This Week */}
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
                       {/* Usage by Activity (Placeholder/Needs Real Data) */}
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
                       {/* Hourly Usage */}
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
                       {/* Daily Trend */}
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

              {/* Settings Tab */}
               <TabsContent value="settings" className="space-y-6">
                    <Card>
                      <CardHeader className="pb-2"> <CardTitle className="text-lg font-medium">Blocking Settings</CardTitle> </CardHeader>
                      <CardContent>
                         {isEditing ? (
                             <div className="space-y-4">
                                 <div className="flex items-center justify-between">
                                  <Label htmlFor="isBlocked-url" className="flex flex-col space-y-1">
                                      <span>Block this URL</span>
                                      <span className="font-normal leading-snug text-muted-foreground text-xs"> Prevent access during focus sessions or permanently. </span>
                                  </Label>
                                  <Switch id="isBlocked-url" checked={!!editableUrlDetail?.isBlocked} onCheckedChange={(checked) => setEditableUrlDetail(prev => ({...prev, isBlocked: checked}))} />
                                 </div>
                                 {/* Daily Limit Input */}
                                 <div className="space-y-1.5">
                                     <Label htmlFor="dailyLimit-url">Daily time limit (optional)</Label>
                                     <Input id="dailyLimit-url" type="time" value={editableUrlDetail?.dailyLimit || ''} onChange={(e) => setEditableUrlDetail(prev => ({...prev, dailyLimit: e.target.value}))} className="w-32" disabled={!!editableUrlDetail?.isBlocked} />
                                     <p className="text-xs text-muted-foreground"> Format: HH:MM. Only active if URL is not fully blocked. </p>
                                 </div>
                             </div>
                         ) : (
                             <div className="space-y-3">
                                 <div> <Label>Block Status</Label> <p className={`text-sm mt-1 flex items-center gap-1.5 ${urlDetail.isBlocked ? 'text-destructive' : 'text-green-600'}`}> {urlDetail.isBlocked ? <><Ban className="h-4 w-4"/>Blocked</> : <><Check className="h-4 w-4"/>Allowed</>} </p> </div>
                                 {urlDetail.dailyLimit && !urlDetail.isBlocked && ( <div> <Label>Daily Time Limit</Label> <p className="text-sm mt-1 flex items-center gap-1.5"> <Clock className="h-4 w-4"/> {urlDetail.dailyLimit} </p> </div> )}
                                 <p className="text-xs text-muted-foreground"> {urlDetail.isBlocked ? 'This URL is currently blocked.' : urlDetail.dailyLimit ? 'This URL has a daily time limit.' : 'No restrictions applied.'} </p>
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

export default URLView;