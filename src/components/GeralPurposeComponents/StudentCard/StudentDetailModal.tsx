import React from 'react';
import { FaWeight, FaRulerVertical, FaRunning, FaBullseye, FaBirthdayCake, FaHeartbeat, FaNotesMedical, FaWalking, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
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
  };
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  onClose,
  student
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md overflow-y-auto p-4"
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
            onClick={onClose}
          />
          
          <motion.div 
            className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative z-10"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header com imagem e botão de fechar */}
            <div className="relative">
              <img 
                src={student.imageUrl || 'https://via.placeholder.com/150'} 
                alt={student.name} 
                className="w-full h-48 object-cover rounded-t-xl"
              />
              <motion.button 
                onClick={onClose}
                className="absolute top-4 right-4 bg-red-600 p-2 rounded-full hover:bg-red-700 text-white shadow-md"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTimes size={18} />
              </motion.button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <h2 className="text-2xl font-bold text-white">{student.name}</h2>
              </div>
            </div>

            {/* Conteúdo do modal */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Informações Básicas</h3>

                <div className="space-y-3">
                  <motion.div 
                    className="flex items-center text-gray-700"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <FaBirthdayCake className="mr-3 text-red-600" />
                    <span className="font-medium">Idade: {student.age} anos</span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center text-gray-700"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <FaWeight className="mr-3 text-red-600" />
                    <span>Peso: {student.weight}</span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center text-gray-700"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <FaRulerVertical className="mr-3 text-red-600" />
                    <span>Altura: {student.height}</span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center text-gray-700"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <FaRunning className="mr-3 text-red-600" />
                    <span>Experiência: {student.trainingTime}</span>
                  </motion.div>

                  {student.gender && (
                    <motion.div 
                      className="flex items-center text-gray-700"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="w-6 h-6 mr-3 flex items-center justify-center text-red-600">
                        {student.gender === 'masculino' ? '♂' : student.gender === 'feminino' ? '♀' : '⚧'}
                      </div>
                      <span>Gênero: <span className="capitalize">{student.gender}</span></span>
                    </motion.div>
                  )}

                  {student.activityLevel && (
                    <motion.div 
                      className="flex items-center text-gray-700"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <FaWalking className="mr-3 text-red-600" />
                      <span>Nível de Atividade: {student.activityLevel}</span>
                    </motion.div>
                  )}
                </div>
              </div>

              <div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Objetivo</h3>
                  <motion.div 
                    className="flex items-center text-gray-700 mb-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <FaBullseye className="mr-3 text-red-600 flex-shrink-0" />
                    <span>{student.goal}</span>
                  </motion.div>
                </div>

                {(student.medicalConditions || student.physicalLimitations || student.healthCondition) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Informações de Saúde</h3>
                    <div className="space-y-3">
                      {student.healthCondition && (
                        <motion.div 
                          className="flex items-start text-gray-700"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <FaHeartbeat className="mr-3 text-red-600 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Condição de Saúde:</p>
                            <p>{student.healthCondition}</p>
                          </div>
                        </motion.div>
                      )}
                      
                      {student.medicalConditions && (
                        <motion.div 
                          className="flex items-start text-gray-700"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <FaNotesMedical className="mr-3 text-red-600 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Condições Médicas:</p>
                            <p>{student.medicalConditions}</p>
                          </div>
                        </motion.div>
                      )}
                      
                      {student.physicalLimitations && (
                        <motion.div 
                          className="flex items-start text-gray-700"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <FaNotesMedical className="mr-3 text-red-600 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Limitações Físicas:</p>
                            <p>{student.physicalLimitations}</p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botões no rodapé */}
            <div className="border-t p-4 flex justify-end space-x-3">
              <motion.button 
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Fechar
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StudentDetailModal; 