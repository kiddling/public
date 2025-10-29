'use client';

import { StudentWorkFilters, Loop, Discipline } from '@/types/studentWork';
import { toggleFilterValue } from '@/lib/filterUtils';

interface GalleryFiltersProps {
  filters: StudentWorkFilters;
  onFiltersChange: (filters: StudentWorkFilters) => void;
}

const loops: Loop[] = ['1', '2', '3'];
const disciplines: Discipline[] = ['环艺', '产品', '视传', '数媒', '公艺'];

export default function GalleryFilters({
  filters,
  onFiltersChange,
}: GalleryFiltersProps) {
  const handleLoopToggle = (loop: Loop) => {
    const newLoop = toggleFilterValue(filters.loop, loop);
    onFiltersChange({ ...filters, loop: newLoop.length > 0 ? newLoop : undefined });
  };

  const handleDisciplineToggle = (discipline: Discipline) => {
    const newDiscipline = toggleFilterValue(filters.discipline, discipline);
    onFiltersChange({
      ...filters,
      discipline: newDiscipline.length > 0 ? newDiscipline : undefined,
    });
  };

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search: search || undefined });
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters =
    (filters.loop && filters.loop.length > 0) ||
    (filters.discipline && filters.discipline.length > 0) ||
    (filters.grade && filters.grade.length > 0) ||
    filters.search;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="search" className="block text-sm font-medium mb-2">
            Search by student name or project title
          </label>
          <input
            id="search"
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Enter name or title..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Loop</h3>
          <div className="flex gap-2 flex-wrap">
            {loops.map((loop) => (
              <button
                key={loop}
                onClick={() => handleLoopToggle(loop)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  filters.loop?.includes(loop)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                }`}
                aria-pressed={filters.loop?.includes(loop)}
              >
                Loop {loop}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Discipline</h3>
          <div className="flex gap-2 flex-wrap">
            {disciplines.map((discipline) => (
              <button
                key={discipline}
                onClick={() => handleDisciplineToggle(discipline)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  filters.discipline?.includes(discipline)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                }`}
                aria-pressed={filters.discipline?.includes(discipline)}
              >
                {discipline}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
