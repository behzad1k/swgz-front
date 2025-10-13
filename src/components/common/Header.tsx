import { FC } from 'react';
import { useNavigate } from '@/router/hooks';
import { useCurrentRoute } from '@/router/hooks';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
  rightContent?: React.ReactNode;
  onBack?: () => void;
}

const PageHeader: FC<PageHeaderProps> = ({
                                           title: customTitle,
                                           description: customDescription,
                                           showBackButton: customShowBackButton,
                                           rightContent,
                                           onBack
                                         }) => {
  const navigate = useNavigate();
  const currentRoute = useCurrentRoute();

  // Use custom props or fall back to route config
  const title = customTitle ?? currentRoute?.title ?? 'Page';
  const description = customDescription ?? currentRoute?.description;
  const showBackButton = customShowBackButton ?? currentRoute?.headerBackButton ?? false;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-lg border-b border-white/10">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3 flex-1">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={24} />
            </button>
          )}

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {description && (
              <p className="text-sm text-gray-400 mt-1">{description}</p>
            )}
          </div>
        </div>

        {rightContent && (
          <div className="flex items-center gap-2">
            {rightContent}
          </div>
        )}
      </div>
    </header>
  );
};

export default PageHeader;