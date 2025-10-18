import { Qualities } from '@/enums/global.ts';
import { QualityType } from '@/types/global.ts';
import { usePlayerActions } from '@hooks/actions/usePlayerActions.ts';
import { usePlayerQuality } from '@hooks/selectors/usePlayerSelectors.ts';
import { LOCAL_STORAGE_KEYS } from '@utils/constants.ts';
import { X } from '@/assets/svg';
import { getAltFromPath } from '@utils/helpers.ts';
import { FC } from 'react';

interface SettingsPageProps {
  onClose: () => void;
}

const SettingsPage: FC<SettingsPageProps> = ({ onClose }) => {
  const quality = usePlayerQuality();
  const { setQuality } = usePlayerActions()
  const handleSave = (newQuality: QualityType): void => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PREFERRED_QUALITY, newQuality);
    setQuality(newQuality)
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <img src={X} alt={getAltFromPath(X)} width={28} />
          </button>
        </div>
        <div className="space-y-6">
          <div className="bg-white/5 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Playback</h2>
            <div>
              <label className="text-gray-300 mb-2 block">Default Quality</label>
              <div className="flex gap-2">
                {Object.values(Qualities).map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSave(q)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      quality === q ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;