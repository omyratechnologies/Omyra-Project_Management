import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserSettings {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    avatar?: string;
  };
  company: {
    companyName: string;
    companyEmail: string;
    companyWebsite: string;
    companyAddress: string;
  };
  notifications: {
    emailNotifications: boolean;
    taskAssignments: boolean;
    projectUpdates: boolean;
    dueDateReminders: boolean;
    teamActivity: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
  };
  security: {
    twoFactorEnabled: boolean;
  };
}

const defaultSettings: UserSettings = {
  profile: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
  },
  company: {
    companyName: '',
    companyEmail: '',
    companyWebsite: '',
    companyAddress: '',
  },
  notifications: {
    emailNotifications: true,
    taskAssignments: true,
    projectUpdates: true,
    dueDateReminders: true,
    teamActivity: false,
  },
  appearance: {
    theme: 'light',
    language: 'en',
    timezone: 'est',
  },
  security: {
    twoFactorEnabled: false,
  },
};

export const useSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();

  // Check if user has admin privileges for company settings
  const canManageCompany = profile?.role === 'admin';
  
  // Check if user has admin privileges for role management
  const canManageRoles = profile?.role === 'admin';

  useEffect(() => {
    loadSettings();
  }, [user, profile]);

  const loadSettings = async () => {
    if (!user || !profile) return;

    try {
      setLoading(true);
      
      // Load profile data
      const profileData = {
        firstName: profile.fullName?.split(' ')[0] || '',
        lastName: profile.fullName?.split(' ')[1] || '',
        email: profile.email || user.email || '',
        phone: '',
        location: '',
        avatar: profile.avatar,
      };

      let companyData = defaultSettings.company;
      let preferencesData = defaultSettings.notifications;
      let appearanceData = defaultSettings.appearance;

      try {
        // Load company settings (only for admins)
        if (canManageCompany) {
          companyData = await apiClient.getCompanySettings();
        }
      } catch (error: any) {
        // If 403 (Forbidden), user doesn't have access - that's fine
        if (error.response?.status !== 403) {
          console.log('Company settings not available');
        }
      }

      try {
        // Load user preferences
        const preferences = await apiClient.getPreferences();
        preferencesData = preferences.notifications;
        appearanceData = {
          theme: (preferences.appearance?.theme as 'light' | 'dark' | 'system') || 'light',
          language: preferences.appearance?.language || 'en',
          timezone: preferences.appearance?.timezone || 'est',
        };
      } catch (error) {
        console.log('User preferences not available, using defaults');
      }

      setSettings({
        profile: profileData,
        company: companyData,
        notifications: preferencesData,
        appearance: appearanceData,
        security: {
          twoFactorEnabled: false, // TODO: Load from API
        },
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings. Using defaults.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<UserSettings['profile']>) => {
    try {
      setSaving(true);
      
      const fullName = `${profileData.firstName || settings.profile.firstName} ${profileData.lastName || settings.profile.lastName}`.trim();
      
      await apiClient.updateProfile({
        fullName,
        phone: profileData.phone,
        location: profileData.location,
        avatar: profileData.avatar,
      });

      await refreshProfile();
      
      setSettings(prev => ({
        ...prev,
        profile: { ...prev.profile, ...profileData },
      }));

      toast({
        title: 'Success',
        description: 'Profile updated successfully.',
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const updateCompanySettings = async (companyData: Partial<UserSettings['company']>) => {
    if (!canManageCompany) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to update company settings.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      
      await apiClient.updateCompanySettings(companyData);
      
      setSettings(prev => ({
        ...prev,
        company: { ...prev.company, ...companyData },
      }));

      toast({
        title: 'Success',
        description: 'Company settings updated successfully.',
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update company settings';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const updateNotificationSettings = async (notificationData: Partial<UserSettings['notifications']>) => {
    try {
      setSaving(true);
      
      await apiClient.updatePreferences({
        notifications: { ...settings.notifications, ...notificationData }
      });
      
      setSettings(prev => ({
        ...prev,
        notifications: { ...prev.notifications, ...notificationData },
      }));

      toast({
        title: 'Success',
        description: 'Notification settings updated successfully.',
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update notification settings';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const updateAppearanceSettings = async (appearanceData: Partial<UserSettings['appearance']>) => {
    try {
      setSaving(true);
      
      await apiClient.updatePreferences({
        appearance: { ...settings.appearance, ...appearanceData }
      });
      
      setSettings(prev => ({
        ...prev,
        appearance: { ...prev.appearance, ...appearanceData },
      }));

      // Apply theme change immediately
      if (appearanceData.theme) {
        const root = window.document.documentElement;
        
        if (appearanceData.theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          root.classList.toggle('dark', systemTheme === 'dark');
        } else {
          root.classList.toggle('dark', appearanceData.theme === 'dark');
        }
      }

      toast({
        title: 'Success',
        description: 'Appearance settings updated successfully.',
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update appearance settings';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const updateSecuritySettings = async (securityData: Partial<UserSettings['security']>) => {
    try {
      setSaving(true);
      
      // TODO: Implement security settings API calls
      
      setSettings(prev => ({
        ...prev,
        security: { ...prev.security, ...securityData },
      }));

      toast({
        title: 'Success',
        description: 'Security settings updated successfully.',
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update security settings';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return {
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
    refreshSettings: loadSettings,
  };
};
