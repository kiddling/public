import { KnowledgeCardData } from '../types';
import { KnowledgeCard } from './KnowledgeCard';
import './CardGrid.css';

interface CardGridProps {
  cards: KnowledgeCardData[];
  layout?: 'grid' | 'list';
}

export const CardGrid = ({ cards, layout = 'grid' }: CardGridProps) => {
  if (cards.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔍</div>
        <h3>No cards found</h3>
        <p>Try adjusting your filters or search query</p>
      </div>
    );
  }

  return (
    <div className={`card-grid layout-${layout}`}>
      {cards.map(card => (
        <KnowledgeCard key={card.id} card={card} layout={layout} />
      ))}
    </div>
  );
};
