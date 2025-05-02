import { FC, useState, useEffect } from 'react';
import { connectionUrl } from '../../../config/connection';
import { FaTimes, FaPlus, FaTrash, FaDumbbell } from 'react-icons/fa';
import { FiEdit2 } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

interface AlunoData {
  userId: string;
  alunoId: number;
  // Adicione outras propriedades conforme necessário
}

interface Exercise {
  id?: number;
  name: string;
  sets: number;
  time: string;
  restTime: string;
  repsPerSet: number;
  status: string;
  image: string;
}

interface Treino {
  id?: number;
  diaSemana: number;
  exercicios: Exercise[];
}

interface WorkoutEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  alunoId: number;
  alunoName: string;
}

const defaultImage = 'https://via.placeholder.com/150';
// Array de dias da semana para exibição, NÃO ALTERAR A ORDEM - Compatível com backend (0=Domingo, 1=Segunda, etc)
const weekdays = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
];

const timerOptions = ['30 Sec', '45 Sec', '1 Min', '2 Min', '3 Min'];
const restTimeOptions = ['30 Sec', '45 Sec', '1 Min', '2 Min', '3 Min'];

const WorkoutEditModal: FC<WorkoutEditModalProps> = ({ isOpen, onClose, alunoId, alunoName }) => {
  // Estado para o dia da semana selecionado (0=Domingo, 1=Segunda, ..., 6=Sábado)
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [treinos, setTreinos] = useState<{[key: number]: Exercise[]}>({
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alunoPreferenciaId, setAlunoPreferenciaId] = useState<number | null>(null);

  // Estado para edição de um novo exercício
  const [currentExercise, setCurrentExercise] = useState<Exercise>({
    name: '',
    sets: 3,
    time: '45 Sec',
    restTime: '1 Min',
    repsPerSet: 10,
    status: 'not-started',
    image: defaultImage
  });
  
  // Estado para controlar se está adicionando um novo exercício
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null);

  // Buscar os treinos do aluno e o ID da preferência
  useEffect(() => {
    if (!isOpen || !alunoId) return;
    
    const fetchAlunoData = async () => {
      setIsLoading(true);
      try {
        console.log('Buscando dados do aluno com userId:', alunoId);
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Token não encontrado');
          throw new Error('Token não encontrado');
        }

        // Primeiro, buscar todos os alunos para encontrar o ID da preferência do aluno
        const response = await fetch(`${connectionUrl}/personal/treinos`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Erro na resposta da API:', response.status, errorText);
          throw new Error('Erro ao buscar treinos');
        }

        const data = await response.json();
        console.log('Dados recebidos da API (todos os alunos):', data);
        
        // Encontrar o aluno pelo userId e obter o alunoId (id da preferência)
        const alunoData = data.find((aluno: AlunoData) => 
          aluno.userId === alunoId.toString() || aluno.userId === String(alunoId)
        );
        console.log('Dados do aluno encontrado:', alunoData);
        
        if (!alunoData) {
          console.log('Nenhum dado encontrado para o aluno com userId:', alunoId);
          
          // Tentativa alternativa de encontrar o aluno
          console.log('Tentando encontrar aluno por coincidência parcial...');
          const possibleMatch = data.find((aluno: any) => 
            String(aluno.userId).includes(String(alunoId)) || 
            (aluno.userId && String(alunoId).includes(String(aluno.userId)))
          );
          
          if (possibleMatch) {
            console.log('Possível correspondência encontrada:', possibleMatch);
            const prefId = possibleMatch.alunoId;
            console.log('Usando ID alternativo de preferência:', prefId);
            setAlunoPreferenciaId(prefId);
            
            // Processar os treinos normalmente com o possível match
            const treinosPorDia: {[key: number]: Exercise[]} = {
              0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
            };
            
            if (possibleMatch.treinos) {
              possibleMatch.treinos.forEach((treino: Treino) => {
                if (treino.diaSemana >= 0 && treino.diaSemana <= 6) {
                  treinosPorDia[treino.diaSemana] = treino.exercicios;
                }
              });
            }
            
            setTreinos(treinosPorDia);
            setIsLoading(false);
            return;
          }
          
          setTreinos({
            0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
          });
          setIsLoading(false);
          Swal.fire('Atenção', 'Não foi possível encontrar os dados do aluno. Tente novamente mais tarde.', 'warning');
          return;
        }
        
        // Armazenar o ID da preferência do aluno para uso nas operações de API
        const prefId = alunoData.alunoId;
        console.log('ID da preferência do aluno encontrado:', prefId);
        setAlunoPreferenciaId(prefId);
        
        // Organizar os treinos por dia da semana
        const treinosPorDia: {[key: number]: Exercise[]} = {
          0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
        };
        
        alunoData.treinos.forEach((treino: Treino) => {
          // Garantir que o índice do dia está dentro do intervalo válido (0-6)
          if (treino.diaSemana >= 0 && treino.diaSemana <= 6) {
            console.log(`Treino para o dia ${treino.diaSemana} (${weekdays[treino.diaSemana]}):`, treino.exercicios);
            treinosPorDia[treino.diaSemana] = treino.exercicios;
          } else {
            console.error(`Índice de dia da semana inválido: ${treino.diaSemana}`);
          }
        });
        
        console.log('Treinos organizados por dia da semana:', treinosPorDia);
        setTreinos(treinosPorDia);
      } catch (error) {
        console.error('Erro detalhado ao buscar treinos:', error);
        Swal.fire('Erro', 'Não foi possível carregar os treinos', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlunoData();
  }, [isOpen, alunoId]);

  // Salvar o treino do dia selecionado
  const handleSave = async () => {
    if (!alunoPreferenciaId) {
      console.error('ID da preferência do aluno não encontrado');
      
      // Solicitar o ID manualmente
      const { value: manualId } = await Swal.fire({
        title: 'ID de Preferência não Encontrado',
        text: 'Insira o ID da preferência do aluno manualmente:',
        input: 'number',
        inputPlaceholder: 'Ex: 123',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
          if (!value || isNaN(Number(value))) {
            return 'Por favor, insira um número válido';
          }
          return null;
        }
      });
      
      if (manualId) {
        setAlunoPreferenciaId(Number(manualId));
        console.log('ID manual definido:', Number(manualId));
      } else {
        console.log('Operação de entrada manual cancelada');
        return;
      }
    }
    
    // Se chegou aqui, temos um ID (seja o original ou o manual)
    const prefId = alunoPreferenciaId || 0; // Garantir que temos um valor
    setIsSaving(true);
    try {
      console.log(`Salvando treino para o aluno de preferência ${prefId} no dia ${selectedDay}`);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token não encontrado');
        throw new Error('Token não encontrado');
      }

      // Obter os exercícios para o dia selecionado
      const exercicios = treinos[selectedDay] || [];
      console.log('Exercícios a serem salvos:', exercicios);

      // Preparar dados para envio
      const exerciciosFormatados = exercicios.map(ex => ({
        name: ex.name,
        sets: ex.sets,
        time: ex.time,
        restTime: ex.restTime,
        repsPerSet: ex.repsPerSet,
        status: ex.status || 'not-started',
        image: ex.image
      }));

      console.log('Enviando request para:', `${connectionUrl}/personal/treinos/${prefId}/${selectedDay}`);
      console.log('Dados da requisição:', JSON.stringify({
        exercicios: exerciciosFormatados
      }, null, 2));

      // Enviar para o backend
      const response = await fetch(`${connectionUrl}/personal/treinos/${prefId}/${selectedDay}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          exercicios: exerciciosFormatados
        })
      });

      console.log('Status da resposta:', response.status);
      const responseText = await response.text();
      console.log('Resposta completa:', responseText);

      if (!response.ok) {
        let errorMessage = 'Erro ao salvar treino';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
          console.error('Erro detalhado:', errorData);
        } catch (e) {
          console.error('Não foi possível analisar o erro como JSON:', e);
        }
        throw new Error(errorMessage);
      }

      Swal.fire('Sucesso', 'Treino salvo com sucesso', 'success');
    } catch (error) {
      console.error('Erro detalhado ao salvar treino:', error);
      Swal.fire('Erro', `Não foi possível salvar o treino: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Adicionar ou atualizar um exercício
  const handleSaveExercise = () => {
    // Validações básicas
    if (!currentExercise.name || !currentExercise.time || !currentExercise.restTime) {
      Swal.fire('Atenção', 'Preencha todos os campos obrigatórios', 'warning');
      return;
    }

    console.log('Salvando exercício:', currentExercise);
    const updatedExercicios = [...(treinos[selectedDay] || [])];
    
    if (editingExerciseIndex !== null) {
      console.log(`Atualizando exercício no índice ${editingExerciseIndex}`);
      // Atualizar exercício existente
      updatedExercicios[editingExerciseIndex] = { ...currentExercise };
    } else {
      console.log('Adicionando novo exercício');
      // Adicionar novo exercício
      updatedExercicios.push({ ...currentExercise });
    }
    
    console.log('Lista atualizada de exercícios:', updatedExercicios);
    
    // Atualizar estado
    setTreinos({
      ...treinos,
      [selectedDay]: updatedExercicios
    });
    
    // Resetar estado de edição
    setIsAddingExercise(false);
    setEditingExerciseIndex(null);
    setCurrentExercise({
      name: '',
      sets: 3,
      time: '45 Sec',
      restTime: '1 Min',
      repsPerSet: 10,
      status: 'not-started',
      image: defaultImage
    });
  };

  // Remover um exercício
  const handleRemoveExercise = (index: number) => {
    console.log(`Removendo exercício no índice ${index}`);
    const updatedExercicios = [...(treinos[selectedDay] || [])];
    console.log('Exercício a ser removido:', updatedExercicios[index]);
    updatedExercicios.splice(index, 1);
    
    console.log('Lista atualizada após remoção:', updatedExercicios);
    setTreinos({
      ...treinos,
      [selectedDay]: updatedExercicios
    });
  };

  // Editar um exercício existente
  const handleEditExercise = (index: number) => {
    console.log(`Editando exercício no índice ${index}`);
    const exercicio = treinos[selectedDay][index];
    console.log('Dados do exercício a ser editado:', exercicio);
    setCurrentExercise({ ...exercicio });
    setEditingExerciseIndex(index);
    setIsAddingExercise(true);
  };

  // Excluir todos os exercícios de um dia
  const handleDeleteDayWorkout = async () => {
    if (!alunoPreferenciaId) {
      console.error('ID da preferência do aluno não encontrado');
      
      // Solicitar o ID manualmente
      const { value: manualId } = await Swal.fire({
        title: 'ID de Preferência não Encontrado',
        text: 'Insira o ID da preferência do aluno manualmente:',
        input: 'number',
        inputPlaceholder: 'Ex: 123',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
          if (!value || isNaN(Number(value))) {
            return 'Por favor, insira um número válido';
          }
          return null;
        }
      });
      
      if (manualId) {
        setAlunoPreferenciaId(Number(manualId));
        console.log('ID manual definido:', Number(manualId));
      } else {
        console.log('Operação de entrada manual cancelada');
        return;
      }
    }
    
    // Se chegou aqui, temos um ID (seja o original ou o manual)
    const prefId = alunoPreferenciaId || 0; // Garantir que temos um valor
    
    console.log(`Tentando excluir treino para o aluno de preferência ${prefId} no dia ${selectedDay}`);
    
    // Confirmar antes de excluir
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: `Isso excluirá todo o treino de ${weekdays[selectedDay]}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) {
      console.log('Exclusão cancelada pelo usuário');
      return;
    }

    try {
      console.log('Iniciando processo de exclusão');
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token não encontrado');
        throw new Error('Token não encontrado');
      }

      // Verificar se há exercícios para esse dia
      if (!treinos[selectedDay] || treinos[selectedDay].length === 0) {
        console.log('Não há treinos para excluir neste dia');
        Swal.fire('Atenção', 'Não há treino para excluir neste dia', 'info');
        return;
      }

      console.log(`Enviando requisição DELETE para ${connectionUrl}/personal/treinos/${prefId}/${selectedDay}`);
      
      // Enviar solicitação de exclusão
      const response = await fetch(`${connectionUrl}/personal/treinos/${prefId}/${selectedDay}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Status da resposta:', response.status);
      const responseText = await response.text();
      console.log('Resposta completa:', responseText);

      if (!response.ok) {
        let errorMessage = 'Erro ao excluir treino';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
          console.error('Erro detalhado:', errorData);
        } catch (e) {
          console.error('Não foi possível analisar o erro como JSON:', e);
        }
        throw new Error(errorMessage);
      }

      // Atualizar o estado após a exclusão
      console.log('Atualizando estado local após exclusão bem-sucedida');
      setTreinos({
        ...treinos,
        [selectedDay]: []
      });

      Swal.fire('Excluído', 'O treino foi excluído com sucesso', 'success');
    } catch (error) {
      console.error('Erro detalhado ao excluir treino:', error);
      Swal.fire('Erro', `Não foi possível excluir o treino: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div 
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4 relative z-50"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300 
            }}
          >
            {/* Modal header */}
            <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-red-600 to-red-500 text-white rounded-t-xl">
              <div className="flex items-center">
                <FaDumbbell className="text-2xl mr-3" />
                <h2 className="text-2xl font-bold">Gerenciar Treinos de {alunoName}</h2>
              </div>
              <motion.button
                onClick={onClose}
                className="text-white hover:text-red-200 transition rounded-full p-2 hover:bg-white/20"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTimes className="text-xl" />
              </motion.button>
            </div>

            {/* Modal content */}
            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <motion.div 
                    className="h-16 w-16 border-t-4 border-b-4 border-red-600 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              ) : (
                <>
                  {/* Day selector */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4 text-gray-700">Selecione o dia para editar:</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                      {weekdays.map((day, index) => (
                        <motion.button
                          key={index}
                          onClick={() => setSelectedDay(index)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`py-3 px-3 rounded-xl transition shadow-sm ${
                            selectedDay === index
                              ? 'bg-red-600 text-white shadow-md'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          } ${treinos[index]?.length ? 'font-bold' : ''}`}
                          title={`${day} (${treinos[index]?.length || 0} exercícios)`}
                        >
                          {day.substring(0, 3)}
                          {treinos[index]?.length > 0 && (
                            <span className="ml-1 text-xs inline-block px-2 py-1 rounded-full bg-red-800 text-white">
                              {treinos[index].length}
                            </span>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Current day workouts */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-700">
                        Exercícios para {weekdays[selectedDay]}{' '}
                        <span className="text-gray-500 text-sm">
                          (Dia {selectedDay})
                        </span>
                      </h3>
                      <div className="space-x-3">
                        <motion.button
                          onClick={() => {
                            setCurrentExercise({
                              name: '',
                              sets: 3,
                              time: '45 Sec',
                              restTime: '1 Min',
                              repsPerSet: 10,
                              status: 'not-started',
                              image: defaultImage
                            });
                            setIsAddingExercise(true);
                            setEditingExerciseIndex(null);
                          }}
                          className="bg-gradient-to-r from-red-600 to-red-500 text-white py-2 px-4 rounded-lg flex items-center shadow-md"
                          disabled={isAddingExercise}
                          whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaPlus className="mr-2" /> Adicionar
                        </motion.button>
                        {treinos[selectedDay] && treinos[selectedDay].length > 0 && (
                          <motion.button
                            onClick={handleDeleteDayWorkout}
                            className="bg-gradient-to-r from-gray-600 to-gray-500 text-white py-2 px-4 rounded-lg flex items-center shadow-md"
                            disabled={isSaving}
                            whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaTrash className="mr-2" /> Excluir Dia
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* List of exercises */}
                    <AnimatePresence>
                      {treinos[selectedDay] && treinos[selectedDay].length > 0 ? (
                        <motion.div 
                          className="space-y-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          {treinos[selectedDay].map((exercise, index) => (
                            <motion.div
                              key={index}
                              className="border rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center bg-white shadow-sm hover:shadow-md transition-shadow"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                              whileHover={{ scale: 1.01 }}
                            >
                              <div className="flex flex-col md:flex-row items-start md:items-center mb-3 md:mb-0">
                                <div className="relative mr-4 mb-2 md:mb-0">
                                  <img
                                    src={exercise.image}
                                    alt={exercise.name}
                                    className="w-20 h-20 object-cover rounded-lg shadow-md"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = defaultImage;
                                    }}
                                  />
                                </div>
                                <div>
                                  <h4 className="font-bold text-lg text-gray-800">{exercise.name}</h4>
                                  <div className="text-sm text-gray-600 mt-2 grid grid-cols-2 gap-2">
                                    <span className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                                      <span className="font-medium">Séries:</span> 
                                      <span className="ml-1 text-red-700">{exercise.sets}</span>
                                    </span>
                                    <span className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                                      <span className="font-medium">Tempo:</span> 
                                      <span className="ml-1 text-red-700">{exercise.time}</span>
                                    </span>
                                    <span className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                                      <span className="font-medium">Descanso:</span> 
                                      <span className="ml-1 text-red-700">{exercise.restTime}</span>
                                    </span>
                                    <span className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                                      <span className="font-medium">Repetições:</span> 
                                      <span className="ml-1 text-red-700">{exercise.repsPerSet}</span>
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex space-x-2">
                                <motion.button
                                  onClick={() => handleEditExercise(index)}
                                  className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <FiEdit2 />
                                </motion.button>
                                <motion.button
                                  onClick={() => handleRemoveExercise(index)}
                                  className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <FaTrash />
                                </motion.button>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      ) : (
                        <motion.div 
                          className="text-center py-12 bg-gray-50 rounded-xl"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <FaDumbbell className="mx-auto text-4xl text-gray-300 mb-4" />
                          <p className="text-gray-500 text-lg">
                            Nenhum exercício cadastrado para {weekdays[selectedDay]}.
                          </p>
                          <p className="text-gray-400 text-sm mt-2">
                            Clique em "Adicionar" para incluir exercícios a este dia.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Save button */}
                  <div className="flex justify-end border-t pt-6">
                    <motion.button
                      onClick={handleSave}
                      className="bg-gradient-to-r from-red-600 to-red-500 text-white py-3 px-8 rounded-xl shadow-md font-bold"
                      disabled={isSaving}
                      whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isSaving ? 'Salvando...' : 'Salvar Treino'}
                    </motion.button>
                  </div>
                </>
              )}
            </div>

            {/* Add/Edit Exercise Form Modal */}
            <AnimatePresence>
              {isAddingExercise && (
                <motion.div 
                  className="fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div 
                    className="fixed inset-0 bg-black/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => {
                      setIsAddingExercise(false);
                      setEditingExerciseIndex(null);
                    }}
                  />
                  
                  <motion.div 
                    className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 m-4 relative z-50"
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-800 flex items-center">
                        <FaDumbbell className="mr-2 text-red-600" />
                        {editingExerciseIndex !== null ? 'Editar Exercício' : 'Adicionar Exercício'}
                      </h3>
                      <motion.button
                        onClick={() => {
                          setIsAddingExercise(false);
                          setEditingExerciseIndex(null);
                        }}
                        className="text-gray-500 hover:text-gray-700 bg-gray-100 p-2 rounded-full"
                        whileHover={{ scale: 1.1, backgroundColor: "#f3f4f6" }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FaTimes />
                      </motion.button>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome do Exercício
                        </label>
                        <input
                          type="text"
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                          value={currentExercise.name}
                          onChange={(e) =>
                            setCurrentExercise({ ...currentExercise, name: e.target.value })
                          }
                          placeholder="Ex: Supino reto"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Número de Séries
                          </label>
                          <input
                            type="number"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                            value={currentExercise.sets}
                            min="1"
                            onChange={(e) =>
                              setCurrentExercise({
                                ...currentExercise,
                                sets: parseInt(e.target.value) || 1
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tempo da Série
                          </label>
                          <select
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                            value={currentExercise.time}
                            onChange={(e) =>
                              setCurrentExercise({ ...currentExercise, time: e.target.value })
                            }
                          >
                            {timerOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tempo de Descanso
                          </label>
                          <select
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                            value={currentExercise.restTime}
                            onChange={(e) =>
                              setCurrentExercise({ ...currentExercise, restTime: e.target.value })
                            }
                          >
                            {restTimeOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Repetições por Série
                        </label>
                        <input
                          type="number"
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                          value={currentExercise.repsPerSet}
                          min="1"
                          onChange={(e) =>
                            setCurrentExercise({
                              ...currentExercise,
                              repsPerSet: parseInt(e.target.value) || 1
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          URL da Imagem
                        </label>
                        <input
                          type="text"
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                          value={currentExercise.image}
                          onChange={(e) =>
                            setCurrentExercise({ ...currentExercise, image: e.target.value })
                          }
                          placeholder="https://exemplo.com/imagem.jpg"
                        />
                        <div className="mt-3 flex items-center">
                          <motion.img
                            src={currentExercise.image}
                            alt="Prévia"
                            className="w-24 h-24 object-cover rounded-lg border shadow-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = defaultImage;
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                          <p className="ml-4 text-sm text-gray-500">
                            Prévia da imagem do exercício
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <motion.button
                          className="bg-gradient-to-r from-red-600 to-red-500 text-white py-3 px-8 rounded-xl shadow-md font-bold"
                          onClick={handleSaveExercise}
                          whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {editingExerciseIndex !== null ? 'Atualizar' : 'Adicionar'}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WorkoutEditModal;