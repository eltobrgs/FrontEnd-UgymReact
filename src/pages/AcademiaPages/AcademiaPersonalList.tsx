import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaPlus } from 'react-icons/fa';
import { connectionUrl } from '../../config/connection';
import LoadingSpinner from '../../components/GeralPurposeComponents/LoadingSpinner/LoadingSpinner';
import PersonalCard from '../../components/PersonalComponents/PersonalCard';
import { useUser } from '../../contexts/UserContext';

interface Personal {
  id: number;
  name: string;
  email: string;
  cref: string;
  yearsOfExperience?: string;
  workLocation?: string;
  pricePerHour?: string;
  specializations?: string[];
}

const AcademiaPersonalList = () => {
  const { userData } = useUser();
  const [personals, setPersonals] = useState<Personal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPersonals, setFilteredPersonals] = useState<Personal[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchPersonals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Verificar se o usuário está logado e tem informações da academia
      if (!userData || !userData.academia?.id) {
        throw new Error('Informações da academia não encontradas');
      }

      const academiaId = userData.academia.id;
      console.log('ID da academia:', academiaId);
      
      // Usar o endpoint público com o parâmetro academiaId
      const url = `${connectionUrl}/personais/listar?academiaId=${academiaId}`;
      console.log('Buscando personais no URL:', url);
      
      // Obter o token de autenticação do localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }
      
      // Incluir o token no cabeçalho Authorization
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Status da resposta:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Resposta de erro completa:', errorText);
        throw new Error(`Falha ao buscar personais (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('Dados recebidos:', data);
      
      setPersonals(data);
      setFilteredPersonals(data);
    } catch (error) {
      console.error('Erro ao buscar personais:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonals();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPersonals(personals);
    } else {
      const filtered = personals.filter((personal) => {
        const searchableFields = [
          personal.name.toLowerCase(),
          personal.email.toLowerCase(),
          personal.specializations?.join(',').toLowerCase()
        ];
        
        const term = searchTerm.toLowerCase();
        return searchableFields.some(field => field && field.includes(term));
      });
      setFilteredPersonals(filtered);
    }
  }, [searchTerm, personals]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Personais da Academia</h1>
        <Link
          to="/academia/register-personal"
          className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <FaPlus className="mr-2" />
          Novo Personal
        </Link>
      </div>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Buscar por nome, especialização ou email..."
          className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Erro</p>
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredPersonals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPersonals.map((personal) => (
            <PersonalCard 
              key={personal.id} 
              id={personal.id}
              name={personal.name}
              specializations={personal.specializations || []}
              yearsOfExperience={personal.yearsOfExperience || "N/A"}
              workLocation={personal.workLocation || "N/A"}
              pricePerHour={personal.pricePerHour || "N/A"}
              cref={personal.cref || "Não informado"}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-xl text-gray-600">
            Nenhum personal encontrado. Adicione um novo personal ou ajuste sua busca.
          </p>
        </div>
      )}
    </div>
  );
};

export default AcademiaPersonalList; 