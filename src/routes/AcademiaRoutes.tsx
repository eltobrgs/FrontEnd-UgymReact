import { FC } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserData } from '../contexts/UserContext';

// Páginas da Academia
import AcademiaDashboard from '../pages/AcademiaPages/AcademiaDashboard';
import AcademiaProfile from '../pages/AcademiaPages/AcademiaProfile';
import AcademiaProfileSetup from '../pages/Auth/AcademiaProfileSetup';
import AcademiaStudentList from '../pages/AcademiaPages/AcademiaStudentList';
import PersonalRegister from '../pages/AcademiaPages/PersonalRegister';
import StudentRegister from '../pages/AcademiaPages/AlunoRegister';
import AcademiaPersonalList from '../pages/AcademiaPages/AcademiaPersonalList';
import AcademiaEventos from '../pages/AcademiaPages/AcademiaEventos';
import Settings from '../pages/GeralPurposePages/Settings';
import TodoList from '../pages/GeralPurposePages/TodoList';


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
      <Route path="/students" element={<AcademiaStudentList />} />
      <Route path="/personals" element={<AcademiaPersonalList />} />
      <Route path="/eventos" element={<AcademiaEventos />} />
      <Route path="/PersonalRegister" element={<PersonalRegister />} />
      <Route path="/StudentRegister" element={<StudentRegister />} />
      <Route path="/todo-list" element={<TodoList />} />
      <Route path="/settings" element={<Settings userName={userData.name || ''} />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AcademiaRoutes; 