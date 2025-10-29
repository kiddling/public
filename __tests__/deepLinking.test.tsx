import { render, screen, fireEvent } from '@testing-library/react';
import KnowledgeCard from '@/components/examples/KnowledgeCard';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Deep Linking', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('should navigate to specific work', () => {
    render(
      <KnowledgeCard
        topic="Test Topic"
        content="Test content"
        relatedWorkId={123}
      />
    );

    const button = screen.getByText('View Example Work');
    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith('/gallery?work=123');
  });

  it('should navigate to gallery with discipline filter', () => {
    render(
      <KnowledgeCard
        topic="Test Topic"
        content="Test content"
        relatedDiscipline="环艺"
      />
    );

    const button = screen.getByText('Browse 环艺 Works');
    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/gallery?'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('discipline='));
  });

  it('should navigate to specific work with filters preserved', () => {
    render(
      <KnowledgeCard
        topic="Test Topic"
        content="Test content"
        relatedDiscipline="视传"
        relatedWorkId={456}
      />
    );

    const viewButton = screen.getByText('View Example Work');
    fireEvent.click(viewButton);

    expect(mockPush).toHaveBeenCalledWith('/gallery?work=456');
  });
});
