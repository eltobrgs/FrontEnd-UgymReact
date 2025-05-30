import { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AlunoLayout from './layouts/AlunoLayout';
import PersonalLayout from './layouts/PersonalLayout';
import AcademiaLayout from './layouts/AcademiaLayout';
import AppRoutes from './routes/Routes';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserProvider, useUser } from './contexts/UserContext';

// Componente de Loading
const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-600 mb-4"></div>
    <p className="text-xl text-gray-700 font-semibold">Carregando sua interface...</p>
    <p className="text-gray-500 mt-2">Por favor, aguarde um momento.</p>
  </div>
);

const AppContent = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { userData, setUserData } = useUser();
  const [isLayoutLoading, setIsLayoutLoading] = useState(true);
  
  // Inicializamos a sidebar como fechada por padrão
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Configuração inicial da sidebar baseada no tamanho da tela
    const handleInitialScreenSize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Executar o ajuste inicial quando o componente montar
    handleInitialScreenSize();

    // Configurar evento de resize para ajustar a sidebar quando a tela for redimensionada
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Adicionar listener de resize
    window.addEventListener('resize', handleResize);

    // Cleanup do listener quando o componente for desmontado
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setUserData(null);
      setIsLayoutLoading(false);
      return;
    }

    // Se temos userData, podemos mostrar o layout
    if (userData) {
      const timer = setTimeout(() => {
        setIsLayoutLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, userData, setUserData]);

  // Mostra loading enquanto verifica autenticação
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Se não está autenticado, mostra as rotas de auth
  if (!isAuthenticated) {
    return <AppRoutes userData={null} />;
  }

  // Mostra loading enquanto carrega os dados do usuário
  if (isLayoutLoading || !userData) {
    return <LoadingScreen />;
  }

  let Layout;
  switch (userData.role) {
    case 'PERSONAL':
      Layout = PersonalLayout;
      break;
    case 'ACADEMIA':
      Layout = AcademiaLayout;
      break;
    default:
      Layout = AlunoLayout;
  }

  return (
    <Layout
      userData={userData}
      isSidebarOpen={isSidebarOpen}
      onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
    >
      <AppRoutes userData={userData} />
    </Layout>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <UserProvider>
          <AppContent />
        </UserProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;