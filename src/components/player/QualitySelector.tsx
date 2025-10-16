// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { musicApi, QualityInfo } from '@/api/music.api';

interface QualitySelectorProps {
  songId?: string;
  currentQuality: string;
  actualQuality?: string | null;
  availableQualities: string[];
  unavailableQualities: string[];
  onQualityChange: (quality: '128' | '192' | '256' | '320' | 'v0' | 'flac') => void;
  isPremium?: boolean;
  className?: string;
}

const QUALITY_LABELS: Record<string, { label: string; description: string }> = {
  '128': { label: '128kbps', description: 'Low quality' },
  '192': { label: '192kbps', description: 'Good quality' },
  '256': { label: '256kbps', description: 'High quality' },
  '320': { label: '320kbps', description: 'Very high quality' },
  'v0': { label: 'V0 VBR', description: 'Variable bitrate' },
  'flac': { label: 'flac', description: 'Lossless (Premium)' },
};

export const QualitySelector: React.FC<QualitySelectorProps> = ({
                                                                  songId,
                                                                  currentQuality,
                                                                  actualQuality,
                                                                  availableQualities,
                                                                  unavailableQualities,
                                                                  onQualityChange,
                                                                  isPremium = false,
                                                                  className = '',
                                                                }) => {
  const [detailedQualities, setDetailedQualities] = useState<QualityInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch detailed quality info when showing details
  useEffect(() => {
    if (showDetails && songId) {
      setIsLoading(true);
      musicApi.getAvailableQualities(songId)
      .then(info => {
        setDetailedQualities(info.availableQualities);
      })
      .catch(err => console.error('Failed to fetch quality details:', err))
      .finally(() => setIsLoading(false));
    }
  }, [showDetails, songId]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const isQualityAvailable = (quality: string) => {
    return availableQualities.includes(quality);
  };

  const isQualityUnavailable = (quality: string) => {
    return unavailableQualities.includes(quality);
  };

  const getQualityStatus = (quality: string) => {
    if (isQualityAvailable(quality)) return 'available';
    if (isQualityUnavailable(quality)) return 'unavailable';
    return 'unknown';
  };

  const handleQualityClick = (quality: string) => {
    // Prevent selecting FLAC if not premium
    if (quality === 'flac' && !isPremium) {
      alert('FLAC quality requires premium subscription');
      return;
    }

    // Warn if quality is unavailable
    if (isQualityUnavailable(quality)) {
      const fallback = availableQualities[0];
      if (fallback) {
        const confirmMsg = `${quality} is not available for this track. Use ${fallback} instead?`;
        if (window.confirm(confirmMsg)) {
          onQualityChange(fallback as any);
        }
      } else {
        alert(`${quality} quality is not available for this track`);
      }
      return;
    }

    onQualityChange(quality as any);
  };

  const allQualities = ['128', '192', '256', '320', 'v0', 'flac'];

  return (
    <div className={`quality-selector ${className}`}>
      <div className="quality-selector-header">
        <h3>Audio Quality</h3>
        {actualQuality && actualQuality !== currentQuality && (
          <span className="fallback-notice">
            ⚠️ Playing {actualQuality} (fallback)
          </span>
        )}
      </div>

      {/* Quick selector */}
      <div className="quality-options">
        {allQualities.map(q => {
          const status = getQualityStatus(q);
          const isSelected = q === currentQuality;
          const isActual = q === actualQuality;
          const info = QUALITY_LABELS[q];
          const requiresPremium = q === 'flac' && !isPremium;

          return (
            <button
              key={q}
              className={`quality-option ${status} ${isSelected ? 'selected' : ''} ${isActual ? 'actual' : ''}`}
              onClick={() => handleQualityClick(q)}
              disabled={status === 'unavailable' || requiresPremium}
              title={
                requiresPremium
                  ? 'Premium subscription required'
                  : status === 'unavailable'
                    ? 'Not available on Soulseek'
                    : info.description
              }
            >
              <span className="quality-label">{info.label}</span>
              {isSelected && <span className="checkmark">✓</span>}
              {isActual && !isSelected && <span className="playing-indicator">🎵</span>}
              {requiresPremium && <span className="premium-badge">👑</span>}
              {status === 'unavailable' && <span className="unavailable-badge">✗</span>}
            </button>
          );
        })}
      </div>

      {/* Toggle detailed view */}
      {songId && (
        <button
          className="toggle-details"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? '▼ Hide details' : '▶ Show details'}
        </button>
      )}

      {/* Detailed quality info */}
      {showDetails && (
        <div className="quality-details">
          {isLoading ? (
            <div className="loading">Loading quality information...</div>
          ) : detailedQualities.length > 0 ? (
            <table className="quality-table">
              <thead>
              <tr>
                <th>Quality</th>
                <th>Format</th>
                <th>Size</th>
                <th>Status</th>
              </tr>
              </thead>
              <tbody>
              {detailedQualities.map(q => (
                <tr key={q.quality} className={q.quality === currentQuality ? 'selected' : ''}>
                  <td>{QUALITY_LABELS[q.quality]?.label || q.quality}</td>
                  <td>{q.format.toUpperCase()}</td>
                  <td>{formatFileSize(q.size)}</td>
                  <td>
                      <span className={`status-badge ${q.available ? 'available' : 'unavailable'}`}>
                        {q.available ? '✓ Available' : '✗ Not available'}
                      </span>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          ) : (
            <div className="no-info">No quality information available yet</div>
          )}

          {unavailableQualities.length > 0 && (
            <div className="unavailable-list">
              <p>Not available on Soulseek:</p>
              <div className="unavailable-badges">
                {unavailableQualities.map(q => (
                  <span key={q} className="unavailable-badge">
                    {QUALITY_LABELS[q]?.label || q}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}


      <style jsx>{`
        .quality-selector {
          padding: 1rem;
          background: var(--bg-secondary, #1a1a1a);
          border-radius: 8px;
        }

        .quality-selector-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .quality-selector-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .fallback-notice {
          font-size: 0.85rem;
          color: var(--warning, #f59e0b);
          background: rgba(245, 158, 11, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .quality-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .quality-option {
          position: relative;
          padding: 0.75rem;
          background: var(--bg-tertiary, #2a2a2a);
          border: 2px solid transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .quality-option:hover:not(:disabled) {
          background: var(--bg-hover, #333);
          border-color: var(--primary, #3b82f6);
        }

        .quality-option.selected {
          background: var(--primary, #3b82f6);
          border-color: var(--primary, #3b82f6);
          color: white;
        }

        .quality-option.actual {
          border-color: var(--success, #10b981);
        }

        .quality-option.unavailable {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .quality-option:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .quality-label {
          display: block;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .checkmark,
        .playing-indicator,
        .premium-badge,
        .unavailable-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          font-size: 0.75rem;
        }

        .premium-badge {
          right: auto;
          left: 4px;
        }

        .toggle-details {
          width: 100%;
          padding: 0.5rem;
          background: transparent;
          border: 1px solid var(--border, #444);
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
        }

        .toggle-details:hover {
          background: var(--bg-tertiary, #2a2a2a);
        }

        .quality-details {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border, #444);
        }

        .quality-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        .quality-table th,
        .quality-table td {
          padding: 0.5rem;
          text-align: left;
          border-bottom: 1px solid var(--border, #444);
        }

        .quality-table th {
          font-weight: 600;
          color: var(--text-secondary, #999);
          font-size: 0.85rem;
        }

        .quality-table tr.selected {
          background: rgba(59, 130, 246, 0.1);
        }

        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-badge.available {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success, #10b981);
        }

        .status-badge.unavailable {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error, #ef4444);
        }

        .unavailable-list {
          margin-top: 1rem;
          padding: 0.75rem;
          background: rgba(239, 68, 68, 0.05);
          border-radius: 4px;
        }

        .unavailable-list p {
          margin: 0 0 0.5rem 0;
          font-size: 0.85rem;
          color: var(--text-secondary, #999);
        }

        .unavailable-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .unavailable-badges .unavailable-badge {
          position: static;
          padding: 0.25rem 0.5rem;
          background: rgba(239, 68, 68, 0.1);
          color: var(--error, #ef4444);
          border-radius: 4px;
          font-size: 0.8rem;
        }

        .loading,
        .no-info {
          text-align: center;
          padding: 1rem;
          color: var(--text-secondary, #999);
          font-size: 0.9rem;
        }

        @media (max-width: 640px) {
            .quality-options {
                grid-template-columns: repeat(2, 1fr);
            }

            .quality-selector {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                max-height: 50vh;
                overflow-y: auto;
            }
        }

        /* Tablet: 3 columns */
        @media (min-width: 641px) and (max-width: 1024px) {
            .quality-options {
                grid-template-columns: repeat(3, 1fr);
            }
        }

        /* Desktop: All in one row */
        @media (min-width: 1025px) {
            .quality-options {
                grid-template-columns: repeat(6, 1fr);
            }
        }
      `}</style>
    </div>
  );
};

export default QualitySelector;