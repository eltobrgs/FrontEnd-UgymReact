import { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AppRoutes from './routes/AppRoutes';

function App() {
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

  // Estado para controlar se a sidebar está aberta ou fechada
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <MainLayout 
        userData={userData}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <AppRoutes userData={userData} />
      </MainLayout>
    </Router>
  );
}

export default App;