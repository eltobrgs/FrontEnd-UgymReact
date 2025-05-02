import { FC } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserData } from '../contexts/UserContext';

// Páginas do Usuário
import AlunoDashboard from '../pages/AlunoPages/AlunoDashboard';
import WorkoutPlan from '../pages/AlunoPages/AlunoTreino';
import AlunoProfile from '../pages/AlunoPages/AlunoProfile';
import AlunoReports from '../pages/AlunoPages/AlunoReports';
import AlunoDietPlan from '../pages/AlunoPages/AlunoDietPlan';
import AlunoPersonalList from '../pages/AlunoPages/AlunoPersonalList';
import Settings from '../pages/GeralPurposePages/Settings';
import ProfileSetup from '../pages/AcademiaPages/AlunoProfileSetup';

interface AlunoRoutesProps {
  userData: UserData | null;
}

const AlunoRoutes: FC<AlunoRoutesProps> = ({ userData }) => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <AlunoDashboard 
            userName={userData?.name || 'Usuário'} 
            stats={userData?.stats || { steps: 0, calories: 0, progress: 0 }} 
          />
        } 
      />
      <Route 
        path="/workout-plan" 
        element={<WorkoutPlan/>} 
      />
      <Route 
        path="/profile" 
        element={<AlunoProfile userName={userData?.name || 'Usuário'} />} 
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
        element={<AlunoReports userName={userData?.name || 'Usuário'} />} 
      />
      <Route 
        path="/diet-plan" 
        element={<AlunoDietPlan userName={userData?.name || 'Usuário'} />} 
      />
      <Route 
        path="/personals" 
        element={<AlunoPersonalList />} 
      />
      <Route 
        path="/settings" 
        element={<Settings userName={userData?.name || 'Usuário'} />} 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AlunoRoutes; 