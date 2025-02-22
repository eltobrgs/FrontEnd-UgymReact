import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AppRoutes from './routes/AppRoutes';
import AuthRoutes from './routes/AuthRoutes';
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

  return (
    <Routes>
      <Route
        path="/auth/*"
        element={
          !isAuthenticated ? (
            <AuthRoutes />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <MainLayout
              userData={userData}
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <AppRoutes userData={userData} />
            </MainLayout>
          ) : (
            <Navigate to="/auth/login" replace />
          )
        }
      />
    </Routes>
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