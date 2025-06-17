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
    theme: string;
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
        appearanceData = preferences.appearance;
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
        description: 'Only administrators can update company settings.',
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

  const updateNotifications = async (notificationData: Partial<UserSettings['notifications']>) => {
    try {
      setSaving(true);
      
      await apiClient.updatePreferences({
        notifications: notificationData,
      });
      
      setSettings(prev => ({
        ...prev,
        notifications: { ...prev.notifications, ...notificationData },
      }));

      toast({
        title: 'Success',
        description: 'Notification preferences updated successfully.',
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update notification preferences';
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

  const updateAppearance = async (appearanceData: Partial<UserSettings['appearance']>) => {
    try {
      setSaving(true);
      
      await apiClient.updatePreferences({
        appearance: appearanceData,
      });
      
      // Also save to localStorage for immediate theme changes
      localStorage.setItem('appearance', JSON.stringify({ ...settings.appearance, ...appearanceData }));
      
      setSettings(prev => ({
        ...prev,
        appearance: { ...prev.appearance, ...appearanceData },
      }));

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

  const updatePassword = async (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'New password and confirmation password do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      
      await apiClient.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast({
        title: 'Success',
        description: 'Password updated successfully.',
      });
      
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update password';
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

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return {
    settings,
    loading,
    saving,
    canManageCompany,
    canManageRoles,
    updateProfile,
    updateCompanySettings,
    updateNotifications,
    updateAppearance,
    updatePassword,
    resetSettings,
    refreshSettings: loadSettings,
  };
};
