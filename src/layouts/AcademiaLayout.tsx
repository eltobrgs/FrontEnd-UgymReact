import { FC, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import AcademiaHeader from '../components/AcademiaComponents/AcademiaHeader';
import AcademiaSidebar from '../components/AcademiaComponents/AcademiaSidebar';
import { UserData } from '../contexts/UserContext';

interface AcademiaLayoutProps {
  children: ReactNode;
  userData: UserData | null;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const AcademiaLayout: FC<AcademiaLayoutProps> = ({ 
  children, 
  userData, 
  isSidebarOpen, 
  onToggleSidebar 
}) => {
  const location = useLocation();
  const isAuthRoute = location.pathname.includes('/auth');

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AcademiaSidebar
        userName={userData?.name || ''}
        isOpen={isSidebarOpen}
        onToggle={onToggleSidebar}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AcademiaHeader userName={userData?.name || ''} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 pt-6 md:p-6 lg:p-8">
          <div className="lg:hidden h-10 md:h-6"></div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AcademiaLayout; 