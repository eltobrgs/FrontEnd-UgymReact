import { FC } from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard/Dashboard';
import WorkoutPlan from '../pages/WorkoutPlan/WorkoutPlan';
import UserProfile from '../pages/UserProfile/UserProfile';
import Reports from '../pages/Reports/Reports';
import DietPlan from '../pages/DietPlan/DietPlan';
import Settings from '../pages/Settings/Settings';
import { UserData } from '../contexts/UserContext';

interface AppRoutesProps {
  userData: UserData | null;
}

const AppRoutes: FC<AppRoutesProps> = ({ userData }) => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={<Dashboard userName={userData?.name || 'Usuário'} stats={userData?.stats || { steps: 0, calories: 0, progress: 0 }} />} 
      />
      <Route 
        path="/workout-plan" 
        element={<WorkoutPlan userName={userData?.name || 'Usuário'} />} 
      />
      <Route 
        path="/profile" 
        element={<UserProfile userName={userData?.name || 'Usuário'} />} 
      />
      <Route 
        path="/reports" 
        element={<Reports userName={userData?.name || 'Usuário'} />} 
      />
      <Route 
        path="/diet-plan" 
        element={<DietPlan userName={userData?.name || 'Usuário'} />} 
      />
      <Route 
        path="/settings" 
        element={<Settings userName={userData?.name || 'Usuário'} />} 
      />
    </Routes>
  );
};

export default AppRoutes; 