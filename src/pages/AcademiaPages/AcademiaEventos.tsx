import { FC, useState, useEffect } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaUserTie, FaTag, FaEdit, FaTrash, FaPlus, FaFilter, FaEye, FaUserCheck } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import { connectionUrl } from '../../config/connection';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

// Definição da interface de evento
interface Evento {
  id: number;
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  local: string;
  tipo: 'ALUNO' | 'PERSONAL' | 'TODOS';
}

// Interface para o formulário
interface EventoForm {
  id?: number;
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  local: string;
  tipo: 'ALUNO' | 'PERSONAL' | 'TODOS';
}

// Interface para presença confirmada
interface PresencaConfirmada {
  id: number;
  eventoId: number;
  userId: number;
  comentario?: string;
  createdAt: string;
  usuario: {
    id: number;
    name: string;
    email: string;
    role: string;
    perfil: any;
  }
}

const AcademiaEventos: FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [currentEvento, setCurrentEvento] = useState<EventoForm>({
    titulo: '',
    descricao: '',
    dataInicio: '',
    dataFim: '',
    local: '',
    tipo: 'TODOS'
  });
  const [filtro, setFiltro] = useState<string>('todos');
  const [mostrarAntigos, setMostrarAntigos] = useState(false);
  const [presencasConfirmadas, setPresencasConfirmadas] = useState<PresencaConfirmada[]>([]);
  const [loadingPresencas, setLoadingPresencas] = useState(false);

  // Função para buscar eventos
  const fetchEventos = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${connectionUrl}/eventos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEventos(data);
      } else {
        console.error('Erro ao buscar eventos');
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível carregar os eventos.',
          confirmButtonColor: '#dc2626',
        });
      }
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Ocorreu um erro ao carregar os eventos.',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para buscar presenças confirmadas de um evento
  const fetchPresencasConfirmadas = async (eventoId: number) => {
    try {
      setLoadingPresencas(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${connectionUrl}/eventos/${eventoId}/presencas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPresencasConfirmadas(data);
      } else {
        console.error('Erro ao buscar presenças confirmadas');
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível carregar as presenças confirmadas.',
          confirmButtonColor: '#dc2626',
        });
      }
    } catch (error) {
      console.error('Erro ao buscar presenças confirmadas:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Ocorreu um erro ao carregar as presenças confirmadas.',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setLoadingPresencas(false);
    }
  };

  // Buscar eventos ao carregar a página
  useEffect(() => {
    fetchEventos();
  }, []);

  // Função para abrir o modal de edição
  const handleEdit = (evento: Evento) => {
    // Converter as datas para o formato do input date
    const dataInicio = new Date(evento.dataInicio).toISOString().split('T')[0];
    const dataFim = new Date(evento.dataFim).toISOString().split('T')[0];

    setCurrentEvento({
      ...evento,
      dataInicio,
      dataFim
    });
    setIsModalOpen(true);
  };

  // Função para abrir o modal de detalhes
  const handleViewDetails = (evento: Evento) => {
    setSelectedEvento(evento);
    fetchPresencasConfirmadas(evento.id);
    setIsDetailsModalOpen(true);
  };

  // Função para abrir o modal de criação
  const handleAdd = () => {
    // Obter a data atual para os inputs
    const hoje = new Date().toISOString().split('T')[0];

    setCurrentEvento({
      titulo: '',
      descricao: '',
      dataInicio: hoje,
      dataFim: hoje,
      local: '',
      tipo: 'TODOS'
    });
    setIsModalOpen(true);
  };

  // Função para salvar evento (criar ou atualizar)
  const handleSave = async () => {
    try {
      if (!currentEvento.titulo || !currentEvento.descricao || !currentEvento.dataInicio || 
          !currentEvento.dataFim || !currentEvento.local || !currentEvento.tipo) {
        Swal.fire({
          icon: 'warning',
          title: 'Campos Incompletos',
          text: 'Por favor, preencha todos os campos.',
          confirmButtonColor: '#dc2626',
        });
        return;
      }

      const token = localStorage.getItem('token');
      const method = currentEvento.id ? 'PUT' : 'POST';
      const url = currentEvento.id 
        ? `${connectionUrl}/eventos/${currentEvento.id}` 
        : `${connectionUrl}/eventos`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(currentEvento)
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: currentEvento.id ? 'Evento Atualizado' : 'Evento Criado',
          text: currentEvento.id 
            ? 'O evento foi atualizado com sucesso.' 
            : 'O evento foi criado com sucesso.',
          confirmButtonColor: '#dc2626',
        });
        setIsModalOpen(false);
        fetchEventos();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar evento');
      }
    } catch (error: any) {
      console.error('Erro ao salvar evento:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: error.message || 'Ocorreu um erro ao salvar o evento.',
        confirmButtonColor: '#dc2626',
      });
    }
  };

  // Função para excluir evento
  const handleDelete = async (eventoId: number) => {
    try {
      const result = await Swal.fire({
        title: 'Confirmar exclusão',
        text: 'Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#4b5563',
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${connectionUrl}/eventos/${eventoId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Evento Excluído',
            text: 'O evento foi excluído com sucesso.',
            confirmButtonColor: '#dc2626',
          });
          fetchEventos();
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao excluir evento');
        }
      }
    } catch (error: any) {
      console.error('Erro ao excluir evento:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: error.message || 'Ocorreu um erro ao excluir o evento.',
        confirmButtonColor: '#dc2626',
      });
    }
  };

  // Função para obter a classe do badge de tipo de evento
  const getTipoBadgeClass = (tipo: string) => {
    switch (tipo) {
      case 'ALUNO':
        return 'bg-blue-100 text-blue-800';
      case 'PERSONAL':
        return 'bg-green-100 text-green-800';
      case 'TODOS':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para obter o ícone do tipo de evento
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'ALUNO':
        return <FaUsers className="mr-1" />;
      case 'PERSONAL':
        return <FaUserTie className="mr-1" />;
      case 'TODOS':
        return <FaUsers className="mr-1" />;
      default:
        return <FaTag className="mr-1" />;
    }
  };

  // Função para formatar data
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Filtrar eventos
  const eventosFiltrados = eventos.filter(evento => {
    // Filtrar por tipo
    if (filtro !== 'todos' && evento.tipo !== filtro) {
      return false;
    }

    // Filtrar por data
    const dataAtual = new Date();
    const dataFimEvento = new Date(evento.dataFim);
    
    if (mostrarAntigos) {
      return dataFimEvento < dataAtual;
    } else {
      return dataFimEvento >= dataAtual;
    }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Eventos</h1>
        <button
          onClick={handleAdd}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FaPlus className="mr-2" /> Novo Evento
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <FaFilter className="text-gray-500 mr-2" />
            <span className="text-gray-700 font-medium">Filtros:</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Tipo:</span>
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="todos">Todos</option>
              <option value="ALUNO">Alunos</option>
              <option value="PERSONAL">Personais</option>
              <option value="TODOS">Geral</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Período:</span>
            <button
              onClick={() => setMostrarAntigos(false)}
              className={`px-3 py-1 rounded-md ${!mostrarAntigos 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Próximos
            </button>
            <button
              onClick={() => setMostrarAntigos(true)}
              className={`px-3 py-1 rounded-md ${mostrarAntigos 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Passados
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Eventos */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-20 bg-gray-200 rounded w-full mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="flex justify-end space-x-2 mt-4">
                <div className="h-8 bg-gray-200 rounded w-8"></div>
                <div className="h-8 bg-gray-200 rounded w-8"></div>
              </div>
            </div>
          ))}
        </div>
      ) : eventosFiltrados.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <FaCalendarAlt className="mx-auto text-gray-400 text-5xl mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">Nenhum evento encontrado</h3>
          <p className="text-gray-500 mb-4">
            {mostrarAntigos 
              ? 'Não há eventos passados para exibir.'
              : 'Não há eventos futuros programados.'}
          </p>
          <button
            onClick={handleAdd}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg inline-flex items-center"
          >
            <FaPlus className="mr-2" /> Criar Novo Evento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {eventosFiltrados.map((evento) => (
            <div key={evento.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{evento.titulo}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getTipoBadgeClass(evento.tipo)}`}>
                    {getTipoIcon(evento.tipo)} {evento.tipo === 'TODOS' ? 'GERAL' : evento.tipo}
                  </span>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center text-gray-600">
                    <FaCalendarAlt className="mr-2 text-red-600" />
                    <span>{formatarData(evento.dataInicio)} a {formatarData(evento.dataFim)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaMapMarkerAlt className="mr-2 text-red-600" />
                    <span>{evento.local}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 mt-2 mb-4 text-sm line-clamp-2">{evento.descricao}</p>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleViewDetails(evento)}
                    className="p-2 rounded-full hover:bg-gray-100 text-blue-600"
                    title="Ver detalhes"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => handleEdit(evento)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                    title="Editar"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(evento.id)}
                    className="p-2 rounded-full hover:bg-gray-100 text-red-600"
                    title="Excluir"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Criação/Edição com backdrop blur */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 backdrop-blur-sm bg-black/30"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl z-10 max-w-xl w-full mx-4 relative"
            >
              {/* Cabeçalho do modal */}
              <div className="flex justify-between items-center p-5 border-b">
                <h3 className="text-lg font-bold text-gray-800">
                  {currentEvento.id ? 'Editar Evento' : 'Novo Evento'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
              
              {/* Corpo do modal (formulário) */}
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Título do evento"
                    value={currentEvento.titulo}
                    onChange={(e) => setCurrentEvento({ ...currentEvento, titulo: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Descrição do evento"
                    rows={3}
                    value={currentEvento.descricao}
                    onChange={(e) => setCurrentEvento({ ...currentEvento, descricao: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Início <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      value={currentEvento.dataInicio}
                      onChange={(e) => setCurrentEvento({ ...currentEvento, dataInicio: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Término <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      value={currentEvento.dataFim}
                      onChange={(e) => setCurrentEvento({ ...currentEvento, dataFim: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Local <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Local do evento"
                    value={currentEvento.local}
                    onChange={(e) => setCurrentEvento({ ...currentEvento, local: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo <span className="text-red-600">*</span>
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    value={currentEvento.tipo}
                    onChange={(e) => setCurrentEvento({ 
                      ...currentEvento, 
                      tipo: e.target.value as 'ALUNO' | 'PERSONAL' | 'TODOS' 
                    })}
                  >
                    <option value="TODOS">Geral (Todos)</option>
                    <option value="ALUNO">Apenas Alunos</option>
                    <option value="PERSONAL">Apenas Personais</option>
                  </select>
                </div>
              </div>
              
              {/* Rodapé do modal */}
              <div className="p-5 border-t flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  {currentEvento.id ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Detalhes do Evento */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedEvento && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 backdrop-blur-sm bg-black/30"
              onClick={() => setIsDetailsModalOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl z-10 max-w-2xl w-full mx-4 relative"
            >
              {/* Cabeçalho do modal */}
              <div className="flex justify-between items-center p-5 border-b">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-gray-800">
                    Detalhes do Evento
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getTipoBadgeClass(selectedEvento.tipo)}`}>
                    {getTipoIcon(selectedEvento.tipo)} {selectedEvento.tipo === 'TODOS' ? 'GERAL' : selectedEvento.tipo}
                  </span>
                </div>
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
              
              {/* Corpo do modal */}
              <div className="p-5">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{selectedEvento.titulo}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <FaCalendarAlt className="mr-2 text-red-600" />
                    <span>Data de Início: {formatarData(selectedEvento.dataInicio)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaCalendarAlt className="mr-2 text-red-600" />
                    <span>Data de Término: {formatarData(selectedEvento.dataFim)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaMapMarkerAlt className="mr-2 text-red-600" />
                    <span>Local: {selectedEvento.local}</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Descrição:</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedEvento.descricao}</p>
                </div>
                
                {/* Lista de Presenças Confirmadas */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-700">Presenças Confirmadas:</h4>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                      {presencasConfirmadas.length} confirmações
                    </span>
                  </div>
                  
                  {loadingPresencas ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
                    </div>
                  ) : presencasConfirmadas.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-lg text-gray-500">
                      <FaUserCheck className="mx-auto mb-2 text-gray-400 text-xl" />
                      <p>Nenhuma presença confirmada ainda</p>
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto border rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perfil</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {presencasConfirmadas.map((presenca) => (
                            <tr key={presenca.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {presenca.usuario.name}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  presenca.usuario.role === 'ALUNO' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {presenca.usuario.role === 'ALUNO' ? 'Aluno' : 'Personal'}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {new Date(presenca.createdAt).toLocaleDateString('pt-BR')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Rodapé do modal */}
              <div className="p-5 border-t flex justify-end space-x-3">
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    handleEdit(selectedEvento);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Editar Evento
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AcademiaEventos; 