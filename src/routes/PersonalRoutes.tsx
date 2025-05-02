import { FC } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserData } from '../contexts/UserContext';

// Páginas do Personal
import PersonalDashboard from '../pages/PersonalPages/PersonalDashboard';
import PersonalProfile from '../pages/PersonalPages/PersonalProfile';
import PersonalStudentList from '../pages/PersonalPages/PersonalStudentList';
import LinkedStudentList from '../pages/PersonalPages/LinkedStudentList';
import PersonalGerenciaTreino from '../pages/PersonalPages/PersonalGerenciaTreino';
import PersonalGerenciaReports from '../pages/PersonalPages/PersonalGerenciaReports';
import Settings from '../pages/GeralPurposePages/Settings';

interface PersonalRoutesProps {
  userData: UserData | null;
}

const PersonalRoutes: FC<PersonalRoutesProps> = ({ userData }) => {
  return (
    <Routes>
      <Route path="/" element={<PersonalDashboard />} />
      <Route path="/students" element={<PersonalStudentList />} />
      <Route path="/my-students" element={<LinkedStudentList />} />
      <Route path="/settings" element={<Settings userName={userData?.name || ''} />} />
      <Route path="/personal-profile" element={<PersonalProfile />} />
      <Route path="/personal-gerencia-treino" element={<PersonalGerenciaTreino />} />
      <Route path="/personal-gerencia-reports" element={<PersonalGerenciaReports />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default PersonalRoutes; 