'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StudentWork, StudentWorkFilters } from '@/types/studentWork';
import { fetchStudentWorks } from '@/lib/strapi';
import { parseFiltersFromQuery, stringifyFiltersToQuery } from '@/lib/filterUtils';
import GalleryFilters from '@/components/GalleryFilters';
import GalleryGrid from '@/components/GalleryGrid';
import Lightbox from '@/components/Lightbox';

export default function GalleryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [works, setWorks] = useState<StudentWork[]>([]);
  const [filters, setFilters] = useState<StudentWorkFilters>({});
  const [selectedWork, setSelectedWork] = useState<StudentWork | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parsedFilters = parseFiltersFromQuery(searchParams);
    setFilters(parsedFilters);

    const workId = searchParams.get('work');
    if (workId && works.length > 0) {
      const work = works.find((w) => w.id === parseInt(workId));
      if (work) {
        setSelectedWork(work);
        setIsLightboxOpen(true);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    loadWorks();
  }, [filters]);

  const loadWorks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchStudentWorks(filters);
      setWorks(response.data);
    } catch (err) {
      setError('Failed to load student works. Please try again later.');
      console.error('Error loading works:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: StudentWorkFilters) => {
    setFilters(newFilters);
    const queryString = stringifyFiltersToQuery(newFilters);
    router.push(`/gallery${queryString ? `?${queryString}` : ''}`);
  };

  const handleWorkClick = (work: StudentWork) => {
    setSelectedWork(work);
    setIsLightboxOpen(true);
    const queryString = stringifyFiltersToQuery(filters);
    router.push(
      `/gallery?${queryString ? `${queryString}&` : ''}work=${work.id}`,
      { scroll: false }
    );
  };

  const handleCloseLightbox = () => {
    setIsLightboxOpen(false);
    setSelectedWork(null);
    const queryString = stringifyFiltersToQuery(filters);
    router.push(`/gallery${queryString ? `?${queryString}` : ''}`, {
      scroll: false,
    });
  };

  const handleNext = useCallback(() => {
    if (!selectedWork) return;
    const currentIndex = works.findIndex((w) => w.id === selectedWork.id);
    if (currentIndex < works.length - 1) {
      const nextWork = works[currentIndex + 1];
      setSelectedWork(nextWork);
      const queryString = stringifyFiltersToQuery(filters);
      router.push(
        `/gallery?${queryString ? `${queryString}&` : ''}work=${nextWork.id}`,
        { scroll: false }
      );
    }
  }, [selectedWork, works, filters, router]);

  const handlePrevious = useCallback(() => {
    if (!selectedWork) return;
    const currentIndex = works.findIndex((w) => w.id === selectedWork.id);
    if (currentIndex > 0) {
      const prevWork = works[currentIndex - 1];
      setSelectedWork(prevWork);
      const queryString = stringifyFiltersToQuery(filters);
      router.push(
        `/gallery?${queryString ? `${queryString}&` : ''}work=${prevWork.id}`,
        { scroll: false }
      );
    }
  }, [selectedWork, works, filters, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Student Gallery</h1>

        <GalleryFilters filters={filters} onFiltersChange={handleFiltersChange} />

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading student works...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-4 text-gray-600">
              Showing {works.length} {works.length === 1 ? 'work' : 'works'}
            </div>
            <GalleryGrid works={works} onWorkClick={handleWorkClick} />
          </>
        )}

        {selectedWork && (
          <Lightbox
            work={selectedWork}
            isOpen={isLightboxOpen}
            onClose={handleCloseLightbox}
            onNext={
              works.findIndex((w) => w.id === selectedWork.id) < works.length - 1
                ? handleNext
                : undefined
            }
            onPrevious={
              works.findIndex((w) => w.id === selectedWork.id) > 0
                ? handlePrevious
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
}
