import { Qualities } from '@/enums/global.ts';
import { QualityType } from '@/types/global.ts';
import React, { useEffect, useState } from 'react';
import { musicApi, QualityInfo } from '@/api/music.api';

interface QualitySelectorProps {
  songId?: string;
  quality: string;
  onQualityChange: (quality: QualityType) => void;
  isPremium?: boolean;
  className?: string;
}

const QUALITY_LABELS: Record<string, { label: string; description: string }> = {
  '128': { label: '128kbps', description: 'Low quality' },
  '192': { label: '192kbps', description: 'Good quality' },
  '256': { label: '256kbps', description: 'High quality' },
  '320': { label: '320kbps', description: 'Very high quality' },
  'flac': { label: 'flac', description: 'Lossless (Premium)' },
};

const allQualities = Object.values(Qualities)

export const QualitySelector: React.FC<QualitySelectorProps> = ({
                                                                  songId,
                                                                  quality,
                                                                  isPremium = false,
                                                                  className = '',
                                                                  onQualityChange
                                                                }) => {
  const [_availableQualities, setAvailableQualities] = useState<QualityInfo[]>([]);
  const [unavailableQualities, setUnavailableQualities] = useState<QualityInfo[]>([]);
  const [_isLoading, setIsLoading] = useState(false);

  const fetchKnownQualities = async () => {
    if (!songId) return;

    setIsLoading(true);

    const res = await musicApi.getDetailedQualities(songId)

    setAvailableQualities(res.availableQualities)
    setUnavailableQualities(res.unavailableQualities)

    setIsLoading(false)
  };


  useEffect(() => {
    if (songId) fetchKnownQualities();
  }, [songId]);

  return (
    <div className={`w-screen bg-gray-600${className}`}>
      <h3>Audio Quality</h3>


      <div className="flex flex-col gap-4 ">
        {allQualities.map(q => {
          const isSelected = q === quality;
          const info = QUALITY_LABELS[q];
          const requiresPremium = q === 'flac' && !isPremium;
          const status = unavailableQualities?.find(e => (e.quality == q)) ? 'unavailable' : 'available';

          return (
            <button
              key={q}
              className={` ${status} ${isSelected ? 'selected' : ''}`}
              onClick={() => onQualityChange(q)}
              disabled={status === 'unavailable' || requiresPremium}
              title={
                requiresPremium
                  ? 'Premium subscription required'
                  : status === 'unavailable'
                    ? 'Not available'
                    : info.description
              }
            >
              <span className="quality-label">{info.label}</span>
              {isSelected && <span className="checkmark"></span>}
              {!isSelected && <span className="playing-indicator">🎵</span>}
              {requiresPremium && <span className="premium-badge">👑</span>}
              {status === 'unavailable' && <span className="unavailable-badge"></span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QualitySelector;