import { FC } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserData } from '../contexts/UserContext';

// Páginas de Autenticação
import Login from '../pages/GeralPurposePages/Auth/Login';
import AcademiaRegister from '../pages/GeralPurposePages/Auth/AcademiaRegister';
import AcademiaProfileSetup from '../pages/GeralPurposePages/Auth/AcademiaProfileSetup';

// Rotas específicas
import UserRoutes from './AlunoRoutes';
import PersonalRoutes from './PersonalRoutes';
import AcademiaRoutes from './AcademiaRoutes';

interface AppRoutesProps {
  userData: UserData | null;
}

const AppRoutes: FC<AppRoutesProps> = ({ userData }) => {
  const { isAuthenticated } = useAuth();
  const isPersonal = userData?.role === 'PERSONAL';
  const isAcademia = userData?.role === 'ACADEMIA';

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/academia-register" element={<AcademiaRegister />} />
        <Route path="/auth/academia-profile-setup" element={<AcademiaProfileSetup />} />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    );
  }

  // Redireciona para a página inicial apropriada se tentar acessar rotas de autenticação
  // exceto para as rotas de setup de perfil
  if (window.location.pathname.startsWith('/auth') && 
      !window.location.pathname.includes('profile-setup')) {
    return <Navigate to="/" replace />;
  }

  // Retorna as rotas específicas baseadas no tipo de usuário
  if (isPersonal) {
    return <PersonalRoutes userData={userData} />;
  } else if (isAcademia) {
    return <AcademiaRoutes userData={userData} />;
  } else {
    return <UserRoutes userData={userData} />;
  }
};

export default AppRoutes; 