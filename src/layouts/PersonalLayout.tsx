import { FC, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import PersonalSidebar from '../components/PersonalComponents/PersonalSidebar/PersonalSidebar';
import PersonalHeader from '../components/PersonalComponents/PersonalHeader/PersonalHeader';
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
      <PersonalSidebar
        isOpen={isSidebarOpen}
        onToggle={onToggleSidebar}
        userName={userData?.name || 'Usuário'}
        userPlan={userData?.plan || 'Plano Básico'}
        userImage={userData?.image || 'https://via.placeholder.com/50'}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PersonalHeader 
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