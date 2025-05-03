import { FC, useState, useEffect } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaEye, FaCheck, FaTimes } from 'react-icons/fa';
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

const PersonalEventos: FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mostrarAntigos, setMostrarAntigos] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [isPresencaConfirmada, setIsPresencaConfirmada] = useState(false);
  const [loadingConfirmacao, setLoadingConfirmacao] = useState(false);
  const [comentario, setComentario] = useState('');

  // Função para buscar eventos
  const fetchEventos = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const url = `${connectionUrl}/personal/eventos${mostrarAntigos ? '?futuros=false' : '?futuros=true'}`;
      
      const response = await fetch(url, {
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

  // Verificar se o personal já confirmou presença
  const verificarPresencaConfirmada = async (eventoId: number) => {
    try {
      setLoadingConfirmacao(true);
      const token = localStorage.getItem('token');
      console.log(`Verificando presença: ${connectionUrl}/personal/eventos/${eventoId}/confirmado`);
      const response = await fetch(`${connectionUrl}/personal/eventos/${eventoId}/confirmado`, {
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
        try {
          const errorText = await response.text();
          console.error('Resposta do servidor:', errorText);
        } catch {
          console.error('Não foi possível ler o corpo da resposta');
        }
        setIsPresencaConfirmada(false);
      }
    } catch (error) {
      console.error('Erro ao verificar presença:', error);
      setIsPresencaConfirmada(false);
    } finally {
      setLoadingConfirmacao(false);
    }
  };

  // Confirmar presença no evento
  const confirmarPresenca = async () => {
    try {
      if (!selectedEvento) return;
      
      setLoadingConfirmacao(true);
      const token = localStorage.getItem('token');
      console.log(`Confirmando presença: ${connectionUrl}/personal/eventos/${selectedEvento.id}/confirmar`);
      const response = await fetch(`${connectionUrl}/personal/eventos/${selectedEvento.id}/confirmar`, {
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
          confirmButtonColor: '#10b981',
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
    } catch (error: unknown) {
      console.error('Erro ao confirmar presença:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: error instanceof Error ? error.message : 'Ocorreu um erro ao confirmar sua presença.',
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
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#4b5563',
        confirmButtonText: 'Sim, cancelar',
        cancelButtonText: 'Voltar'
      });

      if (result.isConfirmed) {
        setLoadingConfirmacao(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${connectionUrl}/personal/eventos/${selectedEvento.id}/confirmar`, {
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
            confirmButtonColor: '#10b981',
          });
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao cancelar presença');
        }
      }
    } catch (error: unknown) {
      console.error('Erro ao cancelar presença:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: error instanceof Error ? error.message : 'Ocorreu um erro ao cancelar sua presença.',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setLoadingConfirmacao(false);
    }
  };

  // Buscar eventos ao carregar a página ou quando o filtro mudar
  useEffect(() => {
    fetchEventos();
  }, [mostrarAntigos]);

  // Função para abrir o modal de detalhes
  const handleViewDetails = (evento: Evento) => {
    setSelectedEvento(evento);
    verificarPresencaConfirmada(evento.id);
    setIsDetailsModalOpen(true);
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

  // Função para verificar se o evento está ocorrendo hoje
  const isHoje = (dataInicio: string, dataFim: string) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const dataInicioObj = new Date(dataInicio);
    dataInicioObj.setHours(0, 0, 0, 0);
    
    const dataFimObj = new Date(dataFim);
    dataFimObj.setHours(0, 0, 0, 0);
    
    return hoje >= dataInicioObj && hoje <= dataFimObj;
  };

  // Verificar se um evento já ocorreu
  const eventoPassado = (dataFim: string) => {
    const hoje = new Date();
    const dataFimEvento = new Date(dataFim);
    return dataFimEvento < hoje;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Eventos da Academia</h1>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMostrarAntigos(false)}
            className={`px-3 py-1 rounded-md ${!mostrarAntigos 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Próximos
          </button>
          <button
            onClick={() => setMostrarAntigos(true)}
            className={`px-3 py-1 rounded-md ${mostrarAntigos 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Passados
          </button>
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
            </div>
          ))}
        </div>
      ) : eventos.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <FaCalendarAlt className="mx-auto text-gray-400 text-5xl mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">Nenhum evento encontrado</h3>
          <p className="text-gray-500">
            {mostrarAntigos 
              ? 'Não há eventos passados para exibir.'
              : 'Não há eventos futuros programados.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {eventos.map((evento) => (
            <div 
              key={evento.id} 
              className={`bg-white rounded-lg shadow-sm overflow-hidden border-l-4 ${
                isHoje(evento.dataInicio, evento.dataFim) 
                  ? 'border-green-500' 
                  : 'border-green-500'
              }`}
            >
              <div className="p-4">
                {isHoje(evento.dataInicio, evento.dataFim) && (
                  <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full inline-block mb-2">
                    Acontecendo hoje
                  </div>
                )}
                
                <h3 className="font-bold text-lg text-gray-800 mb-2">{evento.titulo}</h3>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center text-gray-600">
                    <FaCalendarAlt className="mr-2 text-green-600" />
                    <span>{formatarData(evento.dataInicio)} a {formatarData(evento.dataFim)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaMapMarkerAlt className="mr-2 text-green-600" />
                    <span>{evento.local}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 mt-2 text-sm line-clamp-2">{evento.descricao}</p>
                
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => handleViewDetails(evento)}
                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                  >
                    <FaEye className="mr-1" /> Detalhes
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
                <h3 className="text-lg font-bold text-gray-800">
                  Detalhes do Evento
                </h3>
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
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
                    <FaCalendarAlt className="mr-2 text-green-600" />
                    <span>Data de Início: {formatarData(selectedEvento.dataInicio)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaCalendarAlt className="mr-2 text-green-600" />
                    <span>Data de Término: {formatarData(selectedEvento.dataFim)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaMapMarkerAlt className="mr-2 text-green-600" />
                    <span>Local: {selectedEvento.local}</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Descrição:</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedEvento.descricao}</p>
                </div>
                
                {/* Confirmação de Presença */}
                {!eventoPassado(selectedEvento.dataFim) && (
                  <div className="mb-3 bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">Confirmação de presença:</h4>
                    
                    {loadingConfirmacao ? (
                      <div className="flex justify-center py-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-700"></div>
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
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
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
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Adicione um comentário opcional"
                            rows={2}
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            disabled={loadingConfirmacao}
                          />
                        </div>
                        
                        <button
                          onClick={confirmarPresenca}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                          disabled={loadingConfirmacao}
                        >
                          <FaCheck className="mr-2" /> Confirmar presença
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Rodapé do modal */}
              <div className="p-5 border-t flex justify-end">
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
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

export default PersonalEventos; 