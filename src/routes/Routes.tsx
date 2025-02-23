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

interface AppRoutesProps {
  userData: UserData | null;
}

const AppRoutes: FC<AppRoutesProps> = ({ userData }) => {
  const { isAuthenticated } = useAuth();
  const isPersonal = userData?.role === 'PERSONAL';
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simula um pequeno delay para evitar flash de conteúdo
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [userData]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Retorna as rotas específicas baseadas no tipo de usuário
  return isPersonal ? (
    <PersonalRoutes userData={userData} />
  ) : (
    <UserRoutes userData={userData} />
  );
};

export default AppRoutes; 