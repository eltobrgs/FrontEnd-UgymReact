import { FC, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import AlunoSidebar from '../components/AlunoComponents/AlunoSidebar';
import AlunoHeader from '../components/AlunoComponents/AlunoHeader';
import { UserData } from '../contexts/UserContext';

interface AlunoLayoutProps {
  children: ReactNode;
  userData: UserData | null;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const AlunoLayout: FC<AlunoLayoutProps> = ({ 
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
      <AlunoSidebar
        isOpen={isSidebarOpen}
        onToggle={onToggleSidebar}
        userName={userData?.name || 'Usuário'}
        userPlan={userData?.plan || 'Plano Básico'}
        userImage={'https://via.placeholder.com/50'}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AlunoHeader userName={userData?.name || 'Usuário'} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AlunoLayout; 