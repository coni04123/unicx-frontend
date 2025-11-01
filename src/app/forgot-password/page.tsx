'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  EnvelopeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      await api.forgotPassword({ email });
      setSuccess(true);
    } catch (err: any) {
      setError('If an account exists with this email, you will receive password reset instructions.');
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
              Forgot Password
            </h1>
            <p className="text-gray-600 text-lg">
              Enter your email to receive a password reset link
            </p>
          </div>

          {/* Form */}
          <Card className="border-0 shadow-premium bg-white ring-1 ring-gray-100">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
              <CardDescription className="text-base">
                We'll send you instructions to reset your password
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!success ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-foreground">
                      Email address
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full h-11 text-base pl-10 border-2 focus:border-primary transition-colors"
                      />
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
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </div>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>

                  <div className="text-center pt-3">
                    <button
                      type="button"
                      onClick={() => router.push('/login')}
                      className="text-primary-600 hover:text-primary-700 font-semibold transition-colors hover:underline inline-flex items-center space-x-2"
                    >
                      <ArrowLeftIcon className="h-4 w-4" />
                      <span>Back to login</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6 text-center py-4">
                  <div className="flex justify-center">
                    <CheckCircleIcon className="h-16 w-16 text-success-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">Check your email</h3>
                    <p className="text-gray-600">
                      If an account exists for {email}, we've sent password reset instructions.
                    </p>
                  </div>


                  <Button
                    onClick={() => router.push('/login')}
                    className="w-full h-12 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-900 hover:from-gray-200 hover:to-gray-100 border border-gray-200 shadow-sm"
                  >
                    Return to login
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













