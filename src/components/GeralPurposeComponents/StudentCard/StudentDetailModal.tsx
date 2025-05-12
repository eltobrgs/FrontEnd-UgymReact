import React, { useState, useEffect } from 'react';
import { FaWeight, FaRulerVertical, FaRunning, FaBullseye, FaBirthdayCake, FaHeartbeat, FaNotesMedical, FaWalking, FaTimes, FaCalculator, FaUserCircle } from 'react-icons/fa';
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
    imc?: string;
};
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  onClose,
  student
}) => {
  const { token } = useAuth();
  const [reports, setReports] = useState<ReportsByType>({});
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Efeito para logar informações da imagem para depuração
  useEffect(() => {
    if (isOpen && student.imageUrl) {
      console.log(`[StudentDetailModal] ID: ${student.id}, Nome: ${student.name}, ImageUrl:`, student.imageUrl);
    }
  }, [isOpen, student.id, student.name, student.imageUrl]);

  useEffect(() => {
    if (isOpen) {
      fetchReports();
    }
  }, [isOpen, student.id]);

  const fetchReports = async () => {
    if (!student.id) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${connectionUrl}/aluno/${student.id}/relatorios`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
      const data = await response.json();
        console.log('Relatórios obtidos:', data);
        setReports(data);
      } else {
        console.error('Erro ao buscar relatórios:', await response.text());
      }
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = () => {
    console.error(`[StudentDetailModal] Erro ao carregar imagem para ${student.name} (ID: ${student.id}), URL: ${student.imageUrl}`);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log(`[StudentDetailModal] Imagem carregada com sucesso para ${student.name} (ID: ${student.id})`);
  };

  // Função para determinar a categoria do IMC
  const getBMICategory = (bmi: string | undefined) => {
    if (!bmi || bmi === 'Não calculado' || bmi === 'N/A') return 'Não disponível';
    
    const bmiValue = typeof bmi === 'string' ? parseFloat(bmi) : bmi;
    if (isNaN(bmiValue)) return 'Não disponível';
    
    if (bmiValue < 18.5) return 'Abaixo do peso';
    if (bmiValue < 25) return 'Peso normal';
    if (bmiValue < 30) return 'Sobrepeso';
    if (bmiValue < 35) return 'Obesidade Grau I';
    if (bmiValue < 40) return 'Obesidade Grau II';
    return 'Obesidade Grau III';
  };

  // Determinar a cor do badge do IMC
  const getBMIColor = (bmi: string | undefined) => {
    if (!bmi || bmi === 'Não calculado' || bmi === 'N/A') return 'bg-gray-200 text-gray-700';
    
    const bmiValue = typeof bmi === 'string' ? parseFloat(bmi) : bmi;
    if (isNaN(bmiValue)) return 'bg-gray-200 text-gray-700';
    
    if (bmiValue < 18.5) return 'bg-blue-100 text-blue-800';
    if (bmiValue < 25) return 'bg-green-100 text-green-800';
    if (bmiValue < 30) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const bmiCategory = getBMICategory(student.imc);
  const bmiColor = getBMIColor(student.imc);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <motion.div 
            className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              {student.imageUrl && !imageError ? (
                <img 
                  src={student.imageUrl} 
                  alt={`Foto de ${student.name}`} 
                  className="w-full h-64 object-cover rounded-t-xl"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-r from-red-100 to-red-200 flex items-center justify-center rounded-t-xl">
                  <FaUserCircle className="text-red-300" size={100} />
                </div>
              )}
              <motion.button 
                onClick={onClose}
                className="absolute top-4 right-4 bg-red-600 p-2 rounded-full hover:bg-red-700 text-white shadow-md"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTimes size={18} />
              </motion.button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                <h2 className="text-3xl font-bold text-white drop-shadow-md">{student.name}</h2>
              </div>
            </div>

            {/* Conteúdo do modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(100vh-350px)]">
              {/* Informações básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-800 mb-3">Informações Pessoais</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <FaBirthdayCake className="text-red-600 mr-2" />
                      <span>{student.age} anos</span>
                    </div>
                    {student.gender && (
                      <div className="flex items-center">
                        <FaUserCircle className="text-red-600 mr-2" />
                        <span>Gênero: {student.gender}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <FaRunning className="text-red-600 mr-2" />
                      <span>Experiência: {student.trainingTime}</span>
                    </div>
                    {student.activityLevel && (
                      <div className="flex items-center">
                        <FaWalking className="text-red-600 mr-2" />
                        <span>Nível de Atividade: {student.activityLevel}</span>
                      </div>
                    )}
                  </div>
                </div>
              
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">Dados Físicos</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <FaWeight className="text-blue-600 mr-2" />
                      <span>Peso: {student.weight}</span>
                    </div>
                    <div className="flex items-center">
                      <FaRulerVertical className="text-blue-600 mr-2" />
                      <span>Altura: {student.height}</span>
                    </div>
                    <div className="flex items-center">
                      <FaCalculator className="text-blue-600 mr-2" />
                      <div className="flex items-center">
                        <span className="mr-2">IMC: {student.imc || 'N/A'}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${bmiColor}`}>
                          {bmiCategory}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaBullseye className="text-blue-600 mr-2" />
                      <span>Objetivo: {student.goal}</span>
                    </div>
                      </div>
                </div>
              </div>

              {/* Informações médicas */}
              {(student.healthCondition || student.medicalConditions || student.physicalLimitations) && (
                <div className="bg-green-50 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">Informações de Saúde</h3>
                  <div className="space-y-2">
                      {student.healthCondition && (
                      <div className="flex items-start">
                        <FaHeartbeat className="text-green-600 mr-2 mt-1" />
                        <span>Condição de Saúde: {student.healthCondition}</span>
                          </div>
                      )}
                      {student.medicalConditions && (
                      <div className="flex items-start">
                        <FaNotesMedical className="text-green-600 mr-2 mt-1" />
                        <span>Condições Médicas: {student.medicalConditions}</span>
                          </div>
                      )}
                      {student.physicalLimitations && (
                      <div className="flex items-start">
                        <FaRunning className="text-green-600 mr-2 mt-1" />
                        <span>Limitações Físicas: {student.physicalLimitations}</span>
                          </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Relatórios */}
              {!isLoading && Object.keys(reports).length > 0 && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-800 mb-3">Relatórios Recentes</h3>
                  <div className="space-y-4">
                    {Object.entries(reports).map(([type, reportList]) => (
                      <div key={type} className="border-b border-purple-200 pb-2">
                        <h4 className="font-medium text-purple-700">{type}</h4>
                        <div className="mt-1">
                          {reportList.length > 0 ? (
                            <div className="text-sm">
                              <p>Último valor: {reportList[0].valor} ({new Date(reportList[0].data).toLocaleDateString()})</p>
                              {reportList[0].observacao && (
                                <p className="text-gray-600 italic mt-1">{reportList[0].observacao}</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">Nenhum registro</p>
                          )}
                        </div>
                      </div>
                    ))}
              </div>
            </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StudentDetailModal; 