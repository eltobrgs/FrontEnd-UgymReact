import { FC } from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard/Dashboard';
import WorkoutPlan from '../pages/WorkoutPlan/WorkoutPlan';
import UserProfile from '../pages/UserProfile/UserProfile';
import Reports from '../pages/Reports/Reports';
import DietPlan from '../pages/DietPlan/DietPlan';
import Settings from '../pages/Settings/Settings';

interface AppRoutesProps {
  userData: {
    name: string;
    stats: {
      steps: number;
      calories: number;
      progress: number;
    };
  };
}

const AppRoutes: FC<AppRoutesProps> = ({ userData }) => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={<Dashboard userName={userData.name} stats={userData.stats} />} 
      />
      <Route 
        path="/workout-plan" 
        element={<WorkoutPlan userName={userData.name} />} 
      />
      <Route 
        path="/profile" 
        element={<UserProfile userName={userData.name} />} 
      />
      <Route 
        path="/reports" 
        element={<Reports userName={userData.name} />} 
      />
      <Route 
        path="/diet-plan" 
        element={<DietPlan userName={userData.name} />} 
      />
      <Route 
        path="/settings" 
        element={<Settings userName={userData.name} />} 
      />
    </Routes>
  );
};

export default AppRoutes; 