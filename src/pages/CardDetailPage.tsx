import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { KnowledgeCardData } from '../types';
import { fetchKnowledgeCardById } from '../services/strapi';
import { copyToClipboard } from '../utils/clipboard';
import './CardDetailPage.css';

export const CardDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [card, setCard] = useState<KnowledgeCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const loadCard = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const data = await fetchKnowledgeCardById(id);
        setCard(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    loadCard();
  }, [id]);

  const handleCopyAIPrompt = async () => {
    if (!card?.aiPrompt) return;

    const success = await copyToClipboard(card.aiPrompt);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="card-detail-page">
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading card...</p>
        </div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="card-detail-page">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Error loading card</h3>
          <p>{error?.message || 'Card not found'}</p>
          <Link to="/cards" className="back-link">
            ← Back to Cards
          </Link>
        </div>
      </div>
    );
  }

  const cardUrl = window.location.href;

  return (
    <div className="card-detail-page">
      <div className="detail-container">
        <Link to="/cards" className="back-link">
          ← Back to Cards
        </Link>

        <article className="card-detail">
          <header className="detail-header">
            <div className="header-meta">
              <span className={`type-badge type-${card.type.toLowerCase().replace(' ', '-')}`}>
                {card.type}
              </span>
              <span className="difficulty-badge">{card.difficulty}</span>
            </div>

            <h1 className="detail-title">{card.title}</h1>

            {card.tags && card.tags.length > 0 && (
              <div className="detail-tags">
                {card.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {card.media && card.media.length > 0 && (
            <div className="detail-media">
              {card.media.map((media, index) => (
                <div key={index} className="media-item">
                  {media.type === 'image' && (
                    <img src={media.url} alt={media.alt || card.title} />
                  )}
                  {media.type === 'video' && (
                    <video controls poster={media.thumbnail}>
                      <source src={media.url} />
                      Your browser does not support the video tag.
                    </video>
                  )}
                  {media.type === 'pdf' && (
                    <div className="pdf-embed">
                      <iframe src={media.url} title={`PDF: ${card.title}`} />
                    </div>
                  )}
                  {media.isChinaSafe && (
                    <span className="china-safe-badge">🇨🇳 China Safe</span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="detail-content">
            <section className="description-section">
              <h2>Description</h2>
              <p>{card.description}</p>
            </section>

            {card.aiPrompt && (
              <section className="ai-prompt-section">
                <div className="section-header">
                  <h2>AI Prompt</h2>
                  <button
                    onClick={handleCopyAIPrompt}
                    className={`copy-btn ${copySuccess ? 'success' : ''}`}
                  >
                    {copySuccess ? '✓ Copied!' : '📋 Copy Prompt'}
                  </button>
                </div>
                <pre className="ai-prompt">{card.aiPrompt}</pre>
              </section>
            )}

            {card.externalLinks && card.externalLinks.length > 0 && (
              <section className="external-links-section">
                <h2>External Resources</h2>
                <ul className="external-links-list">
                  {card.externalLinks.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={link.isAccessible ? 'accessible' : 'inaccessible'}
                        title={!link.isAccessible ? link.fallbackText : undefined}
                      >
                        {link.title}
                        {!link.isAccessible && ' 🚫'}
                        {link.isChinaSafe && ' 🇨🇳'}
                      </a>
                      {!link.isAccessible && link.fallbackText && (
                        <p className="fallback-text">{link.fallbackText}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {card.downloadableAssets && card.downloadableAssets.length > 0 && (
              <section className="downloads-section">
                <h2>Downloads</h2>
                <ul className="downloads-list">
                  {card.downloadableAssets.map((asset) => (
                    <li key={asset.id}>
                      <a href={asset.url} download className="download-link">
                        <span className="download-icon">📥</span>
                        <div className="download-info">
                          <span className="download-name">{asset.name}</span>
                          {asset.size && (
                            <span className="download-size">{asset.size}</span>
                          )}
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {card.relatedLessons && card.relatedLessons.length > 0 && (
              <section className="related-lessons-section">
                <h2>Related Lessons</h2>
                <ul className="related-lessons-list">
                  {card.relatedLessons.map((lesson) => (
                    <li key={lesson.id}>
                      <Link to={`/lessons/${lesson.slug}`} className="lesson-link">
                        {lesson.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="qr-section">
            <h3>Share this card</h3>
            <div className="qr-code">
              <QRCodeSVG
                value={cardUrl}
                size={200}
                level="M"
                includeMargin={true}
              />
            </div>
            <p className="qr-label">Scan to view on mobile</p>
          </aside>
        </article>
      </div>
    </div>
  );
};
