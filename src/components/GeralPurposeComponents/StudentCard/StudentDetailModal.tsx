import React, { useEffect, useState } from 'react';
import { FaWeight, FaRulerVertical, FaRunning, FaBullseye, FaBirthdayCake, FaHeartbeat, FaNotesMedical, FaWalking, FaTimes, FaCalculator } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { connectionUrl } from '../../../config/connection';
import { useAuth } from '../../../contexts/AuthContext';

interface Report {
  id: number;
  valor: number;
  data: string;
  observacao?: string;
}

interface ReportsByType {
  [key: string]: Report[];
}

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

const getIMCContext = (imc: number) => {
  if (imc < 18.5) return 'Abaixo do peso';
  if (imc < 25) return 'Peso normal';
  if (imc < 30) return 'Sobrepeso';
  if (imc < 35) return 'Obesidade grau I';
  if (imc < 40) return 'Obesidade grau II';
  return 'Obesidade grau III';
};

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  onClose,
  student
}) => {
  const { token } = useAuth();
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [latestHeight, setLatestHeight] = useState<number | null>(null);
  const [imc, setImc] = useState<number | null>(null);
  const [imcContext, setImcContext] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && student.id) {
      console.log(`Modal aberto para estudante ID: ${student.id}, Nome: ${student.name}`);
      fetchReports();
    }
  }, [isOpen, student.id]);

  const fetchReports = async () => {
    if (!token) {
      console.error("Token não encontrado");
      setError("Token não encontrado. Faça login novamente.");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Buscando relatórios para aluno ID: ${student.id}`);
      const apiUrl = `${connectionUrl}/personal/aluno/${student.id}/reports`;
      console.log(`Fazendo requisição para: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log(`Status da resposta: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erro na requisição: ${response.status}`, errorText);
        throw new Error(`Erro ao buscar relatórios: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Resposta completa:", data);
      
      const reports: ReportsByType = data.reports || {};
      
      console.log("Relatórios recebidos:", reports);

      // Obter o peso mais recente
      if (reports.peso && reports.peso.length > 0) {
        const sortedWeights = [...reports.peso].sort((a, b) => 
          new Date(b.data).getTime() - new Date(a.data).getTime()
        );
        setLatestWeight(sortedWeights[0].valor);
        console.log("Peso mais recente:", sortedWeights[0].valor);
      } else {
        console.log("Nenhum relatório de peso encontrado");
      }

      // Obter a altura mais recente
      if (reports.altura && reports.altura.length > 0) {
        const sortedHeights = [...reports.altura].sort((a, b) => 
          new Date(b.data).getTime() - new Date(a.data).getTime()
        );
        setLatestHeight(sortedHeights[0].valor);
        console.log("Altura mais recente:", sortedHeights[0].valor);
      } else {
        console.log("Nenhum relatório de altura encontrado");
      }
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
      setError(`Falha ao carregar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular IMC quando peso ou altura mudam
  useEffect(() => {
    if (latestWeight && latestHeight) {
      console.log(`Calculando IMC com peso: ${latestWeight}kg e altura: ${latestHeight}cm`);
      const heightInMeters = latestHeight / 100;
      const calculatedIMC = latestWeight / (heightInMeters * heightInMeters);
      const roundedIMC = parseFloat(calculatedIMC.toFixed(2));
      setImc(roundedIMC);
      
      const context = getIMCContext(calculatedIMC);
      setImcContext(context);
      console.log(`IMC calculado: ${roundedIMC} (${context})`);
    }
  }, [latestWeight, latestHeight]);

  if (!isOpen) return null;

  const weightDisplay = latestWeight ? `${latestWeight} kg` : (student.weight !== 'Dados em relatórios' ? student.weight : 'Não informado');
  const heightDisplay = latestHeight ? `${latestHeight} cm` : (student.height !== 'Dados em relatórios' ? student.height : 'Não informado');
  
  console.log(`Valores para exibição - Peso: ${weightDisplay}, Altura: ${heightDisplay}, IMC: ${imc || 'não calculado'}`);

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
              {error && (
                <div className="col-span-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <p>{error}</p>
                </div>
              )}
              
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
                    <span>Peso: {isLoading ? 'Carregando...' : weightDisplay}</span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center text-gray-700"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <FaRulerVertical className="mr-3 text-red-600" />
                    <span>Altura: {isLoading ? 'Carregando...' : heightDisplay}</span>
                  </motion.div>
                  
                  {imc && (
                    <motion.div 
                      className="flex items-center text-gray-700"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 }}
                    >
                      <FaCalculator className="mr-3 text-red-600" />
                      <div>
                        <span>IMC: {imc} - </span>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          imc < 18.5 ? 'bg-blue-100 text-blue-800' :
                          imc < 25 ? 'bg-green-100 text-green-800' :
                          imc < 30 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {imcContext}
                        </span>
                      </div>
                    </motion.div>
                  )}
                  
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