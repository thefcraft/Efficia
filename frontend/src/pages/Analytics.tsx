
import React, { useState } from 'react';
import { SideNavigation } from '@/components/layout/SideNavigation';
import { Header } from '@/components/Header';
import {
  BarChart4,
  PieChart,
  AreaChart,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Ban,
  Target,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data for analytics
const dailyFocusData = [
  { day: 'Mon', hours: 6.5 },
  { day: 'Tue', hours: 5.2 },
  { day: 'Wed', hours: 7.1 },
  { day: 'Thu', hours: 4.5 },
  { day: 'Fri', hours: 6.8 },
  { day: 'Sat', hours: 3.2 },
  { day: 'Sun', hours: 2.5 },
];

const weeklyTrendData = [
  { week: 'Week 1', hours: 24.5 },
  { week: 'Week 2', hours: 28.2 },
  { week: 'Week 3', hours: 31.7 },
  { week: 'Week 4', hours: 35.5 },
];

const categoryData = [
  { name: 'Work', value: 45 },
  { name: 'Learning', value: 25 },
  { name: 'Personal', value: 15 },
  { name: 'Exercise', value: 10 },
  { name: 'Other', value: 5 },
];

const goalProgressData = [
  { name: 'Learn Python', progress: 65, target: 100 },
  { name: 'Finish Project', progress: 80, target: 100 },
  { name: 'Exercise Daily', progress: 90, target: 100 },
  { name: 'Read 10 Books', progress: 30, target: 100 },
];

const distractionData = [
  { day: 'Mon', count: 12 },
  { day: 'Tue', count: 8 },
  { day: 'Wed', count: 15 },
  { day: 'Thu', count: 10 },
  { day: 'Fri', count: 7 },
  { day: 'Sat', count: 4 },
  { day: 'Sun', count: 3 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD'];

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('week');
  
  return (
    <div className="flex min-h-screen">
      <SideNavigation />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 py-6 px-6 bg-background">
          <div className="max-w-6xl mx-auto fade-in">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-display font-bold">Analytics</h1>
              <div className="flex items-center gap-2">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Select Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Focus Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-2xl font-bold">35.8</div>
                      <p className="text-xs text-muted-foreground">hours this week</p>
                    </div>
                    <div className="flex items-center text-green-600 text-sm">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      <span>18%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Distractions Blocked</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-2xl font-bold">59</div>
                      <p className="text-xs text-muted-foreground">attempts blocked</p>
                    </div>
                    <div className="flex items-center text-green-600 text-sm">
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                      <span>12%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Session Length</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-2xl font-bold">68</div>
                      <p className="text-xs text-muted-foreground">minutes per session</p>
                    </div>
                    <div className="flex items-center text-green-600 text-sm">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      <span>5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-2xl font-bold">23</div>
                      <p className="text-xs text-muted-foreground">out of 28 tasks</p>
                    </div>
                    <div className="flex items-center text-green-600 text-sm">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      <span>8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="overview" className="mb-8">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="focus">Focus Time</TabsTrigger>
                <TabsTrigger value="goals">Goal Progress</TabsTrigger>
                <TabsTrigger value="distractions">Distractions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Daily Focus Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={dailyFocusData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5.9% 90%)" vertical={false} />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="hours" fill="hsl(221 83% 53%)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Time Distribution by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[240px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={categoryData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              fill="#8884d8"
                              paddingAngle={5}
                              dataKey="value"
                              label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-base">Weekly Focus Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={weeklyTrendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5.9% 90%)" vertical={false} />
                            <XAxis dataKey="week" />
                            <YAxis />
                            <Tooltip />
                            <Line 
                              type="monotone" 
                              dataKey="hours" 
                              stroke="hsl(221 83% 53%)" 
                              activeDot={{ r: 8 }}
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="focus" className="mt-6">
                <div className="grid grid-cols-1 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Focus Time by Hour of Day</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">Detailed hourly focus analysis visualization</p>
                        <img 
                          src="https://via.placeholder.com/800x250?text=Hourly+Focus+Chart" 
                          alt="Hourly Focus" 
                          className="max-w-full rounded-lg border mt-4"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="goals" className="mt-6">
                <div className="grid grid-cols-1 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Goal Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {goalProgressData.map((goal, index) => (
                          <div key={index}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">{goal.name}</span>
                              <span className="text-sm text-muted-foreground">{goal.progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full" 
                                style={{width: `${goal.progress}%`}}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="distractions" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Daily Distractions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={distractionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5.9% 90%)" vertical={false} />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="hsl(0 84.2% 60.2%)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Top Distractions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-md bg-red-100 flex items-center justify-center text-red-500">
                              <span className="text-xs font-medium">FB</span>
                            </div>
                            <span className="text-sm font-medium">Facebook</span>
                          </div>
                          <span className="text-sm font-medium">23 attempts</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center text-blue-500">
                              <span className="text-xs font-medium">TW</span>
                            </div>
                            <span className="text-sm font-medium">Twitter</span>
                          </div>
                          <span className="text-sm font-medium">18 attempts</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-md bg-purple-100 flex items-center justify-center text-purple-500">
                              <span className="text-xs font-medium">IG</span>
                            </div>
                            <span className="text-sm font-medium">Instagram</span>
                          </div>
                          <span className="text-sm font-medium">12 attempts</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-md bg-green-100 flex items-center justify-center text-green-500">
                              <span className="text-xs font-medium">WA</span>
                            </div>
                            <span className="text-sm font-medium">WhatsApp</span>
                          </div>
                          <span className="text-sm font-medium">6 attempts</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
            
            <Card className="border border-primary/20 bg-primary/5 mb-8">
              <CardHeader className="pb-2 flex flex-row items-center gap-2">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">AI Analytics Insights</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm">Here's what our AI has learned about your productivity patterns:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-4 w-4 text-primary flex-shrink-0">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <p className="text-sm">Your productivity peaks on Wednesdays and is lowest on weekends. Consider scheduling important tasks mid-week.</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-4 w-4 text-primary flex-shrink-0">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <p className="text-sm">Social media sites account for 68% of your distractions. Setting up custom blocking rules could help increase focus time.</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-4 w-4 text-primary flex-shrink-0">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <p className="text-sm">Your most productive sessions are between 60-90 minutes long. Try optimizing your focus sessions to this duration.</p>
                    </li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Get Personalized AI Recommendations
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
