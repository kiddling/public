'use client';

import Link from 'next/link';

interface LessonCardProps {
  title: string;
  description: string;
  relatedWorkId?: number;
}

export default function LessonCard({
  title,
  description,
  relatedWorkId,
}: LessonCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      
      {relatedWorkId && (
        <Link
          href={`/gallery?work=${relatedWorkId}`}
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          View Related Student Work
        </Link>
      )}
    </div>
  );
}
