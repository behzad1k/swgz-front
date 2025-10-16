// @ts-nocheck
import Modal from '@components/common/Modal.tsx';
import { Check, Download, X } from 'lucide-react';
import { FC } from 'react';
interface DownloadManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DownloadManager: FC<DownloadManagerProps> = ({ isOpen, onClose }) => {
  const { downloads } = state;

  const handleCancelDownload = (songId: string): void => {
    const { [songId]: removed, ...remaining } = downloads.active;
    dispatch({ type: 'SET_DOWNLOADS', payload: { active: remaining } });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Download Manager" size="lg">
      <div className="space-y-6">
        {Object.keys(downloads.active).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Download size={20} className="text-purple-400" />
              Active Downloads
            </h3>
            <div className="space-y-3">
              {Object.entries(downloads.active).map(([id, download]) => (
                <div key={id} className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Song {id}</span>
                    <button onClick={() => handleCancelDownload(id)} className="text-red-400 hover:text-red-300">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all" style={{ width: `${download.progress}%` }} />
                  </div>
                  <div className="text-sm text-gray-400 mt-1">{download.progress}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {downloads.completed.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Check size={20} className="text-green-400" />
              Completed
            </h3>
            <div className="space-y-2">
              {downloads.completed.map((download, idx) => (
                <div key={idx} className="bg-white/5 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-white">Song {download.id}</span>
                  <Check size={20} className="text-green-400" />
                </div>
              ))}
            </div>
          </div>
        )}

        {Object.keys(downloads.active).length === 0 && downloads.completed.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Download size={48} className="mx-auto mb-4 opacity-50" />
            <p>No downloads yet</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DownloadManager;