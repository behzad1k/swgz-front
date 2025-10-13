import { useApp } from '@/contexts/AppContext.tsx';
import Button from '@components/common/Button.tsx';
import { X } from 'lucide-react';
import { FC, useState } from 'react';

interface SettingsPageProps {
  onClose: () => void;
}

const SettingsPage: FC<SettingsPageProps> = ({ onClose }) => {
  const { state, dispatch } = useApp();
  const [defaultQuality, setDefaultQuality] = useState(state.player.quality);

  const handleSave = (): void => {
    localStorage.setItem('preferred_quality', defaultQuality);
    dispatch({ type: 'SET_PLAYER', payload: { quality: defaultQuality } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={28} />
          </button>
        </div>
        <div className="space-y-6">
          <div className="bg-white/5 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Playback</h2>
            <div>
              <label className="text-gray-300 mb-2 block">Default Quality</label>
              <div className="flex gap-2">
                {(['128', '320', 'FLAC'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => setDefaultQuality(q)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      defaultQuality === q ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Button onClick={handleSave} className="w-full">Save Settings</Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;