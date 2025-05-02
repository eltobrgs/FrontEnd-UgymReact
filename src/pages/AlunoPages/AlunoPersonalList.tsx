import { FC, useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { connectionUrl } from '../../config/connection';
import PersonalCard from '../../components/PersonalComponents/PersonalCard';
import { useUser } from '../../contexts/UserContext';

interface Personal {
  id: number;
  user: {
    name: string;
  };
  specializations: string[];
  yearsOfExperience: string;
  workLocation: string;
  pricePerHour: string;
}

interface PreferenciasAluno {
  academiaId?: number;
}

interface PreferenciasAlunoExtended extends PreferenciasAluno {
  academiaId?: number;
}

const AlunoPersonalList: FC = () => {
  const { userData } = useUser();
  const [personals, setPersonals] = useState<Personal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPersonals, setFilteredPersonals] = useState<Personal[]>([]);

  useEffect(() => {
    const fetchPersonals = async () => {
      try {
        // Obter o token para usar endpoint privado
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token não encontrado');
        }
        
        // Verificar se o aluno tem uma academia associada
        if (!(userData?.preferenciasAluno as PreferenciasAlunoExtended)?.academiaId) {
          console.log('Aluno sem academia associada');
          setPersonals([]);
          setFilteredPersonals([]);
          setIsLoading(false);
          return;
        }
        
        // Usar o endpoint com o parâmetro academiaId para filtrar por academia
        const academiaId = userData?.preferenciasAluno && (userData.preferenciasAluno as PreferenciasAlunoExtended).academiaId;
        const response = await fetch(`${connectionUrl}/personais/listar?academiaId=${academiaId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Erro ao buscar lista de personais');
        }

        const data = await response.json();
        console.log('Personais obtidos:', data);
        
        // Transformar os dados para garantir que eles correspondam à interface
        const formattedData = data.map((item: { id: number; name: string; specializations: string[]; yearsOfExperience: string; workLocation: string; pricePerHour: string; }) => ({
          id: item.id,
          user: {
            name: item.name || 'Nome não disponível'
          },
          specializations: Array.isArray(item.specializations) ? item.specializations : [],
          yearsOfExperience: item.yearsOfExperience || '0',
          workLocation: item.workLocation || 'Não informado',
          pricePerHour: item.pricePerHour || '0'
        }));
        
        setPersonals(formattedData);
        setFilteredPersonals(formattedData);
      } catch (error) {
        console.error('Erro ao buscar personais:', error);
        Swal.fire('Erro!', 'Não foi possível carregar a lista de personais', 'error');
        // Em caso de erro, definir array vazio para evitar erros de renderização
        setPersonals([]);
        setFilteredPersonals([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Só buscar personais quando os dados do usuário estiverem disponíveis
    if (userData) {
      fetchPersonals();
    }
  }, [userData]);

  useEffect(() => {
    const filtered = personals.filter(personal => 
      personal.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      personal.specializations.some(spec => 
        spec.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      personal.workLocation.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPersonals(filtered);
  }, [searchTerm, personals]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Encontre seu Personal Trainer
          </h1>
          <p className="text-xl text-gray-600">
            Profissionais qualificados prontos para te ajudar a alcançar seus objetivos
          </p>
        </div>

        {/* Barra de Pesquisa */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nome, especialização ou localização..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Mensagem quando o aluno não está associado a uma academia */}
        {!(userData?.preferenciasAluno as PreferenciasAlunoExtended)?.academiaId && !isLoading && (
          <div className="text-center text-gray-600 bg-yellow-50 p-8 rounded-lg">
            <p className="text-xl font-medium mb-2">Você ainda não está associado a uma academia</p>
            <p>Para ver os personais disponíveis, você precisa primeiro se associar a uma academia.</p>
          </div>
        )}

        {/* Lista de Cards */}
        {filteredPersonals.length === 0 && (userData?.preferenciasAluno as PreferenciasAlunoExtended)?.academiaId ? (
          <div className="text-center text-gray-600">
            <p className="text-xl">Nenhum personal trainer encontrado na sua academia</p>
          </div>
        ) : (
          (userData?.preferenciasAluno as PreferenciasAlunoExtended)?.academiaId && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPersonals.map(personal => (
                <PersonalCard
                  key={personal.id}
                  id={personal.id}
                  name={personal.user.name}
                  specializations={personal.specializations}
                  yearsOfExperience={personal.yearsOfExperience}
                  workLocation={personal.workLocation}
                  pricePerHour={personal.pricePerHour}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default AlunoPersonalList; 