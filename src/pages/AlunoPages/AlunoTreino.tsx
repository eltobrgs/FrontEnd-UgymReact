import { FC, useState, useEffect } from 'react';
import { connectionUrl } from '../../config/connection';
import Swal from 'sweetalert2';
import ExerciseDetailModal from '../../components/GeralPurposeComponents/ExerciseDetailModal/ExerciseDetailModal';
import DaySelector from '../../components/GeralPurposeComponents/DaySelector/DaySelector';
import { motion } from 'framer-motion';

interface Exercicio {
  id: number;
  name: string;
  sets: number;
  time: string;
  restTime: string;
  repsPerSet: number;
  status: string;
  image: string;
  treinoId?: number;
}

interface TreinosData {
  [key: number]: Exercicio[];
}

// Array de dias da semana para exibição
const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const WorkoutPlan: FC = () => {
  // Estado para o dia da semana selecionado (0-6, onde 0 é domingo)
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(new Date().getDay());
  
  // Estado para os dados de exercícios indexados por dia da semana (0-6)
  const [exercisesData, setExercisesData] = useState<TreinosData>({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<Exercicio | null>(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);

  // Buscar treinos do aluno
  useEffect(() => {
    const fetchTreinos = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token não encontrado');
        }

        const response = await fetch(`${connectionUrl}/aluno/treinos`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar treinos');
        }

        const data = await response.json();
        console.log('Dados de treinos recebidos do servidor:', data);
        
        // Verificar se temos dados para todos os dias da semana
        for (let i = 0; i < 7; i++) {
          if (!data[i]) {
            data[i] = [];
          }
        }
        
        setExercisesData(data);
      } catch (error) {
        console.error('Erro ao buscar treinos:', error);
        Swal.fire('Erro', 'Não foi possível carregar seus treinos', 'error');
        
        // Inicializar com um objeto vazio para evitar erros
        setExercisesData({
          0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTreinos();
  }, []);

  // Atualizar status de um exercício
  const updateExerciseStatus = async (exercicioId: number, novoStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch(`${connectionUrl}/aluno/exercicios/${exercicioId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: novoStatus })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status');
      }

      // Atualizar o estado local após a atualização bem-sucedida
      setExercisesData(prevData => {
        const newData = { ...prevData };
        
        // Encontrar o dia da semana que contém o exercício
        for (const [dia, exercicios] of Object.entries(newData)) {
          const index = exercicios.findIndex(ex => ex.id === exercicioId);
          if (index !== -1) {
            // Criar um novo array para manter a imutabilidade
            newData[parseInt(dia)] = [
              ...exercicios.slice(0, index),
              { ...exercicios[index], status: novoStatus },
              ...exercicios.slice(index + 1)
            ];
            break;
          }
        }
        
        return newData;
      });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar status do exercício:', error);
      Swal.fire('Erro', 'Não foi possível atualizar o status do exercício', 'error');
      return false;
    }
  };

  // Abrir modal de detalhes do exercício
  const handleExerciseClick = (exercise: Exercicio) => {
    setSelectedExercise(exercise);
    setShowExerciseModal(true);
  };

  // Fechar modal e atualizar dados se necessário
  const handleModalClose = (exerciseId?: number, newStatus?: string) => {
    setShowExerciseModal(false);
    
    // Se o status foi alterado, atualizar no backend e no estado local
    if (exerciseId && newStatus && selectedExercise?.status !== newStatus) {
      updateExerciseStatus(exerciseId, newStatus);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 fade-in w-full overflow-x-hidden space-y-8">
      {/* Seletor de dia da semana em vez do calendário */}
      <DaySelector selectedDay={selectedDayOfWeek} onDaySelect={setSelectedDayOfWeek} />

      {/* Informações do treino para o dia selecionado */}
      <motion.div 
        className="bg-white p-6 rounded-xl shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-xl font-semibold mb-3 text-gray-800">Treino de {weekdays[selectedDayOfWeek]}</h2>
        <div className="text-gray-600">
          <p className="mb-1">Exercícios programados: <span className="font-medium">{exercisesData[selectedDayOfWeek]?.length || 0}</span></p>
          
          {exercisesData[selectedDayOfWeek]?.length > 0 ? (
            <p className="text-green-600 font-medium">Treino disponível</p>
          ) : (
            <p className="text-gray-500">Nenhum exercício programado para este dia</p>
          )}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <motion.div 
            className="h-16 w-16 border-t-4 border-b-4 border-red-600 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      ) : (
        <>
          {/* Lista de exercícios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercisesData[selectedDayOfWeek]?.length > 0 ? (
              exercisesData[selectedDayOfWeek].map((exercise, index) => (
                <motion.div
                  key={exercise.id || index}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all transform cursor-pointer"
                  onClick={() => handleExerciseClick(exercise)}
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <img
                      src={exercise.image || 'https://via.placeholder.com/150'}
                      alt={exercise.name}
                      className="rounded-lg object-cover w-full h-48"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Imagem+não+encontrada';
                      }}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{exercise.name}</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">Séries - {exercise.sets}</p>
                    <p className="text-sm text-gray-600">Tempo - {exercise.time}</p>
                    <p className="text-sm text-gray-600">Descanso - {exercise.restTime}</p>
                    <p className="text-sm text-gray-600">Repetições por Série - {exercise.repsPerSet}</p>
                  </div>
                  <div className="mt-4">
                    <div
                      className={`h-2 rounded-full ${
                        exercise.status === 'completed'
                          ? 'bg-teal-500'
                          : exercise.status === 'inprogress'
                          ? 'bg-indigo-500'
                          : 'bg-gray-200'
                      }`}
                    />
                    <p className="mt-2 text-sm capitalize text-gray-600">
                      {exercise.status === 'completed' 
                        ? 'Completado' 
                        : exercise.status === 'inprogress' 
                        ? 'Em progresso' 
                        : 'Não iniciado'}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500 bg-white/60 backdrop-blur-sm rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xl font-medium">Nenhum exercício programado para {weekdays[selectedDayOfWeek]}</p>
                <p className="mt-2 text-gray-400">Fale com seu personal para agendar treinos para este dia</p>
              </motion.div>
            )}
          </div>
        </>
      )}

      {/* Modal de detalhes do exercício */}
      {selectedExercise && (
        <ExerciseDetailModal
          isOpen={showExerciseModal}
          onClose={handleModalClose}
          exercise={selectedExercise}
        />
      )}
    </div>
  );
};

export default WorkoutPlan; 