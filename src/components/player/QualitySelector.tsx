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

const allQualities = ['128', '192', '256', '320', 'flac'];

export const QualitySelector: React.FC<QualitySelectorProps> = ({
                                                                  songId,
                                                                  quality,
                                                                  onQualityChange,
                                                                  isPremium = false,
                                                                  className = '',
                                                                }) => {
  const [knownQualities, setKnownQualities] = useState<QualityInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchKnownQualities = async () => {
    if (!songId) return;

    setIsLoading(true);

    const res = await musicApi.getKnownQualities(songId)

    setKnownQualities(res)

    setIsLoading(false)
  };


  useEffect(() => {
    if (songId) fetchKnownQualities();
  })

  return (
    <div className={`quality-selector ${className}`}>
      <div className="quality-selector-header">
        <h3>Audio Quality</h3>
      </div>

      {/* Quick selector */}
      <div className="quality-options">
        {allQualities.map(q => {
          const isSelected = q === quality;
          const info = QUALITY_LABELS[q];
          const requiresPremium = q === 'flac' && !isPremium;

          return (
            <button
              key={q}
              className={`quality-option ${status} ${isSelected ? 'selected' : ''}`}
              // onClick={() => handleQualityClick(q)}
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
              {!isSelected && <span className="playing-indicator">🎵</span>}
              {requiresPremium && <span className="premium-badge">👑</span>}
              {status === 'unavailable' && <span className="unavailable-badge">✗</span>}
            </button>
          );
        })}
      </div>

      {/* Detailed quality info */}
      {/* {showDetails && ( */}
      {/*   <div className="quality-details"> */}
      {/*     {isLoading ? ( */}
      {/*       <div className="loading">Loading quality information...</div> */}
      {/*     ) : detailedQualities.length > 0 ? ( */}
      {/*       <table className="quality-table"> */}
      {/*         <thead> */}
      {/*         <tr> */}
      {/*           <th>Quality</th> */}
      {/*           <th>Format</th> */}
      {/*           <th>Size</th> */}
      {/*           <th>Status</th> */}
      {/*         </tr> */}
      {/*         </thead> */}
      {/*         <tbody> */}
      {/*         {detailedQualities.map(q => ( */}
      {/*           <tr key={q.quality} className={q.quality === quality ? 'selected' : ''}> */}
      {/*             <td>{QUALITY_LABELS[q.quality]?.label || q.quality}</td> */}
      {/*             <td>{q.format.toUpperCase()}</td> */}
      {/*             <td>{formatFileSize(q.size)}</td> */}
      {/*             <td> */}
      {/*                 <span className={`status-badge ${q.available ? 'available' : 'unavailable'}`}> */}
      {/*                   {q.available ? '✓ Available' : '✗ Not available'} */}
      {/*                 </span> */}
      {/*             </td> */}
      {/*           </tr> */}
      {/*         ))} */}
      {/*         </tbody> */}
      {/*       </table> */}
      {/*     ) : ( */}
      {/*       <div className="no-info">No quality information available yet</div> */}
      {/*     )} */}

      {/*     {unavailableQualities.length > 0 && ( */}
      {/*       <div className="unavailable-list"> */}
      {/*         <p>Not available on Soulseek:</p> */}
      {/*         <div className="unavailable-badges"> */}
      {/*           {unavailableQualities.map(q => ( */}
      {/*             <span key={q} className="unavailable-badge"> */}
      {/*               {QUALITY_LABELS[q]?.label || q} */}
      {/*             </span> */}
      {/*           ))} */}
      {/*         </div> */}
      {/*       </div> */}
      {/*     )} */}
      {/*   </div> */}
      {/* )} */}
    </div>
  );
};

export default QualitySelector;