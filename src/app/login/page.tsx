'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMessageTranslation, translateApiError } from '@/lib/utils/messageTranslator';
import { 
  EyeIcon, 
  EyeSlashIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const translateMessage = useMessageTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await login({ email, password });
      setSuccess('Login successful! Redirecting to dashboard...');
      
      // Small delay to show success message
      setTimeout(() => {
        router.push('/');
      }, 500);
    } catch (err: any) {
      console.error('Login error:', err);
      // Translate error message if it's a known message key
      const translatedError = translateApiError(err.message || 'Invalid email or password. Please try again.', translateMessage);
      setError(translatedError);
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gray-200/20 rounded-full blur-3xl animate-float delay-1000" />
      </div>

      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-lg space-y-8">
          {/* Logo and Title */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="relative group">
                <div className="w-20 h-20 bg-gradient-brazil rounded-3xl flex items-center justify-center shadow-brazil transform hover:scale-110 transition-all duration-500 hover:shadow-brazil-lg hover:animate-glow">
                  <ChatBubbleLeftRightIcon className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 animate-bounce">
                  <div className="w-8 h-8 bg-gradient-gold rounded-full flex items-center justify-center shadow-gold">
                    <SparklesIcon className="h-4 w-4 text-gray-900" />
                  </div>
                </div>
              </div>
              <div>
                <span className="text-5xl font-black text-gradient-premium">
                  2N5
                </span>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mt-1">WhatsApp Management</p>
              </div>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-gradient-brazil mb-4">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              Sign in to your Premium Business Platform
            </p>
          </div>

          {/* Login Form */}
          <Card className="border-0 shadow-premium bg-white ring-1 ring-gray-100">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold">Sign in to your account</CardTitle>
              <CardDescription className="text-base">
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-foreground flex items-center space-x-1">
                    <span>Email address</span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-11 text-base border-2 focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-semibold text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full h-11 text-base pr-12 border-2 focus:border-primary transition-colors"
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

                {error && (
                  <div className="p-4 text-sm font-medium text-error-700 bg-error-50 border-l-4 border-error-500 rounded-r-md animate-in slide-in-from-left">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-4 text-sm font-medium text-success-700 bg-success-50 border-l-4 border-success-500 rounded-r-md animate-in slide-in-from-left">
                    {success}
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
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <span>Sign in</span>
                      <ArrowRightIcon className="h-5 w-5" />
                    </span>
                  )}
                </Button>

                <div className="text-center pt-3">
                  <a href="/forgot-password" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors hover:underline">
                    Forgot password?
                  </a>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Trust indicators */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-success-50 to-emerald-50 rounded-2xl border border-success-100 shadow-sm">
              <ShieldCheckIcon className="h-6 w-6 text-success-600" />
              <span className="text-sm font-semibold text-success-900">Secure Login</span>
            </div>
            <div className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-primary-50 to-emerald-50 rounded-2xl border border-primary-100 shadow-sm">
              <GlobeAltIcon className="h-6 w-6 text-primary-600" />
              <span className="text-sm font-semibold text-primary-900">Global Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Hero Image/Content */}
      <div className="hidden lg:flex flex-1 bg-white items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-40 h-40 border-2 border-primary-400 rounded-full animate-pulse" />
          <div className="absolute bottom-20 left-20 w-60 h-60 border-2 border-gold-400 rounded-full animate-pulse delay-300" />
          <div className="absolute top-1/3 left-1/4 w-32 h-32 border-2 border-brazilBlue-800 rounded-full animate-pulse delay-700" />
          <div className="absolute bottom-1/3 right-1/3 w-48 h-48 border-2 border-gray-300 rounded-full animate-float" />
        </div>

        <div className="max-w-xl text-center space-y-10 relative z-10">
          {/* Hero Illustration */}
          <div className="relative">
            <div className="w-96 h-96 mx-auto bg-gradient-premium rounded-full flex items-center justify-center shadow-premium transform hover:scale-105 transition-all duration-700 hover:shadow-premium-lg hover:animate-glow">
              <div className="w-80 h-80 bg-white rounded-full flex items-center justify-center shadow-2xl">
                <div className="space-y-8">
                  <div className="relative">
                    <ChatBubbleLeftRightIcon className="h-24 w-24 text-primary-600 mx-auto animate-float" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-gold rounded-full border-4 border-white shadow-gold animate-pulse" />
                  </div>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-5 h-5 bg-primary-500 rounded-full animate-pulse shadow-brazil" />
                    <div className="w-5 h-5 bg-gold-400 rounded-full animate-pulse delay-100 shadow-gold" />
                    <div className="w-5 h-5 bg-brazilBlue-800 rounded-full animate-pulse delay-200 shadow-lg" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -top-8 -left-8 w-16 h-16 bg-gradient-brazil rounded-3xl animate-bounce shadow-brazil transform rotate-12" />
            <div className="absolute -bottom-8 -right-8 w-12 h-12 bg-gradient-gold rounded-3xl animate-bounce delay-300 shadow-gold transform -rotate-12" />
            <div className="absolute top-1/2 -left-12 w-10 h-10 bg-brazilBlue-800 rounded-2xl animate-bounce delay-150 shadow-lg" />
            <div className="absolute top-1/4 -right-12 w-8 h-8 bg-gradient-to-br from-emerald-500 to-primary-600 rounded-full animate-bounce delay-500 shadow-brazil" />
          </div>

          {/* Content */}
          <div className="space-y-8">
            <h2 className="text-6xl font-black text-gradient-premium leading-tight">
              Manage WhatsApp Business at Scale
            </h2>
            <p className="text-2xl text-gray-700 leading-relaxed font-semibold">
              Streamline your WhatsApp Business communications with our premium 
              management platform. Monitor, manage, and optimize with ease.
            </p>
            
            {/* Features with Brazil-themed design */}
            {/* <div className="grid grid-cols-1 gap-6 pt-8">
              <div className="flex items-center space-x-5 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-brazil hover:shadow-brazil-lg transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-brazil rounded-2xl flex items-center justify-center shadow-brazil">
                  <ChatBubbleLeftRightIcon className="h-8 w-8 text-white" />
                </div>
                <span className="text-gray-900 font-bold text-xl">Multi-account Management</span>
              </div>
              <div className="flex items-center space-x-5 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-gold hover:shadow-gold-lg transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-gold rounded-2xl flex items-center justify-center shadow-gold">
                  <EyeIcon className="h-8 w-8 text-gray-900" />
                </div>
                <span className="text-gray-900 font-bold text-xl">Spy Number Monitoring</span>
              </div>
              <div className="flex items-center space-x-5 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-premium transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1">
                <div className="w-16 h-16 bg-brazilBlue-800 rounded-2xl flex items-center justify-center shadow-lg">
                  <GlobeAltIcon className="h-8 w-8 text-white" />
                </div>
                <span className="text-gray-900 font-bold text-xl">Global Multi-tenant Support</span>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
