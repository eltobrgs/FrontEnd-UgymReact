import { FC, ReactNode } from 'react';
import Header from '../components/Header/Header';
import Sidebar from '../components/Sidebar/Sidebar';

interface MainLayoutProps {
  children: ReactNode;
  userData: {
    name: string;
    plan: string;
    image: string;
    stats: {
      progress: number;
    };
  };
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
        userName={userData.name}
        userPlan={userData.plan}
        userImage={userData.image}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Dashboard" 
          weeklyProgress={userData.stats.progress} 
          userName={userData.name}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 