'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      await api.resetPassword({ token, newPassword });
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.message || 'Invalid or expired reset link. Please request a new one.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl animate-float delay-700" />
      </div>

      {/* Centered Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Title */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="relative group">
                <div className="w-20 h-20 bg-gradient-brazil rounded-3xl flex items-center justify-center shadow-brazil transform hover:scale-110 transition-all duration-500">
                  <ChatBubbleLeftRightIcon className="h-10 w-10 text-white" />
                </div>
              </div>
              <div>
                <span className="text-5xl font-black text-gradient-premium">2N5</span>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mt-1">WhatsApp Management</p>
              </div>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-gradient-brazil mb-4">
              Reset Password
            </h1>
            <p className="text-gray-600 text-lg">
              Enter your new password
            </p>
          </div>

          {/* Form */}
          <Card className="border-0 shadow-premium bg-white ring-1 ring-gray-100">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold">Create New Password</CardTitle>
              <CardDescription className="text-base">
                Choose a strong password for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!success ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-semibold text-foreground">
                      New Password
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full h-11 text-base pl-10 pr-12 border-2 focus:border-primary transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full h-11 text-base pl-10 pr-12 border-2 focus:border-primary transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 text-sm font-medium text-error-700 bg-error-50 border-l-4 border-error-500 rounded-r-md">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-14 text-lg font-bold bg-gradient-brazil hover:shadow-brazil-lg shadow-brazil transform hover:scale-[1.02] transition-all duration-300 rounded-xl"
                    disabled={isLoading || !token}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Resetting...</span>
                      </div>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </form>
              ) : (
                <div className="space-y-6 text-center py-4">
                  <div className="flex justify-center">
                    <CheckCircleIcon className="h-16 w-16 text-success-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">Password Reset Successfully!</h3>
                    <p className="text-gray-600">
                      Your password has been changed. Redirecting to login...
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push('/login')}
                    className="w-full h-12 bg-gradient-brazil shadow-brazil hover:shadow-brazil-lg"
                  >
                    Go to Login
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}












