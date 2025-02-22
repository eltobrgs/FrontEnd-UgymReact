import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AppRoutes from './routes/AppRoutes';
import AuthRoutes from './routes/AuthRoutes';
import { AuthProvider, useAuth } from './contexts/AuthContext';
const AppContent = () => {
  const authContext = useAuth();
  const isAuthenticated = authContext?.isAuthenticated ?? false;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Mock data for demonstration
  const userData = {
    name: 'Nick Gonzalez',
    plan: 'Silver Plan',
    image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=500&h=500&fit=crop',
    stats: {
      steps: 9300,
      calories: 2900,
      progress: 86
    }
  };

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
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;