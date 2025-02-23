import { FC, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/UserSidebar/UserSidebar';
import Header from '../components/UserHeader/UserHeader';
import { UserData } from '../contexts/UserContext';

interface MainLayoutProps {
  children: ReactNode;
  userData: UserData | null;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const MainLayout: FC<MainLayoutProps> = ({ 
  children, 
  userData, 
  isSidebarOpen, 
  onToggleSidebar 
}) => {
  const location = useLocation();
  const isAuthRoute = location.pathname.startsWith('/auth');

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={onToggleSidebar}
        userName={userData?.name || 'Usuário'}
        userPlan={userData?.plan || 'Plano Básico'}
        userImage={userData?.image}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          userName={userData?.name || 'Usuário'}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 