
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
  Edit, Save, FileIcon, Info, BarChart, PieChart, Layers
} from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { StatCard } from '@/components/ui/stat-card';
import { 
  LineChart, Line, BarChart as RechartsBarChart, Bar, 
  PieChart as RechartsPieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import api, { AppResponse, Category, GetAppResponse } from '@/lib/api';

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
  internalName?: string;
  legalCopyright?: string;
  legalTrademarks?: string;
  originalFilename?: string;
  comments?: string;
  privateBuild?: string;
  specialBuild?: string;
  isBlocked: boolean;
  dailyLimit?: string;
}

// Mock apps data - would come from a database in a real app
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
    internalName: 'Chrome',
    legalCopyright: '© Google LLC. All rights reserved.',
    legalTrademarks: 'Google Chrome™',
    originalFilename: 'chrome.exe',
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
    isBlocked: true,
    dailyLimit: '01:00'
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


// Mock usage data for charts

const usageByHourData = [
  { hour: '00:00', minutes: 15 },
  { hour: '01:00', minutes: 5 },
  { hour: '02:00', minutes: 0 },
  { hour: '03:00', minutes: 0 },
  { hour: '04:00', minutes: 0 },
  { hour: '05:00', minutes: 0 },
  { hour: '06:00', minutes: 0 },
  { hour: '07:00', minutes: 10 },
  { hour: '08:00', minutes: 30 },
  { hour: '09:00', minutes: 120 },
  { hour: '10:00', minutes: 85 },
  { hour: '11:00', minutes: 60 },
  { hour: '12:00', minutes: 45 },
  { hour: '13:00', minutes: 75 },
  { hour: '14:00', minutes: 90 },
  { hour: '15:00', minutes: 105 },
  { hour: '16:00', minutes: 70 },
  { hour: '17:00', minutes: 45 },
  { hour: '18:00', minutes: 20 },
  { hour: '19:00', minutes: 35 },
  { hour: '20:00', minutes: 50 },
  { hour: '21:00', minutes: 40 },
  { hour: '22:00', minutes: 25 },
  { hour: '23:00', minutes: 10 },
];

const usageByActivityData = [
  { name: 'Research', value: 40 },
  { name: 'Development', value: 30 },
  { name: 'Communication', value: 15 },
  { name: 'Entertainment', value: 15 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AppView = () => {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  
  const [app, setApp] = useState<App | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editableApp, setEditableApp] = useState<App | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [usageByDayData, setUsageByDayData] = useState<{day: string, hours: number}[]>([]);
  const [weeklyAppUses, setWeeklyAppUses] = useState<{
    total_uses_this_week: number
    total_uses_this_week_increase_percentage: number
    avg_uses_this_week: number
    avg_uses_this_week_increase_percentage: number
  } | null>(null)

  const [categories, setCategories] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  const loadApp = async () => {
    if (loading) return;
    setLoading(true);
    try {
        const res = await api.get(`/apps/${appId}`);
        const data: GetAppResponse = res.data; // You can map it to your ActivityEntry format here
        setApp({
          id: `${data.app.id}`,
          name: data.app.AppId,
          exeFileName: data.app.ExeFileName,
          exeDirName: data.app.ExeDirName,
          isBrowser: data.app.IsBrowser,
          icon: `http://localhost:8000/static/icons/${data.app.ICON}`, // Add exeIcon if needed
          companyName: data.app.CompanyName,
          productName: data.app.ProductName,
          fileVersion: data.app.FileVersion,
          productVersion: data.app.ProductVersion,
          fileDescription: data.app.FileDescription,
          isBlocked: data.app.BlockId !== null,
          category: data.app.Category
        });
        setEditableApp({
          id: `${data.app.id}`,
          name: data.app.AppId,
          exeFileName: data.app.ExeFileName,
          exeDirName: data.app.ExeDirName,
          isBrowser: data.app.IsBrowser,
          icon: `http://localhost:8000/static/icons/${data.app.ICON}`, // Add exeIcon if needed
          companyName: data.app.CompanyName,
          productName: data.app.ProductName,
          fileVersion: data.app.FileVersion,
          productVersion: data.app.ProductVersion,
          fileDescription: data.app.FileDescription,
          isBlocked: data.app.BlockId !== null,
          category: data.app.Category
        });
        setWeeklyAppUses({
          total_uses_this_week: data.total_uses_this_week,
          total_uses_this_week_increase_percentage: data.total_uses_this_week_increase_percentage,
          avg_uses_this_week: data.avg_uses_this_week,
          avg_uses_this_week_increase_percentage: data.avg_uses_this_week_increase_percentage
        })
        setUsageByDayData([
            { day: 'Mon', hours: Math.round(data.Mon * 100) / 100 },
            { day: 'Tue', hours: Math.round(data.Tue * 100) / 100 },
            { day: 'Wed', hours: Math.round(data.Wed * 100) / 100 },
            { day: 'Thu', hours: Math.round(data.Thu * 100) / 100 },
            { day: 'Fri', hours: Math.round(data.Fri * 100) / 100 },
            { day: 'Sat', hours: Math.round(data.Sat * 100) / 100 },
            { day: 'Sun', hours: Math.round(data.Sun * 100) / 100 },
          ])
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
    loadApp();
  }, [])

  // useEffect(() => {
  //   // In a real app, this would be an API call
  //   const foundApp = mockApps.find(a => a.id === appId);
  //   setApp(foundApp || null);
  //   setEditableApp(foundApp ? {...foundApp} : null);
  // }, [appId]);

  if (!app) {
    return (
      <div className="flex min-h-screen">
        <SideNavigation />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 py-6 px-6 bg-background flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">App Not Found</h1>
              <p className="text-muted-foreground mb-6">The application you're looking for doesn't exist or has been removed.</p>
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

  const handleSaveChanges = async () => {
    if (!editableApp) return;

    if (loading) return;
    setLoading(true);
    try {
        const res = await api.post(`/categories/app`, {
          AppId: app.name, // TODO app.name is AppId
          Category: editableApp.category === 'Uncategorized'?null:editableApp.category
        });
        const data: Category = res.data;

        // Here you would save changes to your database
        setApp(editableApp);
        setIsEditing(false);
          
        toast({
          title: "Changes saved",
          description: `The app "${editableApp.name}" has been updated successfully.`
        });
      } catch (e) {
        console.error('Error fetching activities:', e);
        alert('Error fetching activities');
      } finally {
        setLoading(false);
      }
  };

  const toggleBlockStatus = () => {
    const updatedApp = { ...app, isBlocked: !app.isBlocked };
    setApp(updatedApp);
    setEditableApp(updatedApp);
    
    toast({
      title: app.isBlocked ? "App Unblocked" : "App Blocked",
      description: `"${app.name}" has been ${app.isBlocked ? 'unblocked' : 'blocked'}.`
    });
  };

  return (
    <div className="flex min-h-screen">
      <SideNavigation />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 py-6 px-6 bg-background">
          <div className="max-w-6xl mx-auto fade-in">
            <div className="flex items-center gap-3 mb-6">
              <Button variant="outline" size="sm" onClick={() => navigate('/apps')}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl font-display font-bold">{app.name}</h1>
                <p className="text-muted-foreground">{app.fileDescription}</p>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveChanges}>
                      <Save className="h-4 w-4 mr-1" />
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant={app.isBlocked ? "outline" : "destructive"} 
                      onClick={toggleBlockStatus}
                    >
                      {app.isBlocked ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Unblock
                        </>
                      ) : (
                        <>
                          <Ban className="h-4 w-4 mr-1" />
                          Block
                        </>
                      )}
                    </Button>
                    <Button variant="default" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 mb-6 justify-evenly">
              <StatCard 
                title="Total Usage Time" 
                value={`${weeklyAppUses.total_uses_this_week.toFixed(2)} hours`}
                description="This week"
                icon={<Clock />}
                trend={{ value: weeklyAppUses.total_uses_this_week_increase_percentage, positive: weeklyAppUses.total_uses_this_week_increase_percentage>=0 }}
              />
              <StatCard 
                title="Average Daily Usage" 
                value={`${weeklyAppUses.avg_uses_this_week.toFixed(2)} hours`}
                description="This week"
                icon={<Calendar />}
                trend={{ value: weeklyAppUses.avg_uses_this_week_increase_percentage, positive: weeklyAppUses.avg_uses_this_week_increase_percentage>=0 }}
              />
              <StatCard 
                title="Status" 
                value={app.isBlocked ? "Blocked" : "Allowed"}
                description={app.dailyLimit ? `Daily limit: ${app.dailyLimit}` : "No time limit"}
                icon={app.isBlocked ? <Ban /> : <Check />}
              />
              <StatCard 
                title="Top Activity" 
                value="Research"
                description="40% of time spent"
                icon={<Activity />}
              />
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full md:w-auto grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">App Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row mb-4">
                      <div className="md:w-60 flex items-start gap-3 mb-4 md:mb-0">
                        <img src={app.icon} alt="Executable Icon" className="h-8 w-8"/>
                        <div>
                          <div className="font-medium">{app.exeFileName}</div>
                          <div className="text-sm text-muted-foreground">{app.category || 'Uncategorized'}</div>
                          {app.isBlocked && (
                            <div className="mt-1 text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive inline-block">
                              Blocked
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isEditing ? (
                          <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select 
                              value={editableApp?.category || ''} 
                              onValueChange={(value) => setEditableApp(prev => prev ? {...prev, category: value} : null)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='Uncategorized'>Uncategorized</SelectItem>
                                {categories.map((category) => (
                                  <SelectItem key={category} value={category}>{category}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm text-muted-foreground">Category</div>
                            <div>{app.category || 'Uncategorized'}</div>
                          </div>
                        )}
                        
                        <div>
                          <div className="text-sm text-muted-foreground">Location</div>
                          <div className="truncate">{app.exeDirName}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Version</div>
                          <div>{app.fileVersion || 'Unknown'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Company</div>
                          <div>{app.companyName || 'Unknown'}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">Usage This Week</CardTitle>
                    </CardHeader>
                    <CardContent className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart
                          data={usageByDayData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis unit="h" />
                          <Tooltip formatter={(value) => [`${value} hours`, 'Usage']} />
                          <Bar dataKey="hours" fill="#8884d8" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">Usage by Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={usageByActivityData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {usageByActivityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">Daily Usage Trends</CardTitle>
                    </CardHeader>
                    <CardContent className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={usageByDayData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis unit="h" />
                          <Tooltip formatter={(value) => [`${value} hours`, 'Usage']} />
                          <Legend />
                          <Line type="monotone" dataKey="hours" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">Usage by Hour of Day</CardTitle>
                    </CardHeader>
                    <CardContent className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart
                          data={usageByHourData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="hour" />
                          <YAxis unit="min" />
                          <Tooltip formatter={(value) => [`${value} minutes`, 'Usage']} />
                          <Bar dataKey="minutes" fill="#82ca9d" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">File Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                      <div>
                        <div className="text-sm text-muted-foreground">Executable File</div>
                        <div className="flex items-center gap-1">
                          <FileIcon className="h-4 w-4 text-muted-foreground" />
                          {app.exeFileName}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Directory Path</div>
                        <div className="truncate">{app.exeDirName}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Product Name</div>
                        <div>{app.productName || 'Unknown'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Company Name</div>
                        <div>{app.companyName || 'Unknown'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">File Version</div>
                        <div>{app.fileVersion || 'Unknown'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Product Version</div>
                        <div>{app.productVersion || 'Unknown'}</div>
                      </div>
                      {app.internalName && (
                        <div>
                          <div className="text-sm text-muted-foreground">Internal Name</div>
                          <div>{app.internalName}</div>
                        </div>
                      )}
                      {app.originalFilename && (
                        <div>
                          <div className="text-sm text-muted-foreground">Original Filename</div>
                          <div>{app.originalFilename}</div>
                        </div>
                      )}
                      {app.legalCopyright && (
                        <div>
                          <div className="text-sm text-muted-foreground">Legal Copyright</div>
                          <div>{app.legalCopyright}</div>
                        </div>
                      )}
                      {app.legalTrademarks && (
                        <div>
                          <div className="text-sm text-muted-foreground">Legal Trademarks</div>
                          <div>{app.legalTrademarks}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Blocking Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="isBlocked">Block this application</Label>
                          <div className="flex items-center gap-2">
                            <span>{editableApp?.isBlocked ? 'Yes' : 'No'}</span>
                            <Button 
                              variant={editableApp?.isBlocked ? "outline" : "destructive"} 
                              size="sm"
                              onClick={() => setEditableApp(prev => prev ? {...prev, isBlocked: !prev.isBlocked} : null)}
                            >
                              {editableApp?.isBlocked ? 'Unblock' : 'Block'}
                            </Button>
                          </div>
                        </div>
                        
                        {!editableApp?.isBlocked && (
                          <div className="space-y-2">
                            <Label htmlFor="dailyLimit">Daily time limit (optional)</Label>
                            <Input 
                              id="dailyLimit" 
                              type="time" 
                              value={editableApp?.dailyLimit || ''} 
                              onChange={(e) => setEditableApp(prev => prev ? {...prev, dailyLimit: e.target.value} : null)}
                              className="w-32"
                            />
                            <p className="text-xs text-muted-foreground">
                              Format: HH:MM (hours:minutes)
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Block Status</div>
                          <div className={`flex items-center gap-1 ${app.isBlocked ? 'text-destructive' : 'text-green-500'}`}>
                            {app.isBlocked ? (
                              <>
                                <Ban className="h-4 w-4" />
                                Blocked
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4" />
                                Allowed
                              </>
                            )}
                          </div>
                        </div>
                        
                        {!app.isBlocked && app.dailyLimit && (
                          <div>
                            <div className="text-sm text-muted-foreground">Daily Time Limit</div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {app.dailyLimit}
                            </div>
                          </div>
                        )}
                        
                        {app.isBlocked && (
                          <p className="text-sm text-muted-foreground">
                            This app is completely blocked. Users cannot access it at all.
                          </p>
                        )}
                        
                        {!app.isBlocked && !app.dailyLimit && (
                          <p className="text-sm text-muted-foreground">
                            This app has no restrictions. Consider adding a daily time limit.
                          </p>
                        )}
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

export default AppView;
