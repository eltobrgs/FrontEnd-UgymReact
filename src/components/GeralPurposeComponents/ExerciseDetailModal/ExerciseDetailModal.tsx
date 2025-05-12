import { FC, useState, useEffect, useRef } from 'react';
import { FaTimes, FaPlay, FaPause, FaCheck, FaDumbbell, FaStopwatch, FaHourglassHalf, FaListOl, FaImage, FaFilm } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import ExerciseMediaViewer from '../ExerciseMediaViewer';

interface Exercicio {
  id: number;
  name: string;
  sets: number;
  time: string;
  restTime: string;
  repsPerSet: number;
  status: string;
  image: string;
  videoUrl?: string;
  gifUrl?: string;
}

interface ExerciseDetailModalProps {
  isOpen: boolean;
  onClose: (exerciseId?: number, newStatus?: string) => void;
  exercise: Exercicio;
}

// Função para converter tempo de string para segundos
const convertToSeconds = (timeString: string): number => {
  if (!timeString) return 0;
  
  const minutes = timeString.includes('Min') 
    ? parseInt(timeString.split(' ')[0]) 
    : 0;
  
  const seconds = timeString.includes('Sec') 
    ? parseInt(timeString.split(' ')[0]) 
    : 0;
  
  return minutes * 60 + seconds;
};

// Função para formatar segundos em MM:SS
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const ExerciseDetailModal: FC<ExerciseDetailModalProps> = ({ isOpen, onClose, exercise }) => {
  const [remainingSets, setRemainingSets] = useState(exercise?.sets || 0);
  const [timer, setTimer] = useState(convertToSeconds(exercise?.time || '0 Sec'));
  const [restTimer, setRestTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [status, setStatus] = useState(exercise?.status || 'not-started');
  const [hasMedia, setHasMedia] = useState(false);
  
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
    setHasMedia(!!(exercise.videoUrl || exercise.gifUrl || (exercise.image && !exercise.image.includes('placeholder'))));
    
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
  
  // Iniciar/pausar o timer
  const toggleTimer = () => {
    if (isActive) {
      // Pausar o timer
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsActive(false);
    } else {
      // Iniciar o timer
      setIsActive(true);
      setStatus('inprogress');
      
      intervalRef.current = window.setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer <= 1) {
            // Quando o timer chega a 0
            if (remainingSets > 1) {
              // Se ainda há séries restantes, iniciar o descanso
              setIsResting(true);
              setRestTimer(convertToSeconds(exercise.restTime));
              setRemainingSets(prev => prev - 1);
              return convertToSeconds(exercise.time);
            } else {
              // Se não há mais séries, marcar como concluído
              clearInterval(intervalRef.current!);
              setIsActive(false);
              setStatus('completed');
              return 0;
            }
          }
          return prevTimer - 1;
        });
        
        if (isResting) {
          setRestTimer(prevTimer => {
            if (prevTimer <= 1) {
              // Quando o timer de descanso chega a 0
              setIsResting(false);
              return 0;
            }
            return prevTimer - 1;
          });
        }
      }, 1000);
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
            className="fixed inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onClose(exercise.id, status)}
          />
          
          <motion.div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto z-10 relative m-4 max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300 
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-500 p-4 text-white rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center">
                  <FaDumbbell className="mr-2" /> {exercise.name}
                </h2>
                <motion.button
                  onClick={() => onClose(exercise.id, status)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaTimes size={20} />
                </motion.button>
              </div>
              
              {/* Indicadores de mídia disponível */}
              {hasMedia && (
                <div className="flex gap-2 mt-2">
                  {exercise.videoUrl && (
                    <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-full flex items-center">
                      <FaFilm className="mr-1" /> Vídeo disponível
                    </span>
                  )}
                  {exercise.gifUrl && (
                    <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-full flex items-center">
                      <FaImage className="mr-1" /> GIF disponível
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* Media Viewer */}
            <div>
              <ExerciseMediaViewer
                image={exercise.image}
                video={exercise.videoUrl}
                gif={exercise.gifUrl}
                name={exercise.name}
              />
            </div>
            
            <div className="p-6">
              {/* Informações do exercício */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center justify-center shadow-sm">
                  <FaListOl className="text-red-500 mb-1" size={20} />
                  <p className="text-xs text-gray-500 mb-1">Séries</p>
                  <p className="text-xl font-bold text-gray-800">{remainingSets} / {exercise.sets}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center justify-center shadow-sm">
                  <FaStopwatch className="text-red-500 mb-1" size={20} />
                  <p className="text-xs text-gray-500 mb-1">Repetições</p>
                  <p className="text-xl font-bold text-gray-800">{exercise.repsPerSet}</p>
                </div>
              </div>
                
              {/* Timer */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-center">
                {isResting ? (
                  <>
                    <p className="text-sm text-gray-500 mb-1">Tempo de Descanso</p>
                    <div className="flex items-center justify-center">
                      <FaHourglassHalf className="text-blue-500 mr-2" size={24} />
                      <p className="text-3xl font-bold text-blue-600">{formatTime(restTimer)}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Próxima série em breve...</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 mb-1">Tempo do Exercício</p>
                    <div className="flex items-center justify-center">
                      <FaStopwatch className="text-red-500 mr-2" size={24} />
                      <p className="text-3xl font-bold text-gray-800">{formatTime(timer)}</p>
                    </div>
                  </>
                )}
              </div>
                
              <div className="flex justify-center mt-6 space-x-6">
                <motion.button
                  onClick={toggleTimer}
                  className={`p-4 rounded-full shadow-md ${
                    isActive
                      ? 'bg-red-500 text-white'
                      : 'bg-green-500 text-white'
                  }`}
                  whileHover={{ scale: 1.1, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
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
                  className={`p-4 rounded-full ${
                    status === 'completed'
                      ? 'bg-gray-300 text-gray-500'
                      : 'bg-teal-500 text-white shadow-md'
                  }`}
                  disabled={status === 'completed'}
                  whileHover={status !== 'completed' ? { scale: 1.1, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" } : {}}
                  whileTap={status !== 'completed' ? { scale: 0.9 } : {}}
                >
                  <FaCheck size={24} />
                </motion.button>
              </div>
              
              {/* Status */}
              <div className="mt-8">
                <div className="h-2 rounded-full overflow-hidden bg-gray-200">
                  <motion.div 
                    className={`h-full ${
                      status === 'completed' 
                        ? 'bg-teal-500' 
                        : status === 'inprogress' 
                        ? 'bg-blue-500' 
                        : 'bg-gray-300'
                    }`}
                    initial={{ width: "0%" }}
                    animate={{ 
                      width: status === 'completed' 
                        ? "100%" 
                        : status === 'inprogress' 
                        ? "50%" 
                        : "0%" 
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-sm font-medium capitalize text-gray-600">
                    {status === 'completed' 
                      ? 'Exercício completado' 
                      : status === 'inprogress' 
                      ? 'Em progresso' 
                      : 'Não iniciado'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExerciseDetailModal; 