'use client';

import { useDeepLink } from '@/hooks/useDeepLink';
import { Discipline } from '@/types/studentWork';

interface KnowledgeCardProps {
  topic: string;
  content: string;
  relatedDiscipline?: Discipline;
  relatedWorkId?: number;
}

export default function KnowledgeCard({
  topic,
  content,
  relatedDiscipline,
  relatedWorkId,
}: KnowledgeCardProps) {
  const { navigateToWork, navigateToGallery } = useDeepLink();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-2">{topic}</h3>
      <p className="text-gray-600 mb-4">{content}</p>
      
      <div className="flex gap-2">
        {relatedWorkId && (
          <button
            onClick={() => navigateToWork(relatedWorkId)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            View Example Work
          </button>
        )}
        
        {relatedDiscipline && (
          <button
            onClick={() => navigateToGallery({ discipline: [relatedDiscipline] })}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            Browse {relatedDiscipline} Works
          </button>
        )}
      </div>
    </div>
  );
}
