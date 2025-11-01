'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  LanguageIcon,
  BellIcon,
  ShieldCheckIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const t = useTranslation('profile');
  const tCommon = useTranslation('common');
  const { user } = useAuth();
  const { roleInfo } = usePermissions();
  const { language, setLanguage, languages } = useLanguage();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    whatsappNotifications: false,
  });

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      
      // TODO: API call to update user profile
      // await api.updateUserProfile(user?.id, formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(t('updatedSuccessfully'));
      setIsEditing(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || tCommon('error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode as any);
    setSuccess(`Language changed to ${languages.find(l => l.code === langCode)?.name}`);
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">
            Manage your personal information and preferences
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-success-50 border border-success-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckIcon className="h-5 w-5 text-success-600 mr-2" />
              <p className="text-sm text-success-700">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-error-50 border border-error-200 rounded-lg p-4">
            <p className="text-sm text-error-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex justify-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-sage-600 rounded-full flex items-center justify-center shadow-lg">
                    <UserIcon className="h-12 w-12 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-foreground">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
                  <div className="flex items-center justify-center space-x-2 mt-3">
                    <Badge variant={roleInfo.badgeColor}>
                      {user?.role}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Editable Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('personalInfo')}</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      {tCommon('edit')}
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            firstName: user?.firstName || '',
                            lastName: user?.lastName || '',
                            email: user?.email || '',
                            phoneNumber: user?.phoneNumber || '',
                          });
                        }}
                      >
                        {tCommon('cancel')}
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving ? tCommon('loading') : tCommon('save')}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('firstName')}</label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      disabled={!isEditing}
                      placeholder={tCommon('placeholder.firstName')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('lastName')}</label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      disabled={!isEditing}
                      placeholder={tCommon('placeholder.lastName')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('email')}</label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10"
                      placeholder={tCommon('placeholder.email')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('role')}</label>
                    <Input
                      value={user?.role || tCommon('user')}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Language Preferences */}
            {/* <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <LanguageIcon className="h-5 w-5 text-primary" />
                  <CardTitle>{t('preferences')}</CardTitle>
                </div>
                <CardDescription>{t('selectLanguage')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('language')}</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                          language === lang.code
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-gray-200 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl">{lang.flag}</span>
                          <div className="text-left">
                            <p className="font-semibold text-sm">{lang.nativeName}</p>
                            <p className="text-xs text-muted-foreground">{lang.name}</p>
                          </div>
                          {language === lang.code && (
                            <CheckIcon className="h-5 w-5 text-primary ml-auto" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card> */}

            {/* Notification Preferences */}
            {/* <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BellIcon className="h-5 w-5 text-primary" />
                  <CardTitle>{t('notifications')}</CardTitle>
                </div>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t('emailNotifications')}</p>
                    <p className="text-sm text-muted-foreground">{t('receiveEmailNotifications')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t('pushNotifications')}</p>
                    <p className="text-sm text-muted-foreground">{t('receivePushNotifications')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.pushNotifications}
                      onChange={(e) => setPreferences({ ...preferences, pushNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t('whatsappNotifications')}</p>
                    <p className="text-sm text-muted-foreground">{t('receiveWhatsappNotifications')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.whatsappNotifications}
                      onChange={(e) => setPreferences({ ...preferences, whatsappNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </CardContent>
            </Card> */}

            {/* Security */}
            {/* <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <ShieldCheckIcon className="h-5 w-5 text-primary" />
                  <CardTitle>{t('security')}</CardTitle>
                </div>
                <CardDescription>Update your password and security settings</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full md:w-auto">
                  {t('changePassword')}
                </Button>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

