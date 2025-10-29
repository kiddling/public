'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, AlertCircle } from 'lucide-react';
import type { VideoEmbed as VideoEmbedType } from '@/types';

interface VideoEmbedProps {
  video: VideoEmbedType;
  autoplay?: boolean;
  lazyLoad?: boolean;
  privacyMode?: boolean;
}

export default function VideoEmbed({ 
  video, 
  autoplay = false,
  lazyLoad = true,
  privacyMode = true 
}: VideoEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(!lazyLoad);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lazyLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setIsLoaded(true);
        }
      },
      { rootMargin: '50px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [lazyLoad]);

  const getEmbedUrl = (): string => {
    const privacyParam = privacyMode ? '&privacy=1' : '';
    
    switch (video.platform) {
      case 'bilibili':
        return `https://player.bilibili.com/player.html?bvid=${video.videoId}&autoplay=${autoplay ? 1 : 0}${privacyParam}`;
      
      case 'tencent':
        return `https://v.qq.com/txp/iframe/player.html?vid=${video.videoId}&autoplay=${autoplay ? 1 : 0}`;
      
      case 'youtube':
        return `https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=${autoplay ? 1 : 0}${privacyParam}`;
      
      case 'vimeo':
        return `https://player.vimeo.com/video/${video.videoId}?autoplay=${autoplay ? 1 : 0}${privacyParam}`;
      
      default:
        return '';
    }
  };

  const handleLoad = () => {
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
  };

  const getPlatformName = (): string => {
    const names = {
      bilibili: '哔哩哔哩',
      tencent: '腾讯视频',
      youtube: 'YouTube',
      vimeo: 'Vimeo',
    };
    return names[video.platform];
  };

  return (
    <div ref={containerRef} className="relative w-full bg-gray-900 rounded-lg overflow-hidden">
      <div className="aspect-video relative">
        {!isLoaded && video.thumbnail && (
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setIsLoaded(true)}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 hover:bg-opacity-40 transition-opacity"
            >
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors">
                <Play className="w-10 h-10 text-white ml-1" />
              </div>
            </button>
          </div>
        )}

        {!isLoaded && !video.thumbnail && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <button
              onClick={() => setIsLoaded(true)}
              className="flex flex-col items-center gap-4 text-white hover:text-primary-400 transition-colors"
            >
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors">
                <Play className="w-10 h-10 text-white ml-1" />
              </div>
              <span className="text-lg">点击加载视频</span>
            </button>
          </div>
        )}

        {isLoaded && !hasError && (
          <iframe
            src={getEmbedUrl()}
            title={video.title}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={handleLoad}
            onError={handleError}
          />
        )}

        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-white p-6">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">视频加载失败</h3>
            <p className="text-gray-400 text-center mb-4">
              无法从 {getPlatformName()} 加载视频
            </p>
            <p className="text-sm text-gray-500 text-center">
              可能的原因：网络连接问题、视频不可用或平台限制
            </p>
            <button
              onClick={() => {
                setHasError(false);
                setIsLoaded(false);
                setTimeout(() => setIsLoaded(true), 100);
              }}
              className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              重新加载
            </button>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-800">
        <h3 className="text-white font-semibold mb-1">{video.title}</h3>
        <div className="flex justify-between items-center text-sm text-gray-400">
          <span>{getPlatformName()}</span>
          {video.duration && <span>{video.duration}</span>}
        </div>
      </div>
    </div>
  );
}

export function VideoGallery({ videos }: { videos: VideoEmbedType[] }) {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold font-chinese mb-6">视频资源</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videos.map(video => (
          <VideoEmbed key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}

export function VideoEmbedDemo() {
  const sampleVideos: VideoEmbedType[] = [
    {
      id: '1',
      platform: 'bilibili',
      videoId: 'BV1xx411c7mD',
      title: '设计思维工作坊',
      thumbnail: '/placeholder-video-1.jpg',
      duration: '15:32',
    },
    {
      id: '2',
      platform: 'tencent',
      videoId: 'v0123456789',
      title: '用户研究方法论',
      thumbnail: '/placeholder-video-2.jpg',
      duration: '22:15',
    },
  ];

  return <VideoGallery videos={sampleVideos} />;
}
