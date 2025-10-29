import { useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { KnowledgeCardData } from '../types';
import { copyToClipboard } from '../utils/clipboard';
import clsx from 'clsx';
import './KnowledgeCard.css';

interface KnowledgeCardProps {
  card: KnowledgeCardData;
  layout?: 'grid' | 'list';
}

export const KnowledgeCard = ({ card, layout = 'grid' }: KnowledgeCardProps) => {
  const [showQR, setShowQR] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const cardUrl = `${window.location.origin}/cards/${card.id}`;

  const handleCopyAIPrompt = async () => {
    if (!card.aiPrompt) return;

    const success = await copyToClipboard(card.aiPrompt);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const getCardTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Theory': 'bg-blue-500',
      'Case Study': 'bg-green-500',
      'Student Work': 'bg-purple-500',
      'AI Prompt': 'bg-orange-500',
      'Extended Thinking': 'bg-red-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const renderMedia = () => {
    if (!card.media || card.media.length === 0) return null;

    const primaryMedia = card.media[0];

    switch (primaryMedia.type) {
      case 'image':
        return (
          <div className="card-media">
            {imageLoading && <div className="media-skeleton" />}
            <img
              src={primaryMedia.url}
              alt={primaryMedia.alt || card.title}
              loading="lazy"
              onLoad={() => setImageLoading(false)}
              className={clsx('card-image', imageLoading && 'loading')}
            />
            {primaryMedia.isChinaSafe && (
              <span className="china-safe-badge">🇨🇳 China Safe</span>
            )}
          </div>
        );
      case 'video':
        return (
          <div className="card-media">
            <img
              src={primaryMedia.thumbnail || primaryMedia.url}
              alt={primaryMedia.alt || card.title}
              loading="lazy"
              className="card-image"
            />
            <div className="video-badge">▶ Video</div>
          </div>
        );
      case 'pdf':
        return (
          <div className="card-media pdf-preview">
            <div className="pdf-badge">📄 PDF</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <article className={clsx('knowledge-card', `layout-${layout}`)}>
      <Link to={`/cards/${card.id}`} className="card-link">
        {renderMedia()}
        
        <div className="card-content">
          <div className="card-header">
            <span className={clsx('card-type-badge', getCardTypeColor(card.type))}>
              {card.type}
            </span>
            <span className="card-difficulty">{card.difficulty}</span>
          </div>

          <h3 className="card-title">{card.title}</h3>
          <p className="card-description">{card.description}</p>

          {card.tags && card.tags.length > 0 && (
            <div className="card-tags">
              {card.tags.map((tag, index) => (
                <span key={index} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {card.loop && (
            <div className="card-loop">
              <span className="loop-label">Loop:</span> {card.loop}
            </div>
          )}
        </div>
      </Link>

      <div className="card-actions">
        {card.type === 'AI Prompt' && card.aiPrompt && (
          <button
            onClick={handleCopyAIPrompt}
            className={clsx('action-btn', 'copy-btn', copySuccess && 'success')}
            aria-label="Copy AI Prompt"
          >
            {copySuccess ? '✓ Copied!' : '📋 Copy Prompt'}
          </button>
        )}

        <button
          onClick={() => setShowQR(!showQR)}
          className="action-btn qr-btn"
          aria-label="Toggle QR Code"
        >
          {showQR ? '✕' : '🔗'} QR Code
        </button>
      </div>

      {showQR && (
        <div className="qr-container">
          <QRCodeSVG
            value={cardUrl}
            size={128}
            level="M"
            includeMargin={true}
          />
          <p className="qr-label">Scan to view card</p>
        </div>
      )}

      {card.externalLinks && card.externalLinks.length > 0 && (
        <div className="external-links">
          {card.externalLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={clsx(
                'external-link',
                !link.isAccessible && 'inaccessible',
                link.isChinaSafe && 'china-safe'
              )}
              title={!link.isAccessible ? link.fallbackText : undefined}
            >
              {link.title}
              {!link.isAccessible && ' 🚫'}
              {link.isChinaSafe && ' 🇨🇳'}
            </a>
          ))}
        </div>
      )}
    </article>
  );
};
