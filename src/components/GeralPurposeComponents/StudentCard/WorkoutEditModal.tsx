import { FC, useState, useEffect } from 'react';
import { connectionUrl } from '../../../config/connection';
import { FaTimes, FaPlus, FaTrash, FaDumbbell, FaVideo, FaImage, FaFilm } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import MediaUploader from '../../GeralPurposeComponents/MediaUploader';
import MediaUploaderCombinado from '../../GeralPurposeComponents/MediaUploaderCombinado';

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
  videoUrl?: string;
  gifUrl?: string;
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

  // Estado para controlar se está mostrando o uploader de mídia
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  
  // Estados para o novo uploader combinado
  const [selectedMediaFile, setSelectedMediaFile] = useState<File | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<'image' | 'video' | 'gif'>('image');
  const [selectedYoutubeUrl, setSelectedYoutubeUrl] = useState('');

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
      const exerciciosFormatados = exercicios.map(ex => {
        // Garantir que temos valores válidos para todos os campos
        const formattedExercise: any = {
        name: ex.name,
        sets: ex.sets,
        time: ex.time,
        restTime: ex.restTime,
        repsPerSet: ex.repsPerSet,
        status: ex.status || 'not-started',
          image: ex.image || defaultImage
        };

        // Adicionar videoUrl e gifUrl apenas se existirem
        if (ex.videoUrl) {
          formattedExercise.videoUrl = ex.videoUrl;
        }
        
        if (ex.gifUrl) {
          formattedExercise.gifUrl = ex.gifUrl;
        }

        return formattedExercise;
      });

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

  // Função para verificar se o exercício tem mídias
  const hasMedia = (exercise: Exercise): boolean => {
    return !!(
      exercise.videoUrl || 
      exercise.gifUrl || 
      (exercise.image && !exercise.image.includes('placeholder'))
    );
  };

  // Função para lidar com a seleção de mídia no uploader combinado
  const handleMediaSelected = (mediaFile: File | null, mediaType: 'image' | 'video' | 'gif', youtubeUrl: string) => {
    setSelectedMediaFile(mediaFile);
    setSelectedMediaType(mediaType);
    setSelectedYoutubeUrl(youtubeUrl);
  };

  const handleSaveExercise = async () => {
    // Validar dados do exercício
    if (!currentExercise.name || !currentExercise.sets || !currentExercise.time || 
        !currentExercise.restTime || !currentExercise.repsPerSet) {
      Swal.fire('Erro', 'Por favor, preencha todos os campos obrigatórios', 'error');
      return;
    }

    // Se estiver editando um exercício existente
    if (editingExerciseIndex !== null) {
      const updatedExercises = [...treinos[selectedDay]];
      updatedExercises[editingExerciseIndex] = currentExercise;
      
      setTreinos({
        ...treinos,
        [selectedDay]: updatedExercises
      });
      
      // Não resetar completamente para permitir edição de mídias
      if (!showMediaUploader) {
        setEditingExerciseIndex(null);
        setIsAddingExercise(false);
    } else {
        // Mostrar mensagem de que agora é possível adicionar mídias
        Swal.fire({
          title: 'Exercício salvo!',
          text: 'Agora você pode adicionar mídias ao exercício',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
      return;
    }
    
    // Se estiver adicionando um novo exercício
    try {
      // Verificar se temos um treino para o dia selecionado
      let treinoId: number | null = null;
      
      // Buscar o treino existente para o dia selecionado
      const treinoExistente = await buscarTreinoParaDia(selectedDay);
      
      if (treinoExistente) {
        treinoId = treinoExistente.id;
      } else {
        // Criar um novo treino para o dia selecionado
        const novoTreino = await criarNovoTreino(selectedDay);
        if (novoTreino) {
          treinoId = novoTreino.id;
        }
      }
      
      if (!treinoId) {
        throw new Error('Não foi possível obter ou criar um treino para este dia');
      }
      
      // Criar FormData para envio
      const formData = new FormData();
      formData.append('treinoId', treinoId.toString());
      formData.append('name', currentExercise.name);
      formData.append('sets', currentExercise.sets.toString());
      formData.append('time', currentExercise.time);
      formData.append('restTime', currentExercise.restTime);
      formData.append('repsPerSet', currentExercise.repsPerSet.toString());
      formData.append('status', 'not-started');
      
      // Adicionar mídia se houver
      if (selectedMediaFile) {
        formData.append('media', selectedMediaFile);
        formData.append('mediaType', selectedMediaType);
      } else if (selectedYoutubeUrl) {
        formData.append('youtubeUrl', selectedYoutubeUrl);
      }
      
      // Obter token de autenticação
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }
      
      // Enviar para o endpoint combinado
      const response = await fetch(`${connectionUrl}/exercicio-com-midia`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar exercício');
      }
      
      const data = await response.json();
      console.log('Resposta do servidor:', data);
    
      // Adicionar o novo exercício à lista
      const novoExercicio = data.exercicio;
      
    setTreinos({
      ...treinos,
        [selectedDay]: [
          ...treinos[selectedDay],
          novoExercicio
        ]
    });
    
      // Resetar o formulário
    setCurrentExercise({
      name: '',
      sets: 3,
      time: '45 Sec',
      restTime: '1 Min',
      repsPerSet: 10,
      status: 'not-started',
      image: defaultImage
    });
      
      setIsAddingExercise(false);
      setEditingExerciseIndex(null);
      setSelectedMediaFile(null);
      setSelectedYoutubeUrl('');
      
      Swal.fire({
        title: 'Sucesso!',
        text: 'Exercício adicionado com sucesso',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Erro ao salvar exercício:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro ao salvar exercício',
        text: error instanceof Error ? error.message : 'Erro desconhecido',
        confirmButtonColor: '#3085d6'
      });
    }
  };
  
  // Função auxiliar para buscar o treino para um dia específico
  const buscarTreinoParaDia = async (dia: number): Promise<any | null> => {
    if (!alunoPreferenciaId) return null;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      const response = await fetch(`${connectionUrl}/personal/treino/${alunoPreferenciaId}/${dia}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.treino || null;
    } catch (error) {
      console.error('Erro ao buscar treino:', error);
      return null;
    }
  };
  
  // Função auxiliar para criar um novo treino
  const criarNovoTreino = async (dia: number): Promise<any | null> => {
    if (!alunoPreferenciaId) return null;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      const response = await fetch(`${connectionUrl}/personal/treinos/${alunoPreferenciaId}/${dia}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          exercicios: []
        })
      });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.treino || null;
    } catch (error) {
      console.error('Erro ao criar treino:', error);
      return null;
    }
  };

  // Função para lidar com o upload de mídia
  const handleMediaUploaded = (mediaType: 'image' | 'video' | 'gif', url: string) => {
    setCurrentExercise(prev => {
      if (mediaType === 'image') {
        return { ...prev, image: url };
      } else if (mediaType === 'video') {
        return { ...prev, videoUrl: url };
      } else {
        return { ...prev, gifUrl: url };
      }
    });
    
    // Se estiver editando um exercício existente, atualizar a lista
    if (editingExerciseIndex !== null) {
      const updatedExercicios = [...treinos[selectedDay]];
      
      if (mediaType === 'image') {
        updatedExercicios[editingExerciseIndex] = {
          ...updatedExercicios[editingExerciseIndex],
          image: url
        };
      } else if (mediaType === 'video') {
        updatedExercicios[editingExerciseIndex] = {
          ...updatedExercicios[editingExerciseIndex],
          videoUrl: url
        };
      } else {
        updatedExercicios[editingExerciseIndex] = {
          ...updatedExercicios[editingExerciseIndex],
          gifUrl: url
        };
      }
      
      setTreinos({
        ...treinos,
        [selectedDay]: updatedExercicios
      });
    }
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
    setCurrentExercise(treinos[selectedDay][index]);
    setEditingExerciseIndex(index);
    setIsAddingExercise(true);
    setShowMediaUploader(false);
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

  // Renderizar o formulário de edição de exercício
  const renderExerciseForm = () => {
    return (
      <div className="bg-white rounded-lg">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-gradient-to-r from-red-600 to-red-500 p-4 rounded-t-lg text-white z-10">
          <h3 className="text-xl font-semibold">
            {editingExerciseIndex !== null ? 'Editar Exercício' : 'Adicionar Novo Exercício'}
          </h3>
          <button
            onClick={() => {
              setIsAddingExercise(false);
              setEditingExerciseIndex(null);
              setShowMediaUploader(false);
              setCurrentExercise({
                name: '',
                sets: 3,
                time: '45 Sec',
                restTime: '1 Min',
                repsPerSet: 10,
                status: 'not-started',
                image: defaultImage
              });
              setSelectedMediaFile(null);
              setSelectedYoutubeUrl('');
            }}
            className="text-white hover:text-red-200 hover:bg-white/20 rounded-full p-1"
          >
            <FaTimes size={24} />
          </button>
        </div>
        
        <div className="space-y-4 p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Exercício
            </label>
            <input
              type="text"
              value={currentExercise.name}
              onChange={(e) => setCurrentExercise({...currentExercise, name: e.target.value})}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Ex: Supino Reto"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Séries
              </label>
              <input
                type="number"
                min="1"
                value={currentExercise.sets}
                onChange={(e) => setCurrentExercise({...currentExercise, sets: parseInt(e.target.value) || 1})}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Repetições por Série
              </label>
              <input
                type="number"
                min="1"
                value={currentExercise.repsPerSet}
                onChange={(e) => setCurrentExercise({...currentExercise, repsPerSet: parseInt(e.target.value) || 1})}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tempo
              </label>
              <select
                value={currentExercise.time}
                onChange={(e) => setCurrentExercise({...currentExercise, time: e.target.value})}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {timerOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tempo de Descanso
              </label>
              <select
                value={currentExercise.restTime}
                onChange={(e) => setCurrentExercise({...currentExercise, restTime: e.target.value})}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {restTimeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Substituir o uploader antigo pelo novo para novos exercícios */}
          {editingExerciseIndex === null ? (
            <MediaUploaderCombinado onMediaSelected={handleMediaSelected} />
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem do Exercício
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative">
                    <img
                      src={currentExercise.image || defaultImage}
                      alt="Imagem do exercício"
                      className="w-20 h-20 object-cover rounded-md border"
                    />
                    {hasMedia(currentExercise) && (
                      <div className="absolute -top-2 -right-2 flex">
                        {currentExercise.videoUrl && (
                          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white" title="Vídeo disponível">
                            <FaVideo size={10} />
                          </span>
                        )}
                        {currentExercise.gifUrl && (
                          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-purple-500 text-white ml-1" title="GIF disponível">
                            <FaFilm size={10} />
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMediaUploader(!showMediaUploader)}
                    className={`px-4 py-2 ${showMediaUploader ? 'bg-gray-600' : 'bg-red-600'} text-white rounded-md hover:opacity-90 transition-opacity flex items-center`}
                  >
                    {showMediaUploader ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Ocultar Uploader
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Adicionar/Alterar Mídia
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {showMediaUploader && currentExercise.id && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                  <MediaUploader
                    exercicioId={currentExercise.id}
                    onMediaUploaded={handleMediaUploaded}
                    currentImage={currentExercise.image}
                    currentVideo={currentExercise.videoUrl}
                    currentGif={currentExercise.gifUrl}
                  />
                </div>
              )}
            </>
          )}
          
          <div className="flex justify-end pt-4 sticky bottom-0 bg-white pb-2 border-t mt-6">
            <button
              onClick={handleSaveExercise}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Salvar Exercício
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar um card de exercício na lista
  const renderExerciseCard = (exercise: Exercise, index: number) => {
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`p-4 border rounded-md mb-4 hover:shadow-md transition-shadow ${
          hasMedia(exercise) ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <div className="relative hidden sm:block">
              <img 
                src={exercise.image || defaultImage} 
                alt={exercise.name}
                className="w-14 h-14 object-cover rounded-md"
              />
              {hasMedia(exercise) && (
                <div className="absolute -top-2 -right-2">
                  {exercise.videoUrl && (
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white" title="Vídeo disponível">
                      <FaVideo size={10} />
                    </span>
                  )}
                </div>
              )}
            </div>
            <div>
              <h4 className="font-medium text-lg">{exercise.name}</h4>
              <div className="text-sm text-gray-600 mt-1 flex flex-wrap gap-2">
                <span className="bg-gray-100 px-2 py-1 rounded-md">{exercise.sets} séries</span>
                <span className="bg-gray-100 px-2 py-1 rounded-md">{exercise.repsPerSet} repetições</span>
                <span className="bg-gray-100 px-2 py-1 rounded-md">{exercise.time}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            {/* Indicadores de mídia */}
            <div className="flex space-x-1 mr-2">
              {exercise.videoUrl && (
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-600" title="Vídeo disponível">
                  <FaVideo size={12} />
                </span>
              )}
              {exercise.gifUrl && (
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600" title="GIF disponível">
                  <FaFilm size={12} />
                </span>
              )}
              {exercise.image && !exercise.image.includes('placeholder') && (
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600" title="Imagem disponível">
                  <FaImage size={12} />
                </span>
              )}
            </div>
            
            {/* Botões de edição e exclusão */}
            <button
              onClick={() => handleEditExercise(index)}
              className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button
              onClick={() => handleRemoveExercise(index)}
              className="p-1 text-red-600 hover:bg-red-100 rounded-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    );
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
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden m-4 relative z-50"
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
            <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-red-600 to-red-500 text-white rounded-t-xl sticky top-0 z-20">
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
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
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
                    <div className="mb-8 sticky top-0 z-10 bg-white pt-2 pb-4">
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
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                      <h3 className="text-lg font-medium text-gray-700">
                        Exercícios para {weekdays[selectedDay]}{' '}
                        <span className="text-gray-500 text-sm">
                          (Dia {selectedDay})
                        </span>
                      </h3>
                        <div className="flex flex-wrap gap-3">
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
                            className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 pb-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          {treinos[selectedDay].map((exercise, index) => (
                              renderExerciseCard(exercise, index)
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
                  </>
                )}
                  </div>

                  {/* Save button */}
              {!isLoading && (
                <div className="flex justify-end border-t p-6 bg-white sticky bottom-0 shadow-md z-10">
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
              )}
            </div>

            {/* Add/Edit Exercise Form Modal */}
            <AnimatePresence>
              {isAddingExercise && (
                <motion.div 
                  className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div 
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => {
                      setIsAddingExercise(false);
                      setEditingExerciseIndex(null);
                    }}
                  />
                  
                  <motion.div 
                    className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto m-4 relative z-50"
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {renderExerciseForm()}
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