import { FC, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/PersonalSidebar/PersonalSidebar';
import Header from '../components/PersonalHeader/PersonalHeader';
import { UserData } from '../contexts/UserContext';

interface PersonalLayoutProps {
  children: ReactNode;
  userData: UserData | null;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const PersonalLayout: FC<PersonalLayoutProps> = ({ 
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
        userName={userData?.name || 'Personal'}
        userPlan="Personal Trainer"
        userImage={userData?.image}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          userName={userData?.name || 'Personal'}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PersonalLayout; 