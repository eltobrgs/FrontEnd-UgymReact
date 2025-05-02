import { FC, useState, useEffect, useRef } from 'react';
import { FaTimes, FaPlay, FaPause, FaCheck, FaDumbbell } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface Exercicio {
  id: number;
  name: string;
  sets: number;
  time: string;
  restTime: string;
  repsPerSet: number;
  status: string;
  image: string;
}

interface ExerciseDetailModalProps {
  isOpen: boolean;
  onClose: (exerciseId?: number, newStatus?: string) => void;
  exercise: Exercicio;
}

// Converte strings como "30 Sec" ou "1 Min" para segundos
const convertToSeconds = (timeStr: string): number => {
  if (!timeStr) return 0;
  
  const parts = timeStr.split(' ');
  if (parts.length !== 2) return 0;
  
  const value = parseInt(parts[0], 10);
  const unit = parts[1].toLowerCase();
  
  if (unit.includes('sec')) return value;
  if (unit.includes('min')) return value * 60;
  
  return 0;
};

const ExerciseDetailModal: FC<ExerciseDetailModalProps> = ({ isOpen, onClose, exercise }) => {
  const [remainingSets, setRemainingSets] = useState(exercise?.sets || 0);
  const [timer, setTimer] = useState(convertToSeconds(exercise?.time || '0 Sec'));
  const [restTimer, setRestTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [status, setStatus] = useState(exercise?.status || 'not-started');
  
  const intervalRef = useRef<number | null>(null);
  
  // Resetar o estado quando o modal é aberto ou o exercício muda
  useEffect(() => {
    if (!exercise) return;
    
    setRemainingSets(exercise.sets);
    setTimer(convertToSeconds(exercise.time));
    setRestTimer(0);
    setIsActive(false);
    setIsResting(false);
    setStatus(exercise.status);
    
    // Limpar qualquer intervalo existente
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [exercise, isOpen]);
  
  // Limpar o intervalo quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  if (!isOpen || !exercise) return null;
  
  // Função para iniciar/pausar o timer
  const toggleTimer = () => {
    if (isActive) {
      // Pausar
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsActive(false);
    } else {
      // Iniciar
      if (status === 'not-started') {
        setStatus('inprogress');
      }
      
      setIsActive(true);
      intervalRef.current = window.setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer <= 1) {
            // Tempo acabou, mudar para descanso ou próxima série
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            
            if (isResting) {
              // Fim do descanso, começar próxima série
              setIsResting(false);
              setTimer(convertToSeconds(exercise.time));
              return convertToSeconds(exercise.time);
            } else {
              // Fim da série, começar descanso ou terminar
              if (remainingSets > 1) {
                setRemainingSets(prevSets => prevSets - 1);
                setIsResting(true);
                setRestTimer(convertToSeconds(exercise.restTime));
                
                // Começar timer de descanso
                intervalRef.current = window.setInterval(() => {
                  setRestTimer(prevRestTimer => {
                    if (prevRestTimer <= 1) {
                      if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                      }
                      setIsActive(false);
                      setIsResting(false);
                      setTimer(convertToSeconds(exercise.time));
                      return 0;
                    }
                    return prevRestTimer - 1;
                  });
                }, 1000);
                
                return 0;
              } else {
                // Todas as séries concluídas
                setIsActive(false);
                setStatus('completed');
                return 0;
              }
            }
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
  };
  
  // Formatar tempo para exibição MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calcular o progresso para a barra de progresso
  const calculateProgress = (): number => {
    if (isResting) {
      const totalRestTime = convertToSeconds(exercise.restTime);
      return (totalRestTime - restTimer) / totalRestTime * 100;
    } else {
      const totalTime = convertToSeconds(exercise.time);
      return (totalTime - timer) / totalTime * 100;
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="fixed inset-0 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onClose(exercise.id, status)}
          />
          
          <motion.div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto z-10 relative m-4"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300 
            }}
          >
            <div className="relative">
              <img
                src={exercise.image || 'https://via.placeholder.com/400x200'}
                alt={exercise.name}
                className="w-full h-48 object-cover rounded-t-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Imagem+não+encontrada';
                }}
              />
              <motion.button
                onClick={() => onClose(exercise.id, status)}
                className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full shadow-md"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTimes size={16} />
              </motion.button>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <div className="flex items-center">
                  <FaDumbbell className="text-red-400 mr-2" />
                  <h2 className="text-2xl font-bold text-white">{exercise.name}</h2>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <motion.div 
                  className="grid grid-cols-2 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="bg-gray-100 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Séries</p>
                    <p className="text-xl font-bold text-red-600">{remainingSets} / {exercise.sets}</p>
                  </div>
                  
                  <div className="bg-gray-100 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Repetições</p>
                    <p className="text-xl font-bold text-red-600">{exercise.repsPerSet} por série</p>
                  </div>
                </motion.div>
                
                {/* Timer */}
                <motion.div 
                  className="mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="bg-gray-100 rounded-xl p-5 text-center relative overflow-hidden shadow-sm">
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-red-100 to-pink-100 rounded-xl"
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateProgress()}%` }}
                      transition={{ duration: 0.5 }}
                    />
                    <p className="text-xs text-gray-500 relative z-10 mb-1">
                      {isResting ? 'Tempo de Descanso' : 'Tempo da Série'}
                    </p>
                    <p className="text-4xl font-bold text-gray-800 relative z-10">
                      {isResting ? formatTime(restTimer) : formatTime(timer)}
                    </p>
                    <p className="mt-2 text-sm text-gray-500 relative z-10">
                      {isResting ? `Próxima série em breve` : `Tempo por série: ${exercise.time}`}
                    </p>
                  </div>
                  
                  <div className="flex justify-center mt-6 space-x-6">
                    <motion.button
                      onClick={toggleTimer}
                      className={`p-4 rounded-full shadow-md ${
                        isActive
                          ? 'bg-red-500 text-white'
                          : 'bg-green-500 text-white'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isActive ? <FaPause size={24} /> : <FaPlay size={24} />}
                    </motion.button>
                    
                    <motion.button
                      onClick={() => {
                        // Limpar timer
                        if (intervalRef.current) {
                          clearInterval(intervalRef.current);
                          intervalRef.current = null;
                        }
                        
                        // Marcar como concluído
                        setStatus('completed');
                        setIsActive(false);
                        setRemainingSets(0);
                      }}
                      className="p-4 rounded-full bg-teal-500 text-white shadow-md"
                      disabled={status === 'completed'}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaCheck size={24} />
                    </motion.button>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="bg-gray-100 rounded-lg p-4 mt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-sm text-gray-600 flex items-center">
                    Status:{' '}
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : status === 'inprogress' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {status === 'completed' 
                        ? 'Concluído' 
                        : status === 'inprogress' 
                        ? 'Em Progresso' 
                        : 'Não Iniciado'}
                    </span>
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExerciseDetailModal; 