import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GalleryGrid from '@/components/GalleryGrid';
import { StudentWork } from '@/types/studentWork';
import { mockStudentWorks } from '@/lib/mockData';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => (
    <img alt={alt} src={src} />
  ),
}));

jest.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: jest.fn(), inView: true }),
}));

describe('Gallery Integration', () => {
  const mockOnWorkClick = jest.fn();

  beforeEach(() => {
    mockOnWorkClick.mockClear();
  });

  it('should render all works', () => {
    render(
      <GalleryGrid works={mockStudentWorks} onWorkClick={mockOnWorkClick} />
    );

    mockStudentWorks.forEach((work) => {
      expect(screen.getByText(work.attributes.title)).toBeInTheDocument();
      expect(screen.getByText(work.attributes.studentName)).toBeInTheDocument();
    });
  });

  it('should display work metadata badges', () => {
    render(
      <GalleryGrid works={mockStudentWorks} onWorkClick={mockOnWorkClick} />
    );

    expect(screen.getByText('Loop 1')).toBeInTheDocument();
    expect(screen.getByText('环艺')).toBeInTheDocument();
    expect(screen.getByText('大三')).toBeInTheDocument();
  });

  it('should call onWorkClick when work is clicked', () => {
    render(
      <GalleryGrid works={mockStudentWorks} onWorkClick={mockOnWorkClick} />
    );

    const firstWork = screen.getByText(mockStudentWorks[0].attributes.title);
    fireEvent.click(firstWork);

    expect(mockOnWorkClick).toHaveBeenCalledWith(mockStudentWorks[0]);
  });

  it('should handle keyboard navigation on work cards', () => {
    render(
      <GalleryGrid works={mockStudentWorks} onWorkClick={mockOnWorkClick} />
    );

    const firstCard = screen
      .getByText(mockStudentWorks[0].attributes.title)
      .closest('[role="button"]');

    if (firstCard) {
      fireEvent.keyDown(firstCard, { key: 'Enter' });
      expect(mockOnWorkClick).toHaveBeenCalledWith(mockStudentWorks[0]);

      mockOnWorkClick.mockClear();
      fireEvent.keyDown(firstCard, { key: ' ' });
      expect(mockOnWorkClick).toHaveBeenCalledWith(mockStudentWorks[0]);
    }
  });

  it('should show before/after badge when applicable', () => {
    const workWithComparison = mockStudentWorks.find(
      (w) => w.attributes.beforeImage && w.attributes.afterImage
    );

    if (workWithComparison) {
      render(
        <GalleryGrid works={[workWithComparison]} onWorkClick={mockOnWorkClick} />
      );

      expect(screen.getByText('Before/After')).toBeInTheDocument();
    }
  });

  it('should show empty state when no works', () => {
    render(<GalleryGrid works={[]} onWorkClick={mockOnWorkClick} />);

    expect(screen.getByText('No student works found.')).toBeInTheDocument();
    expect(
      screen.getByText('Try adjusting your filters or search query.')
    ).toBeInTheDocument();
  });

  it('should make work cards accessible', () => {
    render(
      <GalleryGrid works={mockStudentWorks} onWorkClick={mockOnWorkClick} />
    );

    const firstWork = mockStudentWorks[0];
    const card = screen.getByLabelText(
      `View ${firstWork.attributes.title} by ${firstWork.attributes.studentName}`
    );

    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('tabIndex', '0');
  });
});
