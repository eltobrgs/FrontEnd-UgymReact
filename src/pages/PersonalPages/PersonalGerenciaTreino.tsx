import { FC, useState, useEffect } from 'react';
import { FaSearch, FaDumbbell, FaUser, FaCalendarAlt } from 'react-icons/fa';
import { connectionUrl } from '../../config/connection';
import Swal from 'sweetalert2';
import WorkoutEditModal from '../../components/GeralPurposeComponents/StudentCard/WorkoutEditModal';

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

interface Treino {
  id: number;
  diaSemana: number;
  exercicios: Exercicio[];
}

interface Aluno {
  alunoId: number;
  userId: number;
  nome: string;
  email: string;
  treinos: Treino[];
}

const PersonalGerenciaTreino: FC = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAlunos, setFilteredAlunos] = useState<Aluno[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para o modal de edição de treino
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<{id: number, nome: string} | null>(null);
  
  // Buscar todos os treinos de todos os alunos vinculados ao personal
  useEffect(() => {
    const fetchTreinos = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token não encontrado');
        }

        const response = await fetch(`${connectionUrl}/personal/treinos`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar treinos');
        }

        const data = await response.json();
        setAlunos(data);
        setFilteredAlunos(data);
      } catch (error) {
        console.error('Erro ao buscar treinos:', error);
        Swal.fire('Erro', 'Não foi possível carregar os treinos dos alunos', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTreinos();
  }, []);

  // Filtrar alunos quando o termo de pesquisa mudar
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAlunos(alunos);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = alunos.filter(aluno => 
      aluno.nome.toLowerCase().includes(searchTermLower) ||
      aluno.email.toLowerCase().includes(searchTermLower)
    );
    
    setFilteredAlunos(filtered);
  }, [searchTerm, alunos]);

  // Abrir modal para editar treino de um aluno
  const handleEditWorkout = (alunoId: number, nome: string) => {
    setSelectedAluno({ id: alunoId, nome });
    setShowWorkoutModal(true);
  };

  // Contar o total de exercícios de um aluno
  const countTotalExercicios = (treinos: Treino[]) => {
    return treinos.reduce((total, treino) => total + treino.exercicios.length, 0);
  };

  // Verificar quantos dias da semana têm treinos cadastrados
  const countDiasComTreino = (treinos: Treino[]) => {
    const diasUnicos = new Set(treinos.map(treino => treino.diaSemana));
    return diasUnicos.size;
  };

  // Calcular cores de status para o card do aluno
  const calcularStatusCores = (treinos: Treino[]) => {
    if (treinos.length === 0) return { corStatus: 'bg-gray-200', texto: 'Sem treinos' };
    
    const totalExercicios = countTotalExercicios(treinos);
    if (totalExercicios === 0) return { corStatus: 'bg-gray-200', texto: 'Sem exercícios' };
    
    const exerciciosCompletos = treinos.reduce((acc, treino) => {
      return acc + treino.exercicios.filter(ex => ex.status === 'completed').length;
    }, 0);
    
    const progresso = (exerciciosCompletos / totalExercicios) * 100;
    
    if (progresso === 0) return { corStatus: 'bg-red-200', texto: 'Não iniciado' };
    if (progresso < 50) return { corStatus: 'bg-orange-200', texto: 'Iniciado' };
    if (progresso < 100) return { corStatus: 'bg-blue-200', texto: 'Em progresso' };
    return { corStatus: 'bg-green-200', texto: 'Completo' };
  };

  // Quando o modal for fechado, atualizar a lista de treinos
  const handleModalClose = () => {
    setShowWorkoutModal(false);
    setSelectedAluno(null);
    
    // Atualizar a lista de treinos após fechar o modal
    const fetchTreinos = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${connectionUrl}/personal/treinos`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) return;
        const data = await response.json();
        setAlunos(data);
        setFilteredAlunos(
          searchTerm ? 
            data.filter((aluno: Aluno) => 
              aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
              aluno.email.toLowerCase().includes(searchTerm.toLowerCase())
            ) : 
            data
        );
      } catch (error) {
        console.error('Erro ao atualizar treinos:', error);
      }
    };

    fetchTreinos();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Gerenciamento de Treinos
          </h1>
          <p className="text-xl text-gray-600">
            Visualize e gerencie os treinos dos seus alunos
          </p>
        </div>

        {/* Barra de Pesquisa */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nome ou email do aluno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Lista de Cards */}
        {filteredAlunos.length === 0 ? (
          <div className="text-center text-gray-600">
            <p className="text-xl">Nenhum aluno encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAlunos.map((aluno: Aluno) => {
              const { corStatus, texto } = calcularStatusCores(aluno.treinos);
              const totalExercicios = countTotalExercicios(aluno.treinos);
              const diasComTreino = countDiasComTreino(aluno.treinos);
              
              return (
                <div 
                  key={aluno.userId}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => handleEditWorkout(aluno.userId, aluno.nome)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <FaUser className="text-blue-600 mr-3" size={24} />
                        <div>
                          <h3 className="text-lg font-semibold">{aluno.nome}</h3>
                          <p className="text-sm text-gray-600">{aluno.email}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full ${corStatus} text-sm font-medium`}>
                        {texto}
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center text-gray-700">
                          <FaDumbbell className="mr-2 text-blue-600" />
                          <span className="text-sm">
                            {totalExercicios} exercício{totalExercicios !== 1 ? 's' : ''}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-700">
                          <FaCalendarAlt className="mr-2 text-blue-600" />
                          <span className="text-sm">
                            {diasComTreino} dia{diasComTreino !== 1 ? 's' : ''} com treino
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-5">
                      <button 
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition"
                      >
                        <FaDumbbell className="mr-2" /> Gerenciar Treinos
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de edição de treino */}
      {showWorkoutModal && selectedAluno && (
        <WorkoutEditModal
          isOpen={showWorkoutModal}
          onClose={handleModalClose}
          alunoId={selectedAluno.id}
          alunoName={selectedAluno.nome}
        />
      )}
    </div>
  );
};

export default PersonalGerenciaTreino; 