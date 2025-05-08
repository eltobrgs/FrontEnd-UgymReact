import { FC, useState } from 'react';
import { useUser } from '../../../contexts/UserContext';
import AlunoProfileSetup from '../../../pages/AcademiaPages/AlunoProfileSetup';
import { FaWeight, FaRulerVertical, FaRunning, FaBullseye, FaBirthdayCake, FaUser, FaDumbbell } from 'react-icons/fa';
import StudentDetailModal from './StudentDetailModal';
import WorkoutEditModal from './WorkoutEditModal';

interface StudentCardProps {
  id: number;
  name: string;
  age: number | string;
  weight: string;
  height: string;
  goal: string;
  trainingTime: string;
  imageUrl?: string;
  gender?: string;
  healthCondition?: string;
  experience?: string;
  activityLevel?: string;
  medicalConditions?: string;
  physicalLimitations?: string;
}

const StudentCard: FC<StudentCardProps> = ({
  id,
  name,
  age,
  weight,
  height,
  goal,
  trainingTime,
  imageUrl = 'https://via.placeholder.com/150',
  gender = '',
  healthCondition = '',
  experience = '',
  activityLevel = '',
  medicalConditions = '',
  physicalLimitations = ''
}) => {
  const { userData } = useUser();
  const [_isLoading, _setIsLoading] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Evita navegação quando clicamos no botão de edição ou gerenciar treino
    if (e.target instanceof HTMLElement && 
        (e.target.closest('button') || e.target.tagName === 'svg' || e.target.tagName === 'path')) {
      return;
    }
    // Em vez de navegar, mostramos o modal de detalhes
    setShowDetailModal(true);
  };

  const handleProfileSetupSuccess = () => {
    setShowProfileSetup(false);
  };

  const handleManageWorkout = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowWorkoutModal(true);
  };

  return (
    <>
      <div 
        className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition hover:shadow-xl mb-4"
        onClick={handleCardClick}
      >
        <div className="relative">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{name}</h3>
              <div className="flex space-x-2">
                {userData?.role === 'PERSONAL' && (
                  <button
                    className="bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition-colors z-10"
                    onClick={handleManageWorkout}
                    title="Gerenciar Treino"
                  >
                    <FaDumbbell size={16} color="white" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center text-gray-700">
              <FaUser className="mr-2 text-red-600 flex-shrink-0" />
              <span className="font-medium text-sm">Identificação: {id}</span>
            </div>
            
            <div className="flex items-center text-gray-700">
              <FaBirthdayCake className="mr-2 text-red-600 flex-shrink-0" />
              <span className="font-medium text-sm">{age} anos</span>
            </div>
            
            <div className="flex items-center text-gray-700">
              <FaWeight className="mr-2 text-red-600 flex-shrink-0" />
              <span className="text-sm">
                {weight === 'Dados em relatórios' ? 'Peso: Ver nos relatórios' : `Peso: ${weight}`}
              </span>
            </div>
            
            <div className="flex items-center text-gray-700">
              <FaRulerVertical className="mr-2 text-red-600 flex-shrink-0" />
              <span className="text-sm">
                {height === 'Dados em relatórios' ? 'Altura: Ver nos relatórios' : `Altura: ${height}`}
              </span>
            </div>
            
            <div className="flex items-center text-gray-700">
              <FaRunning className="mr-2 text-red-600 flex-shrink-0" />
              <span className="text-sm">Exp: {trainingTime}</span>
            </div>
          </div>

          <div className="border-t pt-3 mt-2">
            <div className="flex items-center text-gray-700">
              <FaBullseye className="mr-2 text-red-600 flex-shrink-0" />
              <span className="text-sm font-medium">Objetivo: {goal}</span>
            </div>
          </div>
        </div>
      </div>

      {showProfileSetup && (
        <AlunoProfileSetup
          isOpen={showProfileSetup}
          onClose={() => setShowProfileSetup(false)}
          onSuccess={handleProfileSetupSuccess}
          userId={id.toString()}
        />
      )}

      {/* Modal de detalhes do aluno */}
      <StudentDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        student={{
          id,
          name,
          age,
          weight,
          height,
          goal,
          trainingTime,
          imageUrl,
          gender,
          healthCondition,
          experience,
          activityLevel,
          medicalConditions,
          physicalLimitations
        }}
      />

      {/* Modal de edição de treino */}
      {showWorkoutModal && (
        <WorkoutEditModal
          isOpen={showWorkoutModal}
          onClose={() => setShowWorkoutModal(false)}
          alunoId={id}
          alunoName={name}
        />
      )}
    </>
  );
};

export default StudentCard; 