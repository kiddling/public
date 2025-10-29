'use client';

import { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { StudentWork } from '@/types/studentWork';
import { getStrapiMediaUrl } from '@/lib/strapi';
import BeforeAfterSlider from './BeforeAfterSlider';
import QRCode from 'qrcode.react';

interface LightboxProps {
  work: StudentWork;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export default function Lightbox({
  work,
  isOpen,
  onClose,
  onNext,
  onPrevious,
}: LightboxProps) {
  const [showQR, setShowQR] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const media = Array.isArray(work.attributes.media?.data)
    ? work.attributes.media.data[0]
    : work.attributes.media?.data;

  const hasBeforeAfter =
    work.attributes.beforeImage?.data && work.attributes.afterImage?.data;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowRight':
          onNext?.();
          break;
        case 'ArrowLeft':
          onPrevious?.();
          break;
      }
    },
    [isOpen, onClose, onNext, onPrevious]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        onNext?.();
      } else {
        onPrevious?.();
      }
    }

    setTouchStart(null);
  };

  const handleDownload = async () => {
    if (!media || !work.attributes.allowDownload) return;

    const url = getStrapiMediaUrl(media.attributes.url);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${work.attributes.title}-${work.attributes.studentName}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/gallery?work=${work.id}`
      : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
          onClick={onClose}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white text-4xl z-10 hover:text-gray-300 transition-colors"
            aria-label="Close lightbox"
          >
            ×
          </button>

          {onPrevious && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrevious();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl z-10 hover:text-gray-300 transition-colors p-2"
              aria-label="Previous work"
            >
              ‹
            </button>
          )}

          {onNext && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl z-10 hover:text-gray-300 transition-colors p-2"
              aria-label="Next work"
            >
              ›
            </button>
          )}

          <div
            className="w-full h-full flex flex-col md:flex-row p-4 md:p-8 gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 relative flex items-center justify-center min-h-0">
              {hasBeforeAfter ? (
                <div className="w-full h-full max-w-4xl max-h-[80vh]">
                  <BeforeAfterSlider
                    beforeImage={work.attributes.beforeImage.data}
                    afterImage={work.attributes.afterImage.data}
                  />
                </div>
              ) : media ? (
                <div className="relative w-full h-full max-w-4xl max-h-[80vh]">
                  <Image
                    src={getStrapiMediaUrl(media.attributes.url)}
                    alt={media.attributes.alternativeText || work.attributes.title}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 80vw"
                    priority
                  />
                </div>
              ) : (
                <div className="text-white text-center">No image available</div>
              )}
            </div>

            <div className="md:w-80 bg-gray-900 text-white p-6 rounded-lg overflow-y-auto">
              <h2 className="text-2xl font-bold mb-2">{work.attributes.title}</h2>
              <p className="text-gray-300 mb-4">{work.attributes.studentName}</p>

              <div className="space-y-3 mb-6">
                <div>
                  <span className="text-gray-400 text-sm">Loop:</span>
                  <span className="ml-2">{work.attributes.loop}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Discipline:</span>
                  <span className="ml-2">{work.attributes.discipline}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Grade:</span>
                  <span className="ml-2">{work.attributes.grade}</span>
                </div>
                {work.attributes.year && (
                  <div>
                    <span className="text-gray-400 text-sm">Year:</span>
                    <span className="ml-2">{work.attributes.year}</span>
                  </div>
                )}
              </div>

              {work.attributes.description && (
                <div className="mb-6">
                  <h3 className="text-sm text-gray-400 mb-2">Description</h3>
                  <p className="text-sm leading-relaxed">{work.attributes.description}</p>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                {work.attributes.allowDownload && (
                  <button
                    onClick={handleDownload}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors text-sm"
                    aria-label="Download image"
                  >
                    Download
                  </button>
                )}
                {work.attributes.allowShare && (
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors text-sm"
                    aria-label="Show QR code"
                  >
                    Share QR
                  </button>
                )}
              </div>

              {showQR && work.attributes.allowShare && (
                <div className="mt-4 p-4 bg-white rounded flex justify-center">
                  <QRCode value={shareUrl} size={150} />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
