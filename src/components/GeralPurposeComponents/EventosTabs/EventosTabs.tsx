import { FC, useState, useEffect } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaEye, FaTimes, FaCheck, FaUserCheck } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import { connectionUrl } from '../../../config/connection';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

interface Evento {
  id: number;
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  local: string;
  tipo: 'ALUNO' | 'PERSONAL' | 'TODOS';
}

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

interface EventosTabsProps {
  containerClassName?: string;
  userRole: 'ALUNO' | 'PERSONAL' | 'ACADEMIA';
}

const EventosTabs: FC<EventosTabsProps> = ({ containerClassName = "", userRole }) => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'futuros' | 'passados'>('futuros');
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isPresencaConfirmada, setIsPresencaConfirmada] = useState(false);
  const [loadingConfirmacao, setLoadingConfirmacao] = useState(false);
  const [comentario, setComentario] = useState('');
  const [presencasConfirmadas, setPresencasConfirmadas] = useState<PresencaConfirmada[]>([]);
  const [loadingPresencas, setLoadingPresencas] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setIsLoading(true);
        let endpoint = '';
        
        // Definir endpoint baseado no tipo de usuário
        switch (userRole) {
          case 'ALUNO':
            endpoint = '/aluno/eventos';
            break;
          case 'PERSONAL':
            endpoint = '/personal/eventos';
            break;
          case 'ACADEMIA':
            endpoint = '/eventos';
            break;
          default:
            throw new Error('Tipo de usuário não suportado');
        }
        
        const response = await fetch(`${connectionUrl}${endpoint}?futuros=${activeTab === 'futuros'}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          console.error(`Erro ao buscar eventos: ${response.status}`);
          setEventos([]);
          return;
        }

        const data = await response.json();
        setEventos(data);
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        setEventos([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchEventos();
    }
  }, [token, activeTab, userRole]);

  // Verificar se o evento está acontecendo hoje
  const isHoje = (dataInicio: string, dataFim: string) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const dataInicioEvento = new Date(dataInicio);
    dataInicioEvento.setHours(0, 0, 0, 0);
    
    const dataFimEvento = new Date(dataFim);
    dataFimEvento.setHours(23, 59, 59, 999);
    
    return hoje >= dataInicioEvento && hoje <= dataFimEvento;
  };

  // Formatar data
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Verificar se um evento já ocorreu
  const eventoPassado = (dataFim: string) => {
    const hoje = new Date();
    const dataFimEvento = new Date(dataFim);
    return dataFimEvento < hoje;
  };

  // Verificar se o usuário já confirmou presença
  const verificarPresencaConfirmada = async (eventoId: number) => {
    try {
      setLoadingConfirmacao(true);
      const token = localStorage.getItem('token');
      
      let url = '';
      if (userRole === 'ALUNO') {
        url = `${connectionUrl}/eventos/${eventoId}/confirmado`;
      } else if (userRole === 'PERSONAL') {
        url = `${connectionUrl}/personal/eventos/${eventoId}/confirmado`;
      }
      
      if (!url) return;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsPresencaConfirmada(data.confirmado);
        if (data.presenca?.comentario) {
          setComentario(data.presenca.comentario);
        } else {
          setComentario('');
        }
      } else {
        console.error('Erro ao verificar presença:', response.status, response.statusText);
        setIsPresencaConfirmada(false);
      }
    } catch (error) {
      console.error('Erro ao verificar presença:', error);
      setIsPresencaConfirmada(false);
    } finally {
      setLoadingConfirmacao(false);
    }
  };

  // Buscar presenças confirmadas para o evento (apenas para ACADEMIA)
  const fetchPresencasConfirmadas = async (eventoId: number) => {
    if (userRole !== 'ACADEMIA') return;
    
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
        setPresencasConfirmadas([]);
      }
    } catch (error) {
      console.error('Erro ao buscar presenças confirmadas:', error);
      setPresencasConfirmadas([]);
    } finally {
      setLoadingPresencas(false);
    }
  };

  // Confirmar presença no evento
  const confirmarPresenca = async () => {
    try {
      if (!selectedEvento) return;
      
      setLoadingConfirmacao(true);
      const token = localStorage.getItem('token');
      
      let url = '';
      if (userRole === 'ALUNO') {
        url = `${connectionUrl}/eventos/${selectedEvento.id}/confirmar`;
      } else if (userRole === 'PERSONAL') {
        url = `${connectionUrl}/personal/eventos/${selectedEvento.id}/confirmar`;
      }
      
      if (!url) return;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ comentario })
      });

      if (response.ok) {
        setIsPresencaConfirmada(true);
        Swal.fire({
          icon: 'success',
          title: 'Presença Confirmada',
          text: 'Sua presença foi confirmada com sucesso.',
          confirmButtonColor: userRole === 'ALUNO' ? '#3b82f6' : '#10b981',
        });
      } else {
        console.error('Erro ao confirmar presença:', response.status, response.statusText);
        let errorMessage = 'Ocorreu um erro ao confirmar sua presença.';
        try {
          const errorText = await response.text();
          console.error('Resposta do servidor:', errorText);
          if (errorText.includes('{')) {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
          } else {
            errorMessage = `Erro ${response.status}: ${errorText.substring(0, 100)}...`;
          }
        } catch {
          console.error('Não foi possível ler o corpo da resposta');
        }
        
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Erro ao confirmar presença:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: error.message || 'Ocorreu um erro ao confirmar sua presença.',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setLoadingConfirmacao(false);
    }
  };

  // Cancelar presença no evento
  const cancelarPresenca = async () => {
    try {
      if (!selectedEvento) return;
      
      const result = await Swal.fire({
        title: 'Cancelar Presença',
        text: 'Tem certeza que deseja cancelar sua presença neste evento?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: userRole === 'ALUNO' ? '#3b82f6' : '#10b981',
        cancelButtonColor: '#4b5563',
        confirmButtonText: 'Sim, cancelar',
        cancelButtonText: 'Voltar'
      });

      if (result.isConfirmed) {
        setLoadingConfirmacao(true);
        const token = localStorage.getItem('token');
        
        let url = '';
        if (userRole === 'ALUNO') {
          url = `${connectionUrl}/eventos/${selectedEvento.id}/confirmar`;
        } else if (userRole === 'PERSONAL') {
          url = `${connectionUrl}/personal/eventos/${selectedEvento.id}/confirmar`;
        }
        
        if (!url) return;
        
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsPresencaConfirmada(false);
          setComentario('');
          Swal.fire({
            icon: 'success',
            title: 'Presença Cancelada',
            text: 'Sua presença foi cancelada com sucesso.',
            confirmButtonColor: userRole === 'ALUNO' ? '#3b82f6' : '#10b981',
          });
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao cancelar presença');
        }
      }
    } catch (error: any) {
      console.error('Erro ao cancelar presença:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: error.message || 'Ocorreu um erro ao cancelar sua presença.',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setLoadingConfirmacao(false);
    }
  };

  // Abrir modal de detalhes
  const handleViewDetails = (evento: Evento) => {
    setSelectedEvento(evento);
    
    // Verificar presença confirmada para ALUNO e PERSONAL
    if (userRole === 'ALUNO' || userRole === 'PERSONAL') {
      verificarPresencaConfirmada(evento.id);
    }
    
    // Carregar lista de presenças para ACADEMIA
    if (userRole === 'ACADEMIA') {
      fetchPresencasConfirmadas(evento.id);
    }
    
    setShowDetailsModal(true);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${containerClassName}`}>
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Eventos da Academia</h2>
        </div>
      </div>

      {/* Abas */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('futuros')}
          className={`flex-1 py-2 px-4 text-center relative ${
            activeTab === 'futuros'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center">
            <FaCalendarAlt className="mr-2" />
            <span>Eventos Ativos</span>
          </div>
          {activeTab === 'futuros' && (
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-blue-500 w-full"
              layoutId="activeTabIndicator"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('passados')}
          className={`flex-1 py-2 px-4 text-center relative ${
            activeTab === 'passados'
              ? 'text-gray-600 border-b-2 border-gray-500'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center">
            <FaCalendarAlt className="mr-2" />
            <span>Eventos Passados</span>
          </div>
          {activeTab === 'passados' && (
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-gray-500 w-full"
              layoutId="activeTabIndicator"
            />
          )}
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : eventos.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaCalendarAlt className="text-gray-400 text-lg" />
            </div>
            <p className="text-gray-500">
              {activeTab === 'futuros' && 'Não há eventos ativos no momento'}
              {activeTab === 'passados' && 'Não há eventos passados para exibir'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-80 overflow-y-auto">
            {eventos.map((evento) => (
              <div 
                key={evento.id} 
                className={`bg-white rounded-lg border overflow-hidden ${
                  isHoje(evento.dataInicio, evento.dataFim) && activeTab === 'futuros'
                    ? 'border-l-4 border-green-500' 
                    : 'border'
                }`}
              >
                <div className="p-3">
                  {isHoje(evento.dataInicio, evento.dataFim) && activeTab === 'futuros' && (
                    <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full inline-block mb-2">
                      Acontecendo hoje
                    </div>
                  )}
                  
                  <h3 className="font-bold text-md text-gray-800 mb-2">{evento.titulo}</h3>
                  
                  <div className="space-y-1 mb-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaCalendarAlt className="mr-2 text-blue-600" />
                      <span>{formatarData(evento.dataInicio)} a {formatarData(evento.dataFim)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaMapMarkerAlt className="mr-2 text-blue-600" />
                      <span>{evento.local}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{evento.descricao}</p>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleViewDetails(evento)}
                      className="px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm"
                    >
                      <FaEye className="mr-1" /> Detalhes
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Evento */}
      <AnimatePresence>
      {showDetailsModal && selectedEvento && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 backdrop-blur-sm bg-black/30"
              onClick={() => setShowDetailsModal(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl z-10 max-w-2xl w-full mx-4 relative"
            >
              {/* Cabeçalho do modal */}
              <div className="flex justify-between items-center p-5 border-b">
                <h3 className="text-lg font-bold text-gray-800">
                  Detalhes do Evento
                </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                  <FiX size={20} />
              </button>
            </div>

              {/* Corpo do modal */}
              <div className="p-5">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{selectedEvento.titulo}</h2>
                
              {isHoje(selectedEvento.dataInicio, selectedEvento.dataFim) && (
                  <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full inline-block mb-4">
                  Acontecendo hoje
                </div>
              )}
              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-gray-600">
                  <FaCalendarAlt className="mr-2 text-blue-600" />
                    <span>Data de Início: {formatarData(selectedEvento.dataInicio)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaCalendarAlt className="mr-2 text-blue-600" />
                    <span>Data de Término: {formatarData(selectedEvento.dataFim)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaMapMarkerAlt className="mr-2 text-blue-600" />
                  <span>Local: {selectedEvento.local}</span>
                </div>
              </div>
              
                <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">Descrição:</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedEvento.descricao}</p>
                </div>
                
                {/* Confirmação de Presença para ALUNO e PERSONAL */}
                {(userRole === 'ALUNO' || userRole === 'PERSONAL') && !eventoPassado(selectedEvento.dataFim) && (
                  <div className="mb-3 bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">Confirmação de presença:</h4>
                    
                    {loadingConfirmacao ? (
                      <div className="flex justify-center py-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
                      </div>
                    ) : isPresencaConfirmada ? (
                      <div>
                        <div className="flex items-center text-green-700 mb-3">
                          <FaCheck className="mr-2" />
                          <span>Você confirmou presença neste evento!</span>
                        </div>
                        
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Seu comentário:
                          </label>
                          <textarea
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Adicione um comentário (opcional)"
                            rows={2}
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            disabled={loadingConfirmacao}
                          />
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={confirmarPresenca}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                            disabled={loadingConfirmacao}
                          >
                            Atualizar comentário
                          </button>
                          
                          <button
                            onClick={cancelarPresenca}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
                            disabled={loadingConfirmacao}
                          >
                            <FaTimes className="mr-1" /> Cancelar presença
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-600 mb-3">
                          Você ainda não confirmou presença. Gostaria de confirmar?
                        </p>
                        
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Comentário (opcional):
                          </label>
                          <textarea
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Adicione um comentário opcional"
                            rows={2}
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            disabled={loadingConfirmacao}
                          />
                        </div>
                        
                        <button
                          onClick={confirmarPresenca}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                          disabled={loadingConfirmacao}
                        >
                          <FaCheck className="mr-2" /> Confirmar presença
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Lista de Presenças Confirmadas para ACADEMIA */}
                {userRole === 'ACADEMIA' && (
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
                )}
              </div>
              
              {/* Rodapé do modal */}
              <div className="p-5 border-t flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default EventosTabs; 