import { FC } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserData } from '../contexts/UserContext';

// Páginas da Academia
import AcademiaDashboard from '../pages/AcademiaPages/AcademiaDashboard';
import AcademiaProfile from '../pages/AcademiaPages/AcademiaProfile';
import AcademiaProfileSetup from '../pages/Auth/AcademiaProfileSetup';
import AcademiaStudents from '../pages/GeralPurposePages/GeralStudentList/GeralStudentList';
import PersonalRegister from '../pages/Auth/PersonalRegister';
import StudentRegister from '../pages/Auth/AlunoRegister';
import PersonalList from '../pages/PersonalPages/PersonalList';
import Settings from '../pages/GeralPurposePages/Settings/Settings';


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
      <Route path="/students" element={<AcademiaStudents />} />
      <Route path="/personals" element={<PersonalList />} />
      <Route path="/PersonalRegister" element={<PersonalRegister />} />
      <Route path="/StudentRegister" element={<StudentRegister />} />
      <Route path="/settings" element={<Settings userName={userData.name || ''} />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AcademiaRoutes; 