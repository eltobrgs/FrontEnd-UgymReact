import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaCheck, FaClock, FaTrash, FaExclamationTriangle, FaTimes, FaUser, FaCalendarAlt } from 'react-icons/fa';
import { connectionUrl } from '../../config/connection';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import Swal from 'sweetalert2';

interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  deletable: boolean;
  createdBy: number;
  assignedTo: number | null;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  assignee: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const TodoList = () => {
  const { userData } = useUser();
  const { token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [assignableUsers, setAssignableUsers] = useState<User[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'createdAt'>('dueDate');
  const [searchTerm, setSearchTerm] = useState('');

  // Novo estado para o formulário de tarefa
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignedTo: '',
    deletable: true
  });

  // Carregar tarefas
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${connectionUrl}/tasks`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar tarefas');
        }

        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
        Swal.fire('Erro', 'Não foi possível carregar as tarefas', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchTasks();
    }
  }, [token]);

  // Carregar usuários que podem receber tarefas
  useEffect(() => {
    const fetchAssignableUsers = async () => {
      // Apenas academias e personais podem atribuir tarefas
      if (!userData || (userData.role !== 'ACADEMIA' && userData.role !== 'PERSONAL')) {
        return;
      }

      try {
        const response = await fetch(`${connectionUrl}/users-for-tasks`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar usuários');
        }

        const data = await response.json();
        setAssignableUsers(data);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      }
    };

    if (token && userData) {
      fetchAssignableUsers();
    }
  }, [token, userData]);

  // Criar nova tarefa
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validar data
      if (new Date(newTask.dueDate) < new Date()) {
        Swal.fire('Atenção', 'A data de vencimento não pode ser no passado', 'warning');
        return;
      }

      const response = await fetch(`${connectionUrl}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTask)
      });

      if (!response.ok) {
        throw new Error('Erro ao criar tarefa');
      }

      const createdTask = await response.json();
      setTasks(prev => [...prev, createdTask]);
      setShowAddModal(false);
      
      // Limpar formulário
      setNewTask({
        title: '',
        description: '',
        dueDate: '',
        assignedTo: '',
        deletable: true
      });

      Swal.fire('Sucesso', 'Tarefa criada com sucesso', 'success');
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      Swal.fire('Erro', 'Não foi possível criar a tarefa', 'error');
    }
  };

  // Atualizar status da tarefa
  const handleUpdateTaskStatus = async (id: number, newStatus: 'pending' | 'completed' | 'overdue') => {
    try {
      const response = await fetch(`${connectionUrl}/tasks/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status da tarefa');
      }

      const updatedTask = await response.json();
      
      // Atualizar a tarefa na lista
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ));

      Swal.fire({
        icon: 'success',
        title: 'Status atualizado',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
      Swal.fire('Erro', 'Não foi possível atualizar o status da tarefa', 'error');
    }
  };

  // Excluir tarefa
  const handleDeleteTask = async (id: number) => {
    try {
      // Confirmação antes de excluir
      const confirmResult = await Swal.fire({
        title: 'Tem certeza?',
        text: 'Esta ação não pode ser desfeita',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar'
      });

      if (!confirmResult.isConfirmed) {
        return;
      }

      const response = await fetch(`${connectionUrl}/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir tarefa');
      }

      // Remover a tarefa da lista
      setTasks(prev => prev.filter(task => task.id !== id));

      Swal.fire('Excluída', 'A tarefa foi excluída com sucesso', 'success');
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      Swal.fire('Erro', 'Não foi possível excluir a tarefa', 'error');
    }
  };

  // Obter tarefas filtradas e ordenadas
  const getFilteredTasks = () => {
    return tasks
      .filter(task => {
        // Filtrar por status
        if (filterStatus !== 'all' && task.status !== filterStatus) {
          return false;
        }
        
        // Filtrar por pesquisa
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          return (
            task.title.toLowerCase().includes(searchLower) ||
            task.description.toLowerCase().includes(searchLower) ||
            task.creator.name.toLowerCase().includes(searchLower) ||
            (task.assignee && task.assignee.name.toLowerCase().includes(searchLower))
          );
        }
        
        return true;
      })
      .sort((a, b) => {
        // Ordenar por data de vencimento ou criação
        const dateA = new Date(sortBy === 'dueDate' ? a.dueDate : a.createdAt);
        const dateB = new Date(sortBy === 'dueDate' ? b.dueDate : b.createdAt);
        return dateA.getTime() - dateB.getTime();
      });
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Verificar se o usuário é o criador da tarefa
  const isTaskCreator = (task: Task) => {
    return userData && task.creator.id === userData.id;
  };

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'overdue':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Obter texto do status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'completed':
        return 'Concluída';
      case 'overdue':
        return 'Atrasada';
      default:
        return 'Desconhecido';
    }
  };

  // Obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FaClock />;
      case 'completed':
        return <FaCheck />;
      case 'overdue':
        return <FaExclamationTriangle />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Lista de Tarefas</h1>
            <p className="text-gray-600">Gerencie suas tarefas e lembre-se do que precisa ser feito</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md flex items-center transition-colors"
            >
              <FaPlus className="mr-2" />
              Adicionar Tarefa
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pesquisa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pesquisar</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Título, descrição ou nome"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Filtro de Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendentes</option>
                <option value="completed">Concluídas</option>
                <option value="overdue">Atrasadas</option>
              </select>
            </div>

            {/* Ordenação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="dueDate">Data de Vencimento</option>
                <option value="createdAt">Data de Criação</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Tarefas */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : getFilteredTasks().length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCalendarAlt className="text-red-600 text-xl" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Nenhuma tarefa encontrada</h2>
            <p className="text-gray-600">
              {filterStatus !== 'all' || searchTerm
                ? 'Tente ajustar seus filtros para ver mais tarefas'
                : 'Clique em "Adicionar Tarefa" para criar sua primeira tarefa'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {getFilteredTasks().map(task => (
              <motion.div 
                key={task.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${getStatusColor(task.status)}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-gray-800 truncate">{task.title}</h3>
                    <div className={`px-2 py-1 rounded-full text-white text-xs flex items-center ${getStatusColor(task.status)}`}>
                      {getStatusIcon(task.status)}
                      <span className="ml-1">{getStatusText(task.status)}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">{task.description || "Sem descrição"}</p>
                  
                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaCalendarAlt className="mr-2 text-red-500" />
                      <span>Vencimento: {formatDate(task.dueDate)}</span>
                    </div>
                    
                    {task.assignee && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FaUser className="mr-2 text-red-500" />
                        <span>Atribuído para: {task.assignee.name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <FaUser className="mr-2 text-red-500" />
                      <span>Criado por: {task.creator.name}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                    {/* Botões de ação dependendo do status */}
                    <div className="space-x-2">
                      {task.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm transition-colors"
                          title="Marcar como concluída"
                        >
                          <FaCheck />
                        </button>
                      )}
                      
                      {task.status === 'completed' && (
                        <button
                          onClick={() => handleUpdateTaskStatus(task.id, 'pending')}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-sm transition-colors"
                          title="Marcar como pendente"
                        >
                          <FaClock />
                        </button>
                      )}
                      
                      {task.status === 'overdue' && (
                        <button
                          onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm transition-colors"
                          title="Marcar como concluída mesmo atrasada"
                        >
                          <FaCheck />
                        </button>
                      )}
                    </div>
                    
                    {/* Botão de excluir (apenas para o criador e se for deletable) */}
                    {isTaskCreator(task) && task.deletable && (
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm transition-colors"
                        title="Excluir tarefa"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para adicionar tarefa */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex justify-between items-center p-5 border-b">
                <h2 className="text-xl font-bold text-gray-800">Adicionar Nova Tarefa</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Digite o título da tarefa"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Descreva a tarefa"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento *</label>
                  <input
                    type="datetime-local"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Mostrar seleção de usuário apenas para academias e personais */}
                {userData && (userData.role === 'ACADEMIA' || userData.role === 'PERSONAL') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Atribuir para</label>
                    <select
                      value={newTask.assignedTo}
                      onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Ninguém (apenas eu)</option>
                      {assignableUsers.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.role === 'ALUNO' ? 'Aluno' : 'Personal'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="deletable"
                    checked={newTask.deletable}
                    onChange={(e) => setNewTask({ ...newTask, deletable: e.target.checked })}
                    className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="deletable" className="ml-2 block text-sm text-gray-700">
                    Permitir exclusão futura
                  </label>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Adicionar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TodoList; 