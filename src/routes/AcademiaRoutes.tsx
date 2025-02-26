import { FC } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserData } from '../contexts/UserContext';

// Páginas da Academia
import AcademiaDashboard from '../pages/AcademiaDashboard/AcademiaDashboard';
import AcademiaProfile from '../pages/AcademiaProfile/AcademiaProfile';
import AcademiaProfileSetup from '../pages/Auth/AcademiaProfileSetup';
import GeralStudentList from '../pages/GeralStudentList/GeralStudentList';
import PersonalList from '../pages/PersonalList/PersonalList';
import PersonalRegister from '../pages/Auth/PersonalRegister';
import StudentRegister from '../pages/Auth/Register';
import Settings from '../pages/Settings/Settings';


interface AcademiaRoutesProps {
  userData: UserData | null;
}

const AcademiaRoutes: FC<AcademiaRoutesProps> = ({ userData }) => {
  if (!userData || userData.role !== 'ACADEMIA') {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<AcademiaDashboard />} />
      <Route path="/profile" element={<AcademiaProfile />} />
      <Route 
        path="/edit-academia-profile" 
        element={<AcademiaProfileSetup />} 
      />
      <Route path="/students" element={<GeralStudentList />} />
      <Route path="/personals" element={<PersonalList />} />
      <Route path="/PersonalRegister" element={<PersonalRegister />} />
      <Route path="/StudentRegister" element={<StudentRegister />} />
      <Route path="/settings" element={<Settings userName={userData.name || ''} />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AcademiaRoutes; 