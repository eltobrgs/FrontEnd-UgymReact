import { FC, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserData } from '../contexts/UserContext';

// Páginas de Autenticação
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import ProfileSetup from '../pages/Auth/ProfileSetup';
import PersonalRegister from '../pages/Auth/PersonalRegister';
import PersonalProfileSetup from '../pages/Auth/PersonalProfileSetup';

// Rotas específicas
import UserRoutes from './UserRoutes';
import PersonalRoutes from './PersonalRoutes';

// Componente de Loading
const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-600 mb-4"></div>
    <p className="text-xl text-gray-700 font-semibold">Verificando suas credenciais...</p>
    <p className="text-gray-500 mt-2">Por favor, aguarde um momento.</p>
  </div>
);

interface AppRoutesProps {
  userData: UserData | null;
}

const AppRoutes: FC<AppRoutesProps> = ({ userData }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const isPersonal = userData?.role === 'PERSONAL';
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  useEffect(() => {
    // Simula um pequeno delay para evitar flash de conteúdo
    if (userData) {
      const timer = setTimeout(() => {
        setIsLoadingRole(false);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setIsLoadingRole(false);
    }
  }, [userData]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/profile-setup" element={<ProfileSetup />} />
        <Route path="/auth/personal-register" element={<PersonalRegister />} />
        <Route path="/auth/personal-profile-setup" element={<PersonalProfileSetup />} />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    );
  }

  // Redireciona para a página inicial apropriada se tentar acessar rotas de autenticação
  if (window.location.pathname.startsWith('/auth')) {
    return <Navigate to="/" replace />;
  }

  if (isLoadingRole) {
    return <LoadingScreen />;
  }

  // Retorna as rotas específicas baseadas no tipo de usuário
  return isPersonal ? (
    <PersonalRoutes userData={userData} />
  ) : (
    <UserRoutes userData={userData} />
  );
};

export default AppRoutes; 