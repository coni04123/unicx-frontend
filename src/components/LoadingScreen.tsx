'use client';

import React from 'react';
import { ChatBubbleLeftRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-emerald-50 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-64 h-64 border-4 border-primary-300 rounded-full animate-pulse" />
        <div className="absolute bottom-20 left-20 w-80 h-80 border-4 border-gold-300 rounded-full animate-pulse delay-300" />
        <div className="absolute top-1/3 left-1/4 w-48 h-48 border-4 border-brazilBlue-400 rounded-full animate-pulse delay-700" />
      </div>

      {/* Floating WhatsApp bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-16 h-16 bg-primary-100 rounded-3xl opacity-30 animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/3 right-1/5 w-12 h-12 bg-emerald-100 rounded-2xl opacity-40 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/5 w-14 h-14 bg-gold-100 rounded-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-10 h-10 bg-primary-200 rounded-full opacity-35 animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="text-center space-y-10 relative z-10 animate-fade-in">
        {/* Main logo container */}
        <div className="relative inline-block">
          {/* Glowing background effect */}
          <div className="absolute inset-0 bg-gradient-brazil rounded-3xl blur-2xl opacity-30 animate-glow" />
          
          {/* Logo with premium styling */}
          <div className="relative w-24 h-24 bg-gradient-brazil rounded-3xl flex items-center justify-center shadow-brazil-lg animate-float">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-white" />
            
            {/* Connection indicator */}
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>
          
          {/* Loading dots with Brazilian colors */}
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce shadow-brazil" style={{ animationDelay: '0s' }} />
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce shadow-brazil" style={{ animationDelay: '0.15s' }} />
            <div className="w-3 h-3 bg-gold-400 rounded-full animate-bounce shadow-gold" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>

        {/* Brand name and tagline */}
        <div className="space-y-3 animate-slide-up">
          <h1 className="text-5xl font-black text-gradient-premium tracking-tight">
            2N5
          </h1>
          <p className="text-xl font-semibold text-gray-700">
            WhatsApp Business Management Platform
          </p>
          <p className="text-base text-muted-foreground mt-2">
            Loading your workspace...
          </p>
        </div>

        {/* Premium loading bar */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-80 h-2 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-gradient-to-r from-primary-500 via-emerald-500 to-primary-500 rounded-full animate-shimmer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" style={{ animationDuration: '1.5s' }} />
            </div>
          </div>
          
          {/* Status indicators */}
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span>Connecting...</span>
            </div>
            <div className="flex items-center space-x-2 opacity-50">
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
              <span>Initializing</span>
            </div>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-3 gap-6 pt-8 max-w-2xl mx-auto">
          {[
            { label: 'Accounts', icon: '✓' },
            { label: 'Messages', icon: '✓' },
            { label: 'Monitoring', icon: '✓' },
          ].map((feature, index) => (
            <div
              key={feature.label}
              className="flex flex-col items-center space-y-2 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-primary-100/50 shadow-sm animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="w-8 h-8 bg-gradient-brazil rounded-lg flex items-center justify-center shadow-brazil">
                <CheckCircleIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-700">{feature.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
