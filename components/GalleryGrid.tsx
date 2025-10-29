'use client';

import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import { StudentWork } from '@/types/studentWork';
import { getStrapiMediaUrl } from '@/lib/strapi';

interface GalleryGridProps {
  works: StudentWork[];
  onWorkClick: (work: StudentWork) => void;
}

function GalleryCard({ work, onWorkClick }: { work: StudentWork; onWorkClick: (work: StudentWork) => void }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const media = Array.isArray(work.attributes.media?.data)
    ? work.attributes.media.data[0]
    : work.attributes.media?.data;

  const hasBeforeAfter =
    work.attributes.beforeImage?.data && work.attributes.afterImage?.data;

  return (
    <div
      ref={ref}
      className="group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer"
      onClick={() => onWorkClick(work)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onWorkClick(work);
        }
      }}
      aria-label={`View ${work.attributes.title} by ${work.attributes.studentName}`}
    >
      <div className="relative w-full aspect-[4/3] bg-gray-200">
        {inView && media ? (
          <Image
            src={getStrapiMediaUrl(
              media.attributes.formats?.medium?.url || media.attributes.url
            )}
            alt={media.attributes.alternativeText || work.attributes.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <div className="text-gray-400">No image</div>
          </div>
        )}
        {hasBeforeAfter && (
          <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
            Before/After
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">
          {work.attributes.title}
        </h3>
        <p className="text-gray-600 text-sm mb-2">{work.attributes.studentName}</p>
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Loop {work.attributes.loop}
          </span>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
            {work.attributes.discipline}
          </span>
          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
            {work.attributes.grade}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function GalleryGrid({ works, onWorkClick }: GalleryGridProps) {
  if (works.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No student works found.</p>
        <p className="text-gray-400 text-sm mt-2">
          Try adjusting your filters or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {works.map((work) => (
        <GalleryCard key={work.id} work={work} onWorkClick={onWorkClick} />
      ))}
    </div>
  );
}
