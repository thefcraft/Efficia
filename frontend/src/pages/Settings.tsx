import React from 'react';
import { SideNavigation } from '@/components/layout/SideNavigation';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Save 
} from 'lucide-react';
import { AccentColor, useThemeStore } from '@/stores/useThemeStore';
import { toast } from 'sonner';

const Settings = () => {
  const { theme, accentColor, fontSize, setTheme, setAccentColor, setFontSize } = useThemeStore();

  const handleThemeChange = (selectedTheme: 'light' | 'dark' | 'system') => {
    setTheme(selectedTheme);
    toast.success('Theme updated successfully');
  };

  const handleAccentColorChange = (color: string) => {
    setAccentColor(color as AccentColor);
    document.documentElement.style.setProperty('--primary', color);
    toast.success('Accent color updated successfully');
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value, 10);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}px`;
    toast.success('Font size updated successfully');
  };

  return (
    <div className="flex min-h-screen">
      <SideNavigation />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 py-6 px-6 bg-background">
          <div className="max-w-5xl mx-auto fade-in">
            <div className="flex items-center mb-8">
              <h1 className="text-2xl font-display font-bold">Settings</h1>
            </div>
            
            <Tabs defaultValue="account" className="space-y-6">
              <TabsList className="grid grid-cols-6 h-auto">
                <TabsTrigger value="account" className="flex flex-col items-center py-3 px-4 h-auto data-[state=active]:shadow-none">
                  <User className="h-5 w-5 mb-1" />
                  <span className="text-xs">Account</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex flex-col items-center py-3 px-4 h-auto data-[state=active]:shadow-none">
                  <Bell className="h-5 w-5 mb-1" />
                  <span className="text-xs">Notifications</span>
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex flex-col items-center py-3 px-4 h-auto data-[state=active]:shadow-none">
                  <Shield className="h-5 w-5 mb-1" />
                  <span className="text-xs">Privacy</span>
                </TabsTrigger>
                <TabsTrigger value="appearance" className="flex flex-col items-center py-3 px-4 h-auto data-[state=active]:shadow-none">
                  <Palette className="h-5 w-5 mb-1" />
                  <span className="text-xs">Appearance</span>
                </TabsTrigger>
                <TabsTrigger value="data" className="flex flex-col items-center py-3 px-4 h-auto data-[state=active]:shadow-none">
                  <Database className="h-5 w-5 mb-1" />
                  <span className="text-xs">Data</span>
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex flex-col items-center py-3 px-4 h-auto data-[state=active]:shadow-none">
                  <SettingsIcon className="h-5 w-5 mb-1" />
                  <span className="text-xs">Advanced</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account information and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Profile Information</h3>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" defaultValue="John" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" defaultValue="Doe" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" defaultValue="john.doe@example.com" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Password</h3>
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input id="currentPassword" type="password" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input id="newPassword" type="password" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input id="confirmPassword" type="password" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="ml-auto gap-2">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Configure how and when you receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">General Notifications</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="sessions">Session Reminders</Label>
                            <p className="text-xs text-muted-foreground">Get notified about upcoming sessions</p>
                          </div>
                          <Switch id="sessions" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="goals">Goal Updates</Label>
                            <p className="text-xs text-muted-foreground">Get notified about goal progress and deadlines</p>
                          </div>
                          <Switch id="goals" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="todos">Todo Reminders</Label>
                            <p className="text-xs text-muted-foreground">Get reminders for due and upcoming tasks</p>
                          </div>
                          <Switch id="todos" defaultChecked />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Block Notifications</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="blockAttempts">Block Attempts</Label>
                            <p className="text-xs text-muted-foreground">Notify when a blocked app or site is attempted</p>
                          </div>
                          <Switch id="blockAttempts" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="blockSummaries">Daily Summaries</Label>
                            <p className="text-xs text-muted-foreground">Get daily reports on blocked distractions</p>
                          </div>
                          <Switch id="blockSummaries" defaultChecked />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="ml-auto gap-2">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="privacy">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy & Security</CardTitle>
                    <CardDescription>Manage your privacy and security settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Data Privacy</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="dataCollection">Usage Data Collection</Label>
                            <p className="text-xs text-muted-foreground">Allow anonymous usage data to improve the app</p>
                          </div>
                          <Switch id="dataCollection" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="activityTracking">Activity Tracking</Label>
                            <p className="text-xs text-muted-foreground">Track app and website usage for productivity insights</p>
                          </div>
                          <Switch id="activityTracking" defaultChecked />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Security</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                            <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                          </div>
                          <Switch id="twoFactor" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="sessionTimeout">Session Timeout</Label>
                            <p className="text-xs text-muted-foreground">Automatically log out after period of inactivity</p>
                          </div>
                          <Switch id="sessionTimeout" defaultChecked />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="ml-auto gap-2">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="appearance">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize the look and feel of the application</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Theme</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div 
                          className={`border rounded-md p-3 cursor-pointer flex flex-col items-center gap-2 bg-white text-center hover:border-primary ${theme === 'light' ? 'border-primary' : ''}`}
                          onClick={() => handleThemeChange('light')}
                        >
                          <div className="w-full h-24 bg-white border rounded-md"></div>
                          <span className="text-sm font-medium">Light</span>
                        </div>
                        <div 
                          className={`border rounded-md p-3 cursor-pointer flex flex-col items-center gap-2 bg-white text-center hover:border-primary ${theme === 'dark' ? 'border-primary' : ''}`}
                          onClick={() => handleThemeChange('dark')}
                        >
                          <div className="w-full h-24 bg-slate-900 border rounded-md"></div>
                          <span className="text-sm font-medium">Dark</span>
                        </div>
                        <div 
                          className={`border rounded-md p-3 cursor-pointer flex flex-col items-center gap-2 bg-white text-center hover:border-primary ${theme === 'system' ? 'border-primary' : ''}`}
                          onClick={() => handleThemeChange('system')}
                        >
                          <div className="w-full h-24 bg-gradient-to-b from-white to-slate-900 border rounded-md"></div>
                          <span className="text-sm font-medium">System</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Accent Color</h3>
                      <div className="grid grid-cols-6 gap-4">
                        {[
                          { color: 'blue', bg: 'bg-blue-600' },
                          { color: 'purple', bg: 'bg-purple-600' },
                          { color: 'pink', bg: 'bg-pink-600' },
                          { color: 'orange', bg: 'bg-orange-600' },
                          { color: 'green', bg: 'bg-green-600' },
                          { color: 'slate', bg: 'bg-slate-600' }
                        ].map(({ color, bg }) => (
                          <div
                            key={color}
                            className={`border rounded-full w-10 h-10 ${bg} cursor-pointer ${accentColor === color ? 'border-2 border-primary' : ''}`}
                            onClick={() => handleAccentColorChange(color)}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Font Size</h3>
                      <div className="flex items-center gap-4">
                        <span className="text-xs">A</span>
                        <input
                          type="range"
                          min="12"
                          max="20"
                          value={fontSize}
                          onChange={handleFontSizeChange}
                          className="w-full accent-primary"
                        />
                        <span className="text-lg">A</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="ml-auto gap-2">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="data">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>Manage your data and export options</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Backup & Sync</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="autoBackup">Automatic Backup</Label>
                            <p className="text-xs text-muted-foreground">Automatically backup your data daily</p>
                          </div>
                          <Switch id="autoBackup" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="cloudSync">Cloud Synchronization</Label>
                            <p className="text-xs text-muted-foreground">Sync your data across multiple devices</p>
                          </div>
                          <Switch id="cloudSync" defaultChecked />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Import & Export</h3>
                      <div className="flex flex-wrap gap-3">
                        <Button variant="outline" size="sm">
                          Export All Data
                        </Button>
                        <Button variant="outline" size="sm">
                          Export Goals
                        </Button>
                        <Button variant="outline" size="sm">
                          Export Tasks
                        </Button>
                        <Button variant="outline" size="sm">
                          Export Notes
                        </Button>
                        <Button variant="outline" size="sm">
                          Import Data
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-destructive">Danger Zone</h3>
                      <div className="border border-destructive/20 rounded-md p-4 bg-destructive/5">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium">Clear All Data</h4>
                            <p className="text-sm text-muted-foreground">Delete all your data from the application</p>
                          </div>
                          <Button variant="destructive" size="sm">
                            Clear All Data
                          </Button>
                        </div>
                        
                        <div className="border-t border-destructive/20 mt-4 pt-4 space-y-4">
                          <div>
                            <h4 className="font-medium">Delete Account</h4>
                            <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data</p>
                          </div>
                          <Button variant="destructive" size="sm">
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="advanced">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Settings</CardTitle>
                    <CardDescription>Configure advanced options and features</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Block Settings</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="strictMode">Strict Mode</Label>
                            <p className="text-xs text-muted-foreground">Prevent disabling blocks during active sessions</p>
                          </div>
                          <Switch id="strictMode" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="systemBlock">System-Level Blocking</Label>
                            <p className="text-xs text-muted-foreground">Use stronger system-level blocking methods</p>
                          </div>
                          <Switch id="systemBlock" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Session Settings</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="autoStart">Auto-start Sessions</Label>
                            <p className="text-xs text-muted-foreground">Automatically start scheduled sessions</p>
                          </div>
                          <Switch id="autoStart" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="autoReschedule">Auto-reschedule Missed Sessions</Label>
                            <p className="text-xs text-muted-foreground">Automatically reschedule missed sessions</p>
                          </div>
                          <Switch id="autoReschedule" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Integration Settings</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="calendarSync">Calendar Integration</Label>
                            <p className="text-xs text-muted-foreground">Sync sessions with your calendar</p>
                          </div>
                          <Switch id="calendarSync" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="taskSync">Task Manager Integration</Label>
                            <p className="text-xs text-muted-foreground">Sync todos with external task managers</p>
                          </div>
                          <Switch id="taskSync" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="ml-auto gap-2">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
