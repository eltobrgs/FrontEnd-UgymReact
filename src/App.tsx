import { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import PersonalLayout from './layouts/PersonalLayout';
import AppRoutes from './routes/Routes';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserProvider, useUser } from './contexts/UserContext';

const AppContent = () => {
  const authContext = useAuth();
  const { userData, setUserData } = useUser();
  const isAuthenticated = authContext?.isAuthenticated ?? false;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setUserData(null);
    }
  }, [isAuthenticated, setUserData]);

  const isPersonal = userData?.role === 'PERSONAL';
  const Layout = isPersonal ? PersonalLayout : MainLayout;

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

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <Router>
          <AppContent />
        </Router>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;