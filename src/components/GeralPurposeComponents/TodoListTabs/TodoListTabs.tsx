import { FC, useState, useEffect } from 'react';
import { FaClock, FaCheck, FaExclamationTriangle, FaCalendarAlt, FaTimes, FaPlus } from 'react-icons/fa';
import { connectionUrl } from '../../../config/connection';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'overdue';
  dueDate: string;
  createdAt: string;
  createdBy: number;
  assignedTo: number | null;
  creator: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  assignee?: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
  deletable: boolean;
}

interface TodoListTabsProps {
  containerClassName?: string;
}

const TodoListTabs: FC<TodoListTabsProps> = ({ containerClassName = "" }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overdue' | 'pending' | 'completed'>('pending');
  const [showAddModal, setShowAddModal] = useState(false);
  const token = localStorage.getItem('token');

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

  // Filtrar tarefas com base na aba ativa
  const getFilteredTasks = () => {
    return tasks.filter(task => task.status === activeTab);
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

  // Contar tarefas por status
  const countTasks = (status: 'pending' | 'completed' | 'overdue') => {
    return tasks.filter(task => task.status === status).length;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${containerClassName}`}>
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Lista de Tarefas</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-sm flex items-center"
          >
            <FaPlus className="mr-1" /> Nova Tarefa
          </button>
        </div>
      </div>

      {/* Abas */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('overdue')}
          className={`flex-1 py-2 px-4 text-center relative ${
            activeTab === 'overdue'
              ? 'text-red-600 border-b-2 border-red-500'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center">
            <FaExclamationTriangle className="mr-2" />
            <span>Vencidas</span>
            <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">{countTasks('overdue')}</span>
          </div>
          {activeTab === 'overdue' && (
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-red-500 w-full"
              layoutId="activeTabIndicator"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2 px-4 text-center relative ${
            activeTab === 'pending'
              ? 'text-yellow-600 border-b-2 border-yellow-500'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center">
            <FaClock className="mr-2" />
            <span>Pendentes</span>
            <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">{countTasks('pending')}</span>
          </div>
          {activeTab === 'pending' && (
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-yellow-500 w-full"
              layoutId="activeTabIndicator"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2 px-4 text-center relative ${
            activeTab === 'completed'
              ? 'text-green-600 border-b-2 border-green-500'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center">
            <FaCheck className="mr-2" />
            <span>Realizadas</span>
            <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{countTasks('completed')}</span>
          </div>
          {activeTab === 'completed' && (
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-green-500 w-full"
              layoutId="activeTabIndicator"
            />
          )}
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : getFilteredTasks().length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaCalendarAlt className="text-gray-400 text-lg" />
            </div>
            <p className="text-gray-500">
              {activeTab === 'overdue' && 'Não há tarefas vencidas'}
              {activeTab === 'pending' && 'Não há tarefas pendentes'}
              {activeTab === 'completed' && 'Não há tarefas concluídas'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {getFilteredTasks().map((task) => (
              <div key={task.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-800">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-2">
                      <FaCalendarAlt className="mr-1" />
                      <span>{formatDate(task.dueDate)}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {task.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                        className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                        title="Marcar como concluída"
                      >
                        <FaCheck size={12} />
                      </button>
                    )}
                    {task.status === 'completed' && (
                      <button
                        onClick={() => handleUpdateTaskStatus(task.id, 'pending')}
                        className="p-1 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200"
                        title="Marcar como pendente"
                      >
                        <FaClock size={12} />
                      </button>
                    )}
                    {task.status === 'overdue' && (
                      <button
                        onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                        className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                        title="Marcar como concluída"
                      >
                        <FaCheck size={12} />
                      </button>
                    )}
                    {task.deletable && (
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                        title="Excluir tarefa"
                      >
                        <FaTimes size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para adicionar tarefa */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">Adicionar Nova Tarefa</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-4 space-y-4">
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

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoListTabs; 