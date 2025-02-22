import { FC, ReactNode, useState } from 'react';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';

interface LayoutProps {
  children: ReactNode;
  userName: string;
  userPlan: string;
  userImage?: string;
  weeklyProgress?: number;
}

const Layout: FC<LayoutProps> = ({ 
  children, 
  userName, 
  userPlan, 
  userImage,
  weeklyProgress = 0 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar
        userName={userName}
        userPlan={userPlan}
        userImage={userImage}
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
      />
      <div className="lg:ml-64 min-h-screen flex flex-col transition-all duration-300">
        <Header weeklyProgress={weeklyProgress} userName={userName} />
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;