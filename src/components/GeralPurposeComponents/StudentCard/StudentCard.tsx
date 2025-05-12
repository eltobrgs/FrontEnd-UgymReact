import { FC, useState, useEffect } from 'react';
import { useUser } from '../../../contexts/UserContext';
import AlunoProfileSetup from '../../../pages/AcademiaPages/AlunoProfileSetup';
import { FaWeight, FaRulerVertical, FaRunning, FaBullseye, FaBirthdayCake, FaDumbbell, FaUserCircle, FaCalculator, FaTrash, FaUnlink, FaUserTie } from 'react-icons/fa';
import StudentDetailModal from './StudentDetailModal';
import WorkoutEditModal from './WorkoutEditModal';
import Swal from 'sweetalert2';
import { connectionUrl } from '../../../config/connection';

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
  imc?: string;
  onDelete?: () => void;
  showUnlinkFromPersonal?: boolean;
  onUnlinkFromPersonal?: () => void;
}

const StudentCard: FC<StudentCardProps> = ({
  id,
  name,
  age,
  weight,
  height,
  goal,
  trainingTime,
  imageUrl,
  gender = '',
  healthCondition = '',
  experience = '',
  activityLevel = '',
  medicalConditions = '',
  physicalLimitations = '',
  imc = 'Não calculado',
  onDelete,
  showUnlinkFromPersonal = false,
  onUnlinkFromPersonal
}) => {
  const { userData } = useUser();
  const [_isLoading, _setIsLoading] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isAcademia = userData?.role === 'ACADEMIA';
  const isPersonal = userData?.role === 'PERSONAL';

  // Efeito para logar informações da imagem para depuração
  useEffect(() => {
    console.log(`[StudentCard] ID: ${id}, Nome: ${name}, ImageUrl:`, imageUrl);
  }, [id, name, imageUrl]);

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

  const handleImageError = () => {
    console.error(`[StudentCard] Erro ao carregar imagem para ${name} (ID: ${id}), URL: ${imageUrl}`);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log(`[StudentCard] Imagem carregada com sucesso para ${name} (ID: ${id})`);
  };

  const handleDeleteStudent = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const result = await Swal.fire({
      title: 'Confirmar exclusão',
      text: `Deseja realmente desvincular ${name} da academia? Isso também removerá a associação com qualquer personal vinculado.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, desvincular',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token não encontrado');

        const response = await fetch(`${connectionUrl}/desvincular-aluno-academia/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao desvincular aluno');
        }

        Swal.fire('Sucesso', `${name} foi desvinculado da academia com sucesso!`, 'success');
        
        // Chamar a função de callback para atualizar a lista
        if (onDelete) onDelete();
      } catch (error) {
        console.error('Erro ao desvincular aluno:', error);
        Swal.fire('Erro', `Falha ao desvincular aluno: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'error');
      }
    }
  };

  const handleUnlinkFromPersonal = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const result = await Swal.fire({
      title: 'Confirmar desvinculação',
      text: `Deseja realmente desvincular ${name} dos seus alunos?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, desvincular',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token não encontrado');

        const response = await fetch(`${connectionUrl}/desvincular-aluno-personal/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao desvincular aluno');
        }

        Swal.fire('Sucesso', `${name} foi desvinculado dos seus alunos com sucesso!`, 'success');
        
        // Chamar a função de callback para atualizar a lista
        if (onUnlinkFromPersonal) onUnlinkFromPersonal();
      } catch (error) {
        console.error('Erro ao desvincular aluno do personal:', error);
        Swal.fire('Erro', `Falha ao desvincular aluno: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'error');
      }
    }
  };

  // Função para determinar a categoria do IMC
  const getBMICategory = () => {
    if (!imc || imc === 'Não calculado') return null;
    
    const bmiValue = parseFloat(imc);
    if (isNaN(bmiValue)) return null;
    
    if (bmiValue < 18.5) return 'Abaixo do peso';
    if (bmiValue < 25) return 'Peso normal';
    if (bmiValue < 30) return 'Sobrepeso';
    if (bmiValue < 35) return 'Obesidade Grau I';
    if (bmiValue < 40) return 'Obesidade Grau II';
    return 'Obesidade Grau III';
  };
  
  // Determinar a cor do badge do IMC
  const getBMIColor = () => {
    if (!imc || imc === 'Não calculado') return 'bg-gray-200 text-gray-700';
    
    const bmiValue = parseFloat(imc);
    if (isNaN(bmiValue)) return 'bg-gray-200 text-gray-700';
    
    if (bmiValue < 18.5) return 'bg-blue-100 text-blue-800';
    if (bmiValue < 25) return 'bg-green-100 text-green-800';
    if (bmiValue < 30) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };
  
  const bmiCategory = getBMICategory();
  const bmiColor = getBMIColor();

  return (
    <>
      <div 
        className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition hover:shadow-xl hover:scale-[1.02] mb-4"
        onClick={handleCardClick}
      >
        <div className="relative">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={`Foto de ${name}`}
              className="w-full h-56 object-cover"
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          ) : (
            <div className="w-full h-56 bg-gradient-to-r from-red-50 to-red-100 flex items-center justify-center">
              <FaUserCircle className="text-red-300" size={80} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-70"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white drop-shadow-md">{name}</h3>
              <div className="flex space-x-2">
                {isPersonal && (
                  <button
                    className="bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition-colors z-10 shadow-md"
                    onClick={handleManageWorkout}
                    title="Gerenciar Treino"
                  >
                    <FaDumbbell size={16} color="white" />
                  </button>
                )}
                {isAcademia && (
                  <button
                    className="bg-red-600 p-2 rounded-full hover:bg-red-700 transition-colors z-10 shadow-md"
                    onClick={handleDeleteStudent}
                    title="Desvincular Aluno"
                  >
                    <FaTrash size={16} color="white" />
                  </button>
                )}
                {showUnlinkFromPersonal && (
                  <button
                    className="bg-orange-600 p-2 rounded-full hover:bg-orange-700 transition-colors z-10 shadow-md"
                    onClick={handleUnlinkFromPersonal}
                    title="Desvincular Aluno"
                  >
                    <FaUnlink size={16} color="white" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center">
              <FaUserTie className="text-red-500 mr-2" />
              <span className="text-sm text-gray-700">identificação: {id} </span>
            </div>
            <div className="flex items-center">
              <FaBirthdayCake className="text-red-500 mr-2" />
              <span className="text-sm text-gray-700">{age} anos</span>
            </div>
            <div className="flex items-center">
              <FaWeight className="text-red-500 mr-2" />
              <span className="text-sm text-gray-700">{weight}</span>
            </div>
            <div className="flex items-center">
              <FaRulerVertical className="text-red-500 mr-2" />
              <span className="text-sm text-gray-700">{height}</span>
            </div>
            <div className="flex items-center">
              <FaRunning className="text-red-500 mr-2" />
              <span className="text-sm text-gray-700">{trainingTime}</span>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center">
              <FaBullseye className="text-red-500 mr-2" />
              <span className="text-sm text-gray-700 line-clamp-1">{goal}</span>
            </div>
            <div className="flex items-center">
              <FaCalculator className="text-red-500 mr-2" />
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-2">IMC: {imc}</span>
                {bmiCategory && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${bmiColor}`}>
                    {bmiCategory}
                  </span>
                )}
              </div>
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
          imageUrl: imageError ? undefined : imageUrl,
          gender,
          healthCondition,
          experience,
          activityLevel,
          medicalConditions,
          physicalLimitations,
          imc
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