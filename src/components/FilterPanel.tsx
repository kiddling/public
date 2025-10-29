import { useEffect, useState } from 'react';
import { FilterState, CardType, Difficulty } from '../types';
import { fetchAvailableTags, fetchAvailableLoops } from '../services/strapi';
import './FilterPanel.css';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const CARD_TYPES: CardType[] = ['Theory', 'Case Study', 'Student Work', 'AI Prompt', 'Extended Thinking'];
const DIFFICULTIES: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced'];

export const FilterPanel = ({ filters, onFilterChange }: FilterPanelProps) => {
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableLoops, setAvailableLoops] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [tags, loops] = await Promise.all([
          fetchAvailableTags(),
          fetchAvailableLoops(),
        ]);
        setAvailableTags(tags);
        setAvailableLoops(loops);
      } catch (error) {
        console.error('Failed to load filter options:', error);
      }
    };

    loadFilterOptions();
  }, []);

  const handleTypeToggle = (type: CardType) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type];
    onFilterChange({ ...filters, types: newTypes });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onFilterChange({ ...filters, tags: newTags });
  };

  const handleLoopToggle = (loop: string) => {
    const newLoops = filters.loops.includes(loop)
      ? filters.loops.filter(l => l !== loop)
      : [...filters.loops, loop];
    onFilterChange({ ...filters, loops: newLoops });
  };

  const handleDifficultyToggle = (difficulty: Difficulty) => {
    const newDifficulties = filters.difficulties.includes(difficulty)
      ? filters.difficulties.filter(d => d !== difficulty)
      : [...filters.difficulties, difficulty];
    onFilterChange({ ...filters, difficulties: newDifficulties });
  };

  const handleSearchChange = (search: string) => {
    onFilterChange({ ...filters, search });
  };

  const handleClearFilters = () => {
    onFilterChange({
      types: [],
      tags: [],
      loops: [],
      difficulties: [],
      search: '',
    });
  };

  const hasActiveFilters = 
    filters.types.length > 0 ||
    filters.tags.length > 0 ||
    filters.loops.length > 0 ||
    filters.difficulties.length > 0 ||
    filters.search !== '';

  return (
    <aside className="filter-panel">
      <div className="filter-header">
        <h2>Filters</h2>
        <button
          className="mobile-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label="Toggle filters"
        >
          {isExpanded ? '✕' : '☰'}
        </button>
      </div>

      <div className={`filter-content ${isExpanded ? 'expanded' : ''}`}>
        <div className="search-section">
          <label htmlFor="search-input" className="filter-label">
            Search
          </label>
          <input
            id="search-input"
            type="text"
            className="search-input"
            placeholder="Search cards..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="filter-section">
          <h3 className="filter-label">Card Type</h3>
          <div className="filter-options">
            {CARD_TYPES.map(type => (
              <label key={type} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.types.includes(type)}
                  onChange={() => handleTypeToggle(type)}
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h3 className="filter-label">Difficulty</h3>
          <div className="filter-options">
            {DIFFICULTIES.map(difficulty => (
              <label key={difficulty} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.difficulties.includes(difficulty)}
                  onChange={() => handleDifficultyToggle(difficulty)}
                />
                <span>{difficulty}</span>
              </label>
            ))}
          </div>
        </div>

        {availableLoops.length > 0 && (
          <div className="filter-section">
            <h3 className="filter-label">Loop</h3>
            <div className="filter-options">
              {availableLoops.map(loop => (
                <label key={loop} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.loops.includes(loop)}
                    onChange={() => handleLoopToggle(loop)}
                  />
                  <span>{loop}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {availableTags.length > 0 && (
          <div className="filter-section">
            <h3 className="filter-label">Tags</h3>
            <div className="filter-options tags-list">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  className={`tag-filter ${filters.tags.includes(tag) ? 'active' : ''}`}
                  onClick={() => handleTagToggle(tag)}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <button
            className="clear-filters-btn"
            onClick={handleClearFilters}
          >
            Clear All Filters
          </button>
        )}
      </div>
    </aside>
  );
};
