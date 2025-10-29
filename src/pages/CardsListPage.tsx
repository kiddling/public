import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilterState } from '../types';
import { FilterPanel } from '../components/FilterPanel';
import { CardGrid } from '../components/CardGrid';
import { Pagination } from '../components/Pagination';
import { useKnowledgeCards } from '../hooks/useKnowledgeCards';
import { parseFiltersFromQuery, serializeFiltersToQuery } from '../utils/queryParams';
import './CardsListPage.css';

export const CardsListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState<FilterState>(() => {
    const parsed = parseFiltersFromQuery(searchParams);
    return {
      types: parsed.types || [],
      tags: parsed.tags || [],
      loops: parsed.loops || [],
      difficulties: parsed.difficulties || [],
      search: parsed.search || '',
    };
  });

  const { data, loading, error } = useKnowledgeCards(filters, page);

  useEffect(() => {
    const queryString = serializeFiltersToQuery(filters);
    const newParams = new URLSearchParams(queryString);
    if (page > 1) {
      newParams.set('page', page.toString());
    }
    setSearchParams(newParams, { replace: true });
  }, [filters, page, setSearchParams]);

  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam) {
      const parsedPage = parseInt(pageParam, 10);
      if (!isNaN(parsedPage) && parsedPage > 0) {
        setPage(parsedPage);
      }
    }
  }, [searchParams]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="cards-list-page">
      <header className="page-header">
        <div className="header-content">
          <h1>Knowledge Cards</h1>
          <p className="header-description">
            Explore our collection of educational resources with filtering, search, and QR codes
          </p>
        </div>

        <div className="layout-toggle">
          <button
            className={`layout-btn ${layout === 'grid' ? 'active' : ''}`}
            onClick={() => setLayout('grid')}
            aria-label="Grid view"
            title="Grid view"
          >
            ▦
          </button>
          <button
            className={`layout-btn ${layout === 'list' ? 'active' : ''}`}
            onClick={() => setLayout('list')}
            aria-label="List view"
            title="List view"
          >
            ☰
          </button>
        </div>
      </header>

      <div className="page-content">
        <FilterPanel filters={filters} onFilterChange={handleFilterChange} />

        <main className="cards-main">
          {loading && (
            <div className="loading-state">
              <div className="spinner" />
              <p>Loading cards...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h3>Error loading cards</h3>
              <p>{error.message}</p>
            </div>
          )}

          {!loading && !error && data && (
            <>
              <div className="results-header">
                <p className="results-count">
                  Showing {data.data.length} of {data.meta.pagination.total} cards
                </p>
              </div>

              <CardGrid cards={data.data} layout={layout} />

              <Pagination
                currentPage={page}
                totalPages={data.meta.pagination.pageCount}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
};
