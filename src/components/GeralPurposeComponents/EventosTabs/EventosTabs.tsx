import { FC, useState, useEffect } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaEye, FaTimes } from 'react-icons/fa';
import { connectionUrl } from '../../../config/connection';
import { motion } from 'framer-motion';

interface Evento {
  id: number;
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  local: string;
  tipo: 'ALUNO' | 'PERSONAL' | 'TODOS';
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
        // Em modo de produção, exibir dados de exemplo em vez de mostrar erro
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

  // Abrir modal de detalhes
  const handleViewDetails = (evento: Evento) => {
    setSelectedEvento(evento);
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
      {showDetailsModal && selectedEvento && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">Detalhes do Evento</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {isHoje(selectedEvento.dataInicio, selectedEvento.dataFim) && (
                <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full inline-block mb-2">
                  Acontecendo hoje
                </div>
              )}
              
              <h3 className="text-lg font-semibold text-gray-800">{selectedEvento.titulo}</h3>
              
              <div className="space-y-2 mb-3">
                <div className="flex items-center text-gray-600">
                  <FaCalendarAlt className="mr-2 text-blue-600" />
                  <span>Início: {formatarData(selectedEvento.dataInicio)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaCalendarAlt className="mr-2 text-blue-600" />
                  <span>Término: {formatarData(selectedEvento.dataFim)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaMapMarkerAlt className="mr-2 text-blue-600" />
                  <span>Local: {selectedEvento.local}</span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Descrição:</h4>
                <p className="text-gray-600">{selectedEvento.descricao}</p>
              </div>
              
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventosTabs; 