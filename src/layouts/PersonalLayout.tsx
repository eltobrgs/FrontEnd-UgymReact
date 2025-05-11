import { FC, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import PersonalSidebar from '../components/PersonalComponents/PersonalSidebar';
import PersonalHeader from '../components/PersonalComponents/PersonalHeader';
import { UserData } from '../contexts/UserContext';
//SOCORRO DEUS
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
        userImage={userData?.preferenciasPersonal?.personalAvatar}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PersonalHeader 
          userName={userData?.name || 'Personal'}
          userImage={userData?.preferenciasPersonal?.personalAvatar}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 pt-6 md:p-6 lg:p-8">
          <div className="lg:hidden h-10 md:h-6"></div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default PersonalLayout; 


//deus me odeia