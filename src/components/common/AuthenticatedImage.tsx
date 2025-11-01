'use client';

import { useEffect, useState } from 'react';

interface AuthenticatedImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function AuthenticatedImage({ src, alt, className }: AuthenticatedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // If the src is not a proxy URL, use it directly
    if (!src || !src.includes('/api/v1/media/proxy/')) {
      setImageSrc(src);
      setLoading(false);
      return;
    }

    const loadImage = async () => {
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

        // Fetch the image with authentication
        const response = await fetch(fullUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load image: ${response.status}`);
        }

        // Convert the response to a blob
        const blob = await response.blob();
        
        // Create an object URL from the blob
        const objectUrl = URL.createObjectURL(blob);
        setImageSrc(objectUrl);
        setLoading(false);
      } catch (err) {
        console.error('Error loading authenticated image:', err);
        setError(true);
        setLoading(false);
      }
    };

    loadImage();

    // Cleanup: revoke the object URL when component unmounts
    return () => {
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [src]);

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 text-gray-500`}>
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-2 text-sm">Failed to load image</p>
        </div>
      </div>
    );
  }

  return <img src={imageSrc} alt={alt} className={className} />;
}

