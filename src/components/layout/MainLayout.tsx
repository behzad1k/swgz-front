import { FC, ReactNode } from 'react';
import Navigation from './Navigation';
import Header from './Header';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

const MainLayout: FC<MainLayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-gray-900">
      {title && <Header title={title} />}
      <main className="pb-40">
        {children}
      </main>
      <Navigation />
    </div>
  );
};

export default MainLayout;