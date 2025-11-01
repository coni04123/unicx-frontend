'use client';

import { useEffect, useState } from 'react';

interface AuthenticatedAudioProps {
  src: string;
  className?: string;
  controls?: boolean;
}

export default function AuthenticatedAudio({ src, className, controls = true }: AuthenticatedAudioProps) {
  const [audioSrc, setAudioSrc] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // If the src is not a proxy URL, use it directly
    if (!src || !src.includes('/api/v1/media/proxy/')) {
      setAudioSrc(src);
      setLoading(false);
      return;
    }

    const loadAudio = async () => {
      try {
        setLoading(true);
        setError(false);

        // Get the access token from localStorage
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          console.error('No access token found');
          setError(true);
          setLoading(false);
          return;
        }

        // Construct the full URL from the relative path
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://unicx-integration.vercel.app/api/v1';
        // Extract the base URL without the /api/v1 suffix
        const baseUrl = apiBaseUrl.replace(/\/api\/v1$/, '');
        const fullUrl = src.startsWith('/') ? `${baseUrl}${src}` : src;

        // Fetch the audio with authentication
        const response = await fetch(fullUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load audio: ${response.status}`);
        }

        // Convert the response to a blob
        const blob = await response.blob();
        
        // Create an object URL from the blob
        const objectUrl = URL.createObjectURL(blob);
        setAudioSrc(objectUrl);
        setLoading(false);
      } catch (err) {
        console.error('Error loading authenticated audio:', err);
        setError(true);
        setLoading(false);
      }
    };

    loadAudio();

    // Cleanup: revoke the object URL when component unmounts
    return () => {
      if (audioSrc && audioSrc.startsWith('blob:')) {
        URL.revokeObjectURL(audioSrc);
      }
    };
  }, [src]);

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 p-4`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 text-gray-500 p-4`}>
        <div className="text-center">
          <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <p className="mt-2 text-sm">Failed to load audio</p>
        </div>
      </div>
    );
  }

  return <audio src={audioSrc} className={className} controls={controls} />;
}

