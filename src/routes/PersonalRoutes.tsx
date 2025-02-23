import { FC } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserData } from '../contexts/UserContext';

// Páginas do Personal
import PersonalProfile from '../pages/PersonalProfile/PersonalProfile';
import StudentList from '../pages/GeralStudentList/GeralStudentList';
import PersonalDashboard from '../pages/PersonalDashboard/PersonalDashboard';
import PersonalProfileSetup from '../pages/Auth/PersonalProfileSetup';
import MyStudentList from '../pages/ExpecStudentList/ExpecStudentList';
import Settings from '../pages/Settings/Settings';

interface PersonalRoutesProps {
  userData: UserData | null;
}

const PersonalRoutes: FC<PersonalRoutesProps> = ({ userData }) => {
  return (
    <Routes>
      <Route path="/" element={<PersonalDashboard />} />
      <Route path="/students" element={<StudentList />} />
      <Route path="/my-students" element={<MyStudentList />} />
      <Route path="/settings" element={<Settings userName={userData?.name || 'Personal'} />} />
      <Route path="/personal-profile" element={<PersonalProfile />} />
      <Route path="/edit-personal-profile" element={<PersonalProfileSetup />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default PersonalRoutes; 