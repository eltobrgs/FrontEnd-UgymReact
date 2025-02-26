import { FC } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserData } from '../contexts/UserContext';

// Páginas do Usuário
import Dashboard from '../pages/Dashboard/Dashboard';
import WorkoutPlan from '../pages/WorkoutPlan/WorkoutPlan';
import UserProfile from '../pages/UserProfile/UserProfile';
import Reports from '../pages/Reports/Reports';
import DietPlan from '../pages/DietPlan/DietPlan';
import PersonalList from '../pages/PersonalList/PersonalList';
import Settings from '../pages/Settings/Settings';
import ProfileSetup from '../pages/Auth/ProfileSetup';

interface UserRoutesProps {
  userData: UserData | null;
}

const UserRoutes: FC<UserRoutesProps> = ({ userData }) => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <Dashboard 
            userName={userData?.name || 'Usuário'} 
            stats={userData?.stats || { steps: 0, calories: 0, progress: 0 }} 
          />
        } 
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
        path="/edit-profile" 
        element={
          <ProfileSetup
            isOpen={true}
            onClose={() => window.history.back()}
            onSuccess={() => window.history.back()}
            userId={userData?.id?.toString() || ''}
            initialData={userData?.preferenciasAluno}
          />
        } 
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
        path="/personals" 
        element={<PersonalList />} 
      />
      <Route 
        path="/settings" 
        element={<Settings userName={userData?.name || 'Usuário'} />} 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default UserRoutes; 