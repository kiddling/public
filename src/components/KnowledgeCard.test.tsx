import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { KnowledgeCard } from './KnowledgeCard';
import { KnowledgeCardData } from '../types';

const mockCard: KnowledgeCardData = {
  id: '1',
  title: 'Test Card',
  type: 'Theory',
  description: 'This is a test card',
  tags: ['test', 'sample'],
  difficulty: 'Beginner',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const mockCardWithAIPrompt: KnowledgeCardData = {
  ...mockCard,
  id: '2',
  type: 'AI Prompt',
  aiPrompt: 'Test AI prompt text',
};

const mockCardWithMedia: KnowledgeCardData = {
  ...mockCard,
  id: '3',
  media: [
    {
      type: 'image',
      url: 'https://example.com/image.jpg',
      alt: 'Test image',
      isChinaSafe: true,
    },
  ],
};

const renderCard = (card: KnowledgeCardData) => {
  return render(
    <BrowserRouter>
      <KnowledgeCard card={card} />
    </BrowserRouter>
  );
};

describe('KnowledgeCard', () => {
  it('renders card with basic information', () => {
    renderCard(mockCard);
    
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('This is a test card')).toBeInTheDocument();
    expect(screen.getByText('Theory')).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toBeInTheDocument();
  });

  it('renders tags correctly', () => {
    renderCard(mockCard);
    
    expect(screen.getByText('#test')).toBeInTheDocument();
    expect(screen.getByText('#sample')).toBeInTheDocument();
  });

  it('renders copy button for AI Prompt cards', () => {
    renderCard(mockCardWithAIPrompt);
    
    expect(screen.getByText('📋 Copy Prompt')).toBeInTheDocument();
  });

  it('shows QR code when QR button is clicked', () => {
    renderCard(mockCard);
    
    const qrButton = screen.getByText(/QR Code/);
    fireEvent.click(qrButton);
    
    expect(screen.getByText('Scan to view card')).toBeInTheDocument();
  });

  it('copies AI prompt to clipboard', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'isSecureContext', {
      value: true,
      writable: true,
      configurable: true,
    });

    renderCard(mockCardWithAIPrompt);
    
    const copyButton = screen.getByText('📋 Copy Prompt');
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('Test AI prompt text');
    });

    await waitFor(() => {
      expect(screen.getByText('✓ Copied!')).toBeInTheDocument();
    });
  });

  it('renders image media with China safe badge', () => {
    renderCard(mockCardWithMedia);
    
    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
    expect(screen.getByText('🇨🇳 China Safe')).toBeInTheDocument();
  });

  it('renders correct card type color classes', () => {
    renderCard(mockCard);
    
    const typeBadge = screen.getByText('Theory');
    expect(typeBadge).toHaveClass('bg-blue-500');
  });

  it('renders different layouts correctly', () => {
    const { container: gridContainer } = render(
      <BrowserRouter>
        <KnowledgeCard card={mockCard} layout="grid" />
      </BrowserRouter>
    );
    
    expect(gridContainer.querySelector('.layout-grid')).toBeInTheDocument();

    const { container: listContainer } = render(
      <BrowserRouter>
        <KnowledgeCard card={mockCard} layout="list" />
      </BrowserRouter>
    );
    
    expect(listContainer.querySelector('.layout-list')).toBeInTheDocument();
  });
});
