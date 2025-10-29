import { render, screen, fireEvent } from '@testing-library/react';
import Lightbox from '@/components/Lightbox';
import { StudentWork } from '@/types/studentWork';

const mockWork: StudentWork = {
  id: 1,
  attributes: {
    title: 'Test Project',
    description: 'A test project description',
    studentName: 'John Doe',
    loop: '1',
    discipline: '环艺',
    grade: '大一',
    year: 2024,
    media: {
      data: {
        id: 1,
        attributes: {
          name: 'test.jpg',
          url: '/uploads/test.jpg',
          width: 800,
          height: 600,
        },
      },
    },
    allowDownload: true,
    allowShare: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    publishedAt: '2024-01-01',
  },
};

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => (
    <img alt={alt} src={src} />
  ),
}));

jest.mock('qrcode.react', () => ({
  __esModule: true,
  default: ({ value }: { value: string }) => <div data-testid="qr-code">{value}</div>,
}));

describe('Lightbox', () => {
  const mockOnClose = jest.fn();
  const mockOnNext = jest.fn();
  const mockOnPrevious = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnNext.mockClear();
    mockOnPrevious.mockClear();
  });

  it('should not render when closed', () => {
    render(
      <Lightbox
        work={mockWork}
        isOpen={false}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('Test Project')).not.toBeInTheDocument();
  });

  it('should render work details when open', () => {
    render(
      <Lightbox
        work={mockWork}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('A test project description')).toBeInTheDocument();
  });

  it('should display metadata correctly', () => {
    render(
      <Lightbox
        work={mockWork}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Loop:')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Discipline:')).toBeInTheDocument();
    expect(screen.getByText('环艺')).toBeInTheDocument();
    expect(screen.getByText('Grade:')).toBeInTheDocument();
    expect(screen.getByText('大一')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <Lightbox
        work={mockWork}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByLabelText('Close lightbox');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onNext when next button is clicked', () => {
    render(
      <Lightbox
        work={mockWork}
        isOpen={true}
        onClose={mockOnClose}
        onNext={mockOnNext}
      />
    );

    const nextButton = screen.getByLabelText('Next work');
    fireEvent.click(nextButton);

    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('should call onPrevious when previous button is clicked', () => {
    render(
      <Lightbox
        work={mockWork}
        isOpen={true}
        onClose={mockOnClose}
        onPrevious={mockOnPrevious}
      />
    );

    const prevButton = screen.getByLabelText('Previous work');
    fireEvent.click(prevButton);

    expect(mockOnPrevious).toHaveBeenCalledTimes(1);
  });

  it('should show download button when allowed', () => {
    render(
      <Lightbox
        work={mockWork}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByLabelText('Download image')).toBeInTheDocument();
  });

  it('should show share button when allowed', () => {
    render(
      <Lightbox
        work={mockWork}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByLabelText('Show QR code')).toBeInTheDocument();
  });

  it('should toggle QR code display', () => {
    render(
      <Lightbox
        work={mockWork}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByTestId('qr-code')).not.toBeInTheDocument();

    const shareButton = screen.getByLabelText('Show QR code');
    fireEvent.click(shareButton);

    expect(screen.getByTestId('qr-code')).toBeInTheDocument();
  });

  it('should handle keyboard navigation', () => {
    render(
      <Lightbox
        work={mockWork}
        isOpen={true}
        onClose={mockOnClose}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(mockOnNext).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(mockOnPrevious).toHaveBeenCalledTimes(1);
  });

  it('should not show navigation buttons when handlers not provided', () => {
    render(
      <Lightbox
        work={mockWork}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByLabelText('Next work')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Previous work')).not.toBeInTheDocument();
  });
});
