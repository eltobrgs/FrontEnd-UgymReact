import { FC } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserData } from '../contexts/UserContext';

// Páginas do Personal
import PersonalDashboard from '../pages/PersonalPages/PersonalDashboard/PersonalDashboard';
import PersonalProfile from '../pages/PersonalPages/PersonalProfile/PersonalProfile';
import GeralStudentList from '../pages/GeralPurposePages/GeralStudentList/GeralStudentList';
import ExpecStudentList from '../pages/GeralPurposePages/ExpecStudentList/ExpecStudentList';
import Settings from '../pages/GeralPurposePages/Settings/Settings';

interface PersonalRoutesProps {
  userData: UserData | null;
}

const PersonalRoutes: FC<PersonalRoutesProps> = ({ userData }) => {
  return (
    <Routes>
      <Route path="/" element={<PersonalDashboard />} />
      <Route path="/students" element={<GeralStudentList />} />
      <Route path="/my-students" element={<ExpecStudentList />} />
      <Route path="/settings" element={<Settings userName={userData?.name || ''} />} />
      <Route path="/personal-profile" element={<PersonalProfile />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default PersonalRoutes; 