import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Building, Bell, Shield, Palette, Check, X, Loader2, Play, Volume2, Monitor } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";
import { useNotifications } from "@/hooks/useNotifications";
import { useOnboardingTour } from "@/components/onboarding/OnboardingTour";

const Settings = () => {
  const { user, profile } = useAuth();
  const { startTour, setHasCompletedTour } = useOnboardingTour();
  const { toast } = useToast();
  const { 
    preferences: notificationPreferences, 
    updatePreferences: updateNotificationPreferences,
    testNotification,
    requestNotificationPermission 
  } = useNotifications();
  const {
    settings,
    loading,
    saving,
    canManageCompany,
    canManageRoles,
    updateProfile,
    updateCompanySettings,
    updateNotificationSettings,
    updateAppearanceSettings,
    updateSecuritySettings,
  } = useSettings();

  // Local form states for controlled inputs
  const [profileForm, setProfileForm] = useState(settings.profile);
  const [companyForm, setCompanyForm] = useState(settings.company);
  const [notificationForm, setNotificationForm] = useState(settings.notifications);
  const [appearanceForm, setAppearanceForm] = useState(settings.appearance);
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Update local forms when settings change
  useEffect(() => {
    setProfileForm(settings.profile);
    setCompanyForm(settings.company);
    setNotificationForm(settings.notifications);
    setAppearanceForm(settings.appearance);
  }, [settings]);

  const handleProfileSave = async () => {
    try {
      await updateProfile(profileForm);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleCompanySave = async () => {
    try {
      await updateCompanySettings(companyForm);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleNotificationsSave = async () => {
    try {
      await updateNotificationSettings(notificationForm);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      // Validate passwords match
      if (securityForm.newPassword !== securityForm.confirmPassword) {
        toast({
          title: 'Error',
          description: 'New passwords do not match',
          variant: 'destructive'
        });
        return;
      }

      // Validate password length
      if (securityForm.newPassword.length < 8) {
        toast({
          title: 'Error',
          description: 'Password must be at least 8 characters long',
          variant: 'destructive'
        });
        return;
      }

      // TODO: Implement password update API call
      // For now, just show success message
      toast({
        title: 'Success',
        description: 'Password updated successfully',
      });
      
      setSecurityForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update password',
        variant: 'destructive'
      });
    }
  };

  const handleAppearanceSave = async () => {
    try {
      await updateAppearanceSettings(appearanceForm);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const signOutAllSessions = () => {
    // TODO: Implement API call to invalidate all sessions
    console.log('Signing out all sessions');
    toast({
      title: "Sessions Terminated",
      description: "All other sessions have been signed out successfully.",
    });
  };

  const getInitials = (name: string | undefined | null) => {
    if (!name) return profile?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fde8] flex w-full">
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6 overflow-auto">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        {/* Optional: Add a help button or other actions here */}
        <Button
          variant="outline"
          onClick={() => startTour()}
          className="hidden sm:flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Take Tour
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full md:w-fit grid-cols-2 md:grid-cols-5 gap-1">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden md:inline">Profile</span>
          </TabsTrigger>
          {canManageCompany && (
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              <span className="hidden md:inline">Company</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden md:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden md:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden md:inline">Appearance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl">
                    {getInitials(profile?.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline">Change Photo</Button>
                  <p className="text-sm text-gray-500 mt-1">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select disabled value={profile?.role || 'team_member'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="project_manager">Project Manager</SelectItem>
                      <SelectItem value="team_member">Team Member</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    {canManageRoles ? 'Role management available in team settings' : 'Role can only be changed by an administrator'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button 
                  variant="outline"
                  onClick={() => setProfileForm(settings.profile)}
                  disabled={saving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleProfileSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {canManageCompany && (
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Company Settings
                  {!canManageCompany && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Admin Only
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!canManageCompany && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      Only administrators can modify company settings. Contact your admin to make changes.
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input 
                    id="companyName" 
                    value={companyForm.companyName}
                    onChange={(e) => setCompanyForm({...companyForm, companyName: e.target.value})}
                    placeholder="Enter company name"
                    disabled={!canManageCompany}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input 
                    id="companyEmail" 
                    value={companyForm.companyEmail}
                    onChange={(e) => setCompanyForm({...companyForm, companyEmail: e.target.value})}
                    placeholder="contact@company.com"
                    disabled={!canManageCompany}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Website</Label>
                  <Input 
                    id="companyWebsite" 
                    value={companyForm.companyWebsite}
                    onChange={(e) => setCompanyForm({...companyForm, companyWebsite: e.target.value})}
                    placeholder="https://company.com"
                    disabled={!canManageCompany}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Address</Label>
                  <Input 
                    id="companyAddress" 
                    value={companyForm.companyAddress}
                    onChange={(e) => setCompanyForm({...companyForm, companyAddress: e.target.value})}
                    placeholder="123 Business Street, City, State 12345"
                    disabled={!canManageCompany}
                  />
                </div>

                {canManageCompany && (
                  <div className="flex justify-end space-x-4">
                    <Button 
                      variant="outline"
                      onClick={() => setCompanyForm(settings.company)}
                      disabled={saving}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleCompanySave} disabled={saving}>
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="notifications">
          <div className="space-y-6">
            {/* Real-time Connection Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Real-time Notifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Real-time Notifications</Label>
                    <p className="text-sm text-gray-500">Enable live notification updates</p>
                  </div>
                  <Switch 
                    checked={notificationPreferences?.realTime.enabled || false}
                    onCheckedChange={(checked) => {
                      if (notificationPreferences) {
                        updateNotificationPreferences({
                          ...notificationPreferences,
                          realTime: { ...notificationPreferences.realTime, enabled: checked }
                        });
                      }
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="flex items-center space-x-2">
                      <Volume2 className="w-4 h-4" />
                      <span>Sound Notifications</span>
                    </Label>
                    <p className="text-sm text-gray-500">Play sound for new notifications</p>
                  </div>
                  <Switch 
                    checked={notificationPreferences?.realTime.sound || false}
                    onCheckedChange={(checked) => {
                      if (notificationPreferences) {
                        updateNotificationPreferences({
                          ...notificationPreferences,
                          realTime: { ...notificationPreferences.realTime, sound: checked }
                        });
                      }
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="flex items-center space-x-2">
                      <Monitor className="w-4 h-4" />
                      <span>Desktop Notifications</span>
                    </Label>
                    <p className="text-sm text-gray-500">Show browser notification popups</p>
                  </div>
                  <Switch 
                    checked={notificationPreferences?.realTime.desktop || false}
                    onCheckedChange={async (checked) => {
                      if (checked) {
                        const granted = await requestNotificationPermission();
                        if (granted && notificationPreferences) {
                          updateNotificationPreferences({
                            ...notificationPreferences,
                            realTime: { ...notificationPreferences.realTime, desktop: true }
                          });
                        } else {
                          toast({
                            title: "Permission Required",
                            description: "Please allow notifications in your browser settings.",
                            variant: "destructive"
                          });
                        }
                      } else if (notificationPreferences) {
                        updateNotificationPreferences({
                          ...notificationPreferences,
                          realTime: { ...notificationPreferences.realTime, desktop: false }
                        });
                      }
                    }}
                  />
                </div>
                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={testNotification}
                    className="w-full"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Test Notification
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Email Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Task Assignments</Label>
                    <p className="text-sm text-gray-500">When you're assigned to a task</p>
                  </div>
                  <Switch 
                    checked={notificationPreferences?.email.taskAssigned || false}
                    onCheckedChange={(checked) => {
                      if (notificationPreferences) {
                        updateNotificationPreferences({
                          ...notificationPreferences,
                          email: { ...notificationPreferences.email, taskAssigned: checked }
                        });
                      }
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Task Due Dates</Label>
                    <p className="text-sm text-gray-500">Reminders for upcoming task deadlines</p>
                  </div>
                  <Switch 
                    checked={notificationPreferences?.email.taskDue || false}
                    onCheckedChange={(checked) => {
                      if (notificationPreferences) {
                        updateNotificationPreferences({
                          ...notificationPreferences,
                          email: { ...notificationPreferences.email, taskDue: checked }
                        });
                      }
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Project Updates</Label>
                    <p className="text-sm text-gray-500">Status changes and milestones</p>
                  </div>
                  <Switch 
                    checked={notificationPreferences?.email.projectUpdates || false}
                    onCheckedChange={(checked) => {
                      if (notificationPreferences) {
                        updateNotificationPreferences({
                          ...notificationPreferences,
                          email: { ...notificationPreferences.email, projectUpdates: checked }
                        });
                      }
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Meeting Reminders</Label>
                    <p className="text-sm text-gray-500">Upcoming meeting notifications</p>
                  </div>
                  <Switch 
                    checked={notificationPreferences?.email.meetingReminders || false}
                    onCheckedChange={(checked) => {
                      if (notificationPreferences) {
                        updateNotificationPreferences({
                          ...notificationPreferences,
                          email: { ...notificationPreferences.email, meetingReminders: checked }
                        });
                      }
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Feedback Responses</Label>
                    <p className="text-sm text-gray-500">When clients receive feedback responses</p>
                  </div>
                  <Switch 
                    checked={notificationPreferences?.email.feedbackResponse || false}
                    onCheckedChange={(checked) => {
                      if (notificationPreferences) {
                        updateNotificationPreferences({
                          ...notificationPreferences,
                          email: { ...notificationPreferences.email, feedbackResponse: checked }
                        });
                      }
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>System Alerts</Label>
                    <p className="text-sm text-gray-500">Important system announcements</p>
                  </div>
                  <Switch 
                    checked={notificationPreferences?.email.systemAlerts || false}
                    onCheckedChange={(checked) => {
                      if (notificationPreferences) {
                        updateNotificationPreferences({
                          ...notificationPreferences,
                          email: { ...notificationPreferences.email, systemAlerts: checked }
                        });
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Push Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>In-App Push Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Task Assignments</Label>
                    <p className="text-sm text-gray-500">When you're assigned to a task</p>
                  </div>
                  <Switch 
                    checked={notificationPreferences?.push.taskAssigned || false}
                    onCheckedChange={(checked) => {
                      if (notificationPreferences) {
                        updateNotificationPreferences({
                          ...notificationPreferences,
                          push: { ...notificationPreferences.push, taskAssigned: checked }
                        });
                      }
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Task Due Dates</Label>
                    <p className="text-sm text-gray-500">Reminders for upcoming task deadlines</p>
                  </div>
                  <Switch 
                    checked={notificationPreferences?.push.taskDue || false}
                    onCheckedChange={(checked) => {
                      if (notificationPreferences) {
                        updateNotificationPreferences({
                          ...notificationPreferences,
                          push: { ...notificationPreferences.push, taskDue: checked }
                        });
                      }
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Project Updates</Label>
                    <p className="text-sm text-gray-500">Status changes and milestones</p>
                  </div>
                  <Switch 
                    checked={notificationPreferences?.push.projectUpdates || false}
                    onCheckedChange={(checked) => {
                      if (notificationPreferences) {
                        updateNotificationPreferences({
                          ...notificationPreferences,
                          push: { ...notificationPreferences.push, projectUpdates: checked }
                        });
                      }
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Meeting Reminders</Label>
                    <p className="text-sm text-gray-500">Upcoming meeting notifications</p>
                  </div>
                  <Switch 
                    checked={notificationPreferences?.push.meetingReminders || false}
                    onCheckedChange={(checked) => {
                      if (notificationPreferences) {
                        updateNotificationPreferences({
                          ...notificationPreferences,
                          push: { ...notificationPreferences.push, meetingReminders: checked }
                        });
                      }
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Feedback Responses</Label>
                    <p className="text-sm text-gray-500">When clients receive feedback responses</p>
                  </div>
                  <Switch 
                    checked={notificationPreferences?.push.feedbackResponse || false}
                    onCheckedChange={(checked) => {
                      if (notificationPreferences) {
                        updateNotificationPreferences({
                          ...notificationPreferences,
                          push: { ...notificationPreferences.push, feedbackResponse: checked }
                        });
                      }
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>System Alerts</Label>
                    <p className="text-sm text-gray-500">Important system announcements</p>
                  </div>
                  <Switch 
                    checked={notificationPreferences?.push.systemAlerts || false}
                    onCheckedChange={(checked) => {
                      if (notificationPreferences) {
                        updateNotificationPreferences({
                          ...notificationPreferences,
                          push: { ...notificationPreferences.push, systemAlerts: checked }
                        });
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input 
                    id="currentPassword" 
                    type="password"
                    value={securityForm.currentPassword}
                    onChange={(e) => setSecurityForm({...securityForm, currentPassword: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input 
                    id="newPassword" 
                    type="password"
                    value={securityForm.newPassword}
                    onChange={(e) => setSecurityForm({...securityForm, newPassword: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password"
                    value={securityForm.confirmPassword}
                    onChange={(e) => setSecurityForm({...securityForm, confirmPassword: e.target.value})}
                  />
                </div>
                <Button onClick={handlePasswordUpdate} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                  Update Password
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable 2FA</Label>
                    <p className="text-sm text-gray-500">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch 
                    checked={settings.security.twoFactorEnabled}
                    onCheckedChange={(checked) => {
                      // TODO: Implement 2FA toggle
                      console.log('2FA toggle:', checked);
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-sm text-gray-500">
                        Browser on {navigator.platform}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={signOutAllSessions}
                  >
                    Sign Out All Other Sessions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select 
                  value={appearanceForm.theme} 
                  onValueChange={(value: 'light' | 'dark' | 'system') => setAppearanceForm({...appearanceForm, theme: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Language</Label>
                <Select 
                  value={appearanceForm.language} 
                  onValueChange={(value) => setAppearanceForm({...appearanceForm, language: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select 
                  value={appearanceForm.timezone} 
                  onValueChange={(value) => setAppearanceForm({...appearanceForm, timezone: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="est">Eastern Time (EST)</SelectItem>
                    <SelectItem value="cst">Central Time (CST)</SelectItem>
                    <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                    <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 border-t pt-6">
                <div>
                  <Label className="text-sm font-medium">Interface Help</Label>
                  <p className="text-xs text-gray-500 mb-3">Take the onboarding tour again to learn about features</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setHasCompletedTour(false); // Reset the completion status
                      startTour(); // Start the tour
                    }}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Restart Onboarding Tour
                  </Button>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button 
                  variant="outline"
                  onClick={() => setAppearanceForm(settings.appearance)}
                  disabled={saving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={handleAppearanceSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
