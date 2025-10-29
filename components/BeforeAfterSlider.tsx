'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { getStrapiMediaUrl } from '@/lib/strapi';
import { StrapiMedia } from '@/types/studentWork';

interface BeforeAfterSliderProps {
  beforeImage: StrapiMedia;
  afterImage: StrapiMedia;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleStart = () => {
    setIsDragging(true);
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging]);

  const beforeUrl = getStrapiMediaUrl(beforeImage.attributes.url);
  const afterUrl = getStrapiMediaUrl(afterImage.attributes.url);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none touch-none"
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      role="img"
      aria-label="Before and after comparison slider"
    >
      <div className="absolute inset-0">
        <Image
          src={afterUrl}
          alt={afterImage.attributes.alternativeText || 'After'}
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />
      </div>

      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <Image
          src={beforeUrl}
          alt={beforeImage.attributes.alternativeText || 'Before'}
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />
      </div>

      <div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
          <div className="flex gap-1">
            <div className="w-0.5 h-4 bg-gray-700"></div>
            <div className="w-0.5 h-4 bg-gray-700"></div>
          </div>
        </div>
      </div>

      <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm pointer-events-none">
        Before
      </div>
      <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm pointer-events-none">
        After
      </div>
    </div>
  );
}
