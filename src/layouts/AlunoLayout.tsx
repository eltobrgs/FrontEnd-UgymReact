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
        userImage={userData?.preferenciasAluno?.alunoAvatar}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AlunoHeader 
          userName={userData?.name || 'Usuário'} 
          userImage={userData?.preferenciasAluno?.alunoAvatar}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 pt-6 md:p-6 lg:p-8">
          <div className="lg:hidden h-10 md:h-6"></div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AlunoLayout; 