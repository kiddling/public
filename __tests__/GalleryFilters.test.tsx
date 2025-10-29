import { render, screen, fireEvent } from '@testing-library/react';
import GalleryFilters from '@/components/GalleryFilters';
import { StudentWorkFilters } from '@/types/studentWork';

describe('GalleryFilters', () => {
  const mockOnFiltersChange = jest.fn();

  beforeEach(() => {
    mockOnFiltersChange.mockClear();
  });

  it('should render all loop options', () => {
    render(<GalleryFilters filters={{}} onFiltersChange={mockOnFiltersChange} />);
    
    expect(screen.getByText('Loop 1')).toBeInTheDocument();
    expect(screen.getByText('Loop 2')).toBeInTheDocument();
    expect(screen.getByText('Loop 3')).toBeInTheDocument();
  });

  it('should render all discipline options', () => {
    render(<GalleryFilters filters={{}} onFiltersChange={mockOnFiltersChange} />);
    
    expect(screen.getByText('环艺')).toBeInTheDocument();
    expect(screen.getByText('产品')).toBeInTheDocument();
    expect(screen.getByText('视传')).toBeInTheDocument();
    expect(screen.getByText('数媒')).toBeInTheDocument();
    expect(screen.getByText('公艺')).toBeInTheDocument();
  });

  it('should highlight selected filters', () => {
    const filters: StudentWorkFilters = {
      loop: ['1'],
      discipline: ['环艺'],
    };

    render(<GalleryFilters filters={filters} onFiltersChange={mockOnFiltersChange} />);
    
    const loop1Button = screen.getByText('Loop 1').closest('button');
    expect(loop1Button).toHaveClass('bg-blue-600');
    
    const huanyiButton = screen.getByText('环艺').closest('button');
    expect(huanyiButton).toHaveClass('bg-blue-600');
  });

  it('should call onFiltersChange when loop is toggled', () => {
    render(<GalleryFilters filters={{}} onFiltersChange={mockOnFiltersChange} />);
    
    const loop1Button = screen.getByText('Loop 1');
    fireEvent.click(loop1Button);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ loop: ['1'] });
  });

  it('should call onFiltersChange when discipline is toggled', () => {
    render(<GalleryFilters filters={{}} onFiltersChange={mockOnFiltersChange} />);
    
    const disciplineButton = screen.getByText('环艺');
    fireEvent.click(disciplineButton);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ discipline: ['环艺'] });
  });

  it('should update search query', () => {
    render(<GalleryFilters filters={{}} onFiltersChange={mockOnFiltersChange} />);
    
    const searchInput = screen.getByPlaceholderText('Enter name or title...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ search: 'test search' });
  });

  it('should show clear button when filters are active', () => {
    const filters: StudentWorkFilters = { loop: ['1'] };
    render(<GalleryFilters filters={filters} onFiltersChange={mockOnFiltersChange} />);
    
    const clearButton = screen.getByText('Clear all');
    expect(clearButton).toBeInTheDocument();
  });

  it('should clear all filters when clear button is clicked', () => {
    const filters: StudentWorkFilters = {
      loop: ['1'],
      discipline: ['环艺'],
      search: 'test',
    };
    
    render(<GalleryFilters filters={filters} onFiltersChange={mockOnFiltersChange} />);
    
    const clearButton = screen.getByText('Clear all');
    fireEvent.click(clearButton);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({});
  });

  it('should not show clear button when no filters are active', () => {
    render(<GalleryFilters filters={{}} onFiltersChange={mockOnFiltersChange} />);
    
    expect(screen.queryByText('Clear all')).not.toBeInTheDocument();
  });
});
