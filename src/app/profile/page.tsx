'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import {
  UserIcon,
  EnvelopeIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'SystemAdmin':
      return 'Administrator';
    case 'TenantAdmin':
      return 'Manager';
    case 'User':
      return 'User';
    default:
      return role;
  }
};

export default function ProfilePage() {
  const t = useTranslation('profile');
  const tCommon = useTranslation('common');
  const { user: authUser } = useAuth();
  
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const profileData = await api.getProfile();
      setProfile(profileData);
      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        phoneNumber: profileData.phoneNumber || '',
      });
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      
      const updateData: any = {};
      if (formData.firstName !== profile.firstName) {
        updateData.firstName = formData.firstName;
      }
      if (formData.lastName !== profile.lastName) {
        updateData.lastName = formData.lastName;
      }
      if (formData.phoneNumber !== profile.phoneNumber) {
        updateData.phoneNumber = formData.phoneNumber;
      }
      if (formData.email !== profile.email) {
        updateData.email = formData.email;
      }

      if (Object.keys(updateData).length === 0) {
        setIsEditing(false);
        return;
      }

      const updatedProfile = await api.updateProfile(updateData);
      
      // Update localStorage if email was changed
      if (updateData.email && authUser) {
        const updatedUser = {
          ...authUser,
          email: updatedProfile.email,
          firstName: updatedProfile.firstName,
          lastName: updatedProfile.lastName,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      setProfile(updatedProfile);
      setSuccess('Profile updated successfully!');
      
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-error-600">Failed to load profile</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
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
                    {profile.firstName} {profile.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {profile.email}
                  </p>
                  <div className="flex items-center justify-center space-x-2 mt-3">
                    <Badge variant="secondary">
                      {getRoleDisplayName(profile.role)}
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
                            firstName: profile.firstName || '',
                            lastName: profile.lastName || '',
                            email: profile.email || '',
                            phoneNumber: profile.phoneNumber || '',
                          });
                          setError('');
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
