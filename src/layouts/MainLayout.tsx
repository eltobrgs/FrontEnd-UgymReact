import { FC, ReactNode } from 'react';
import Header from '../components/Header/Header';
import Sidebar from '../components/Sidebar/Sidebar';
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