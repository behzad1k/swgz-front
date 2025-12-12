import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface TelegramContextType {
  webApp: any;
  user: TelegramUser | null;
  isReady: boolean;
  colorScheme: 'light' | 'dark';
  expand: () => void;
  close: () => void;
  showPopup: (params: any) => void;
  openLink: (url: string) => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

export const TelegramProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [webApp, setWebApp] = useState<any>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;

    if (tg) {
      tg.ready();
      tg.expand();

      // Disable vertical swipes to prevent closing
      tg.disableVerticalSwipes();

      setWebApp(tg);
      setUser(tg.initDataUnsafe?.user || null);
      setColorScheme(tg.colorScheme || 'dark');
      setIsReady(true);

      // Set theme colors
      tg.setHeaderColor('#111827');
      tg.setBackgroundColor('#111827');

      console.log('Telegram Mini App initialized:', tg.initDataUnsafe);
    } else {
      console.warn('Not running in Telegram environment');
      setIsReady(true); // Still allow app to work outside Telegram for development
    }
  }, []);

  const expand = () => webApp?.expand();
  const close = () => webApp?.close();
  const showPopup = (params: any) => webApp?.showPopup(params);
  const openLink = (url: string) => webApp?.openLink(url);
  const setHeaderColor = (color: string) => webApp?.setHeaderColor(color);
  const setBackgroundColor = (color: string) => webApp?.setBackgroundColor(color);

  return (
    <TelegramContext.Provider
      value={{
        webApp,
        user,
        isReady,
        colorScheme,
        expand,
        close,
        showPopup,
        openLink,
        setHeaderColor,
        setBackgroundColor,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within TelegramProvider');
  }
  return context;
};
