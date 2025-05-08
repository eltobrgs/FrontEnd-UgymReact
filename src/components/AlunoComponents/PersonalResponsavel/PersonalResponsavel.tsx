import { FC, useState, useEffect } from 'react';
import { FaUserTie, FaEnvelope, FaIdCard, FaMapMarkerAlt, FaClock, FaExclamationCircle } from 'react-icons/fa';
import { connectionUrl } from '../../../config/connection';

interface Personal {
  id: number;
  name: string;
  email: string;
  cref?: string;
  specializations?: string[];
  yearsOfExperience?: string;
  workLocation?: string;
  pricePerHour?: string;
  workSchedule?: string;
  rating?: number;
  imageUrl?: string;
}

interface PersonalResponsavelProps {
  containerClassName?: string;
}

const PersonalResponsavel: FC<PersonalResponsavelProps> = ({ containerClassName = "" }) => {
  const [personal, setPersonal] = useState<Personal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchPersonalResponsavel = async () => {
      if (!token) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Usar o novo endpoint para buscar o personal responsável
        const response = await fetch(`${connectionUrl}/aluno/personal-responsavel`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          // Se o erro for 404, significa que o aluno não tem personal
          if (response.status === 404) {
            setPersonal(null);
            setIsLoading(false);
            return;
          }
          
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao buscar o personal responsável');
        }

        const data = await response.json();
        
        setPersonal({
          id: data.id,
          name: data.name,
          email: data.email,
          cref: data.cref,
          specializations: data.specializations,
          yearsOfExperience: data.yearsOfExperience,
          workLocation: data.workLocation,
          pricePerHour: data.pricePerHour,
          workSchedule: data.workSchedule,
          rating: 4.8, // Rating fixo para exemplo
          imageUrl: data.imageUrl
        });
      } catch (error) {
        console.error('Erro ao buscar personal responsável:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        setPersonal(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonalResponsavel();
  }, [token]);


  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${containerClassName}`}>
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Meu Personal</h2>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <FaExclamationCircle className="text-red-500 text-3xl mx-auto mb-2" />
            <p className="text-red-500">{error}</p>
          </div>
        ) : !personal ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaUserTie className="text-gray-400 text-xl" />
            </div>
            <p className="text-gray-500">Você ainda não tem um personal responsável</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                {personal.imageUrl ? (
                  <img
                    src={personal.imageUrl}
                    alt={personal.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <FaUserTie className="text-red-600 text-2xl" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{personal.name}</h3>
                {personal.specializations && personal.specializations.length > 0 && (
                  <p className="text-gray-600">{personal.specializations.join(', ')}</p>
                )}
              </div>
            </div>

            <div className="border-t pt-4 mt-4 space-y-3">
              <div className="flex items-center text-gray-700">
                <FaEnvelope className="mr-2 text-red-600" />
                <span>{personal.email}</span>
              </div>

              {personal.cref && (
                <div className="flex items-center text-gray-700">
                  <FaIdCard className="mr-2 text-red-600" />
                  <span>CREF: {personal.cref}</span>
                </div>
              )}

              {personal.workLocation && (
                <div className="flex items-center text-gray-700">
                  <FaMapMarkerAlt className="mr-2 text-red-600" />
                  <span>{personal.workLocation}</span>
                </div>
              )}

              {personal.workSchedule && (
                <div className="flex items-center text-gray-700">
                  <FaClock className="mr-2 text-red-600" />
                  <span>{personal.workSchedule}</span>
                </div>
              )}

              {personal.yearsOfExperience && (
                <div className="flex items-center text-gray-700">
                  <FaUserTie className="mr-2 text-red-600" />
                  <span>{personal.yearsOfExperience} anos de experiência</span>
                </div>
              )}

              {personal.pricePerHour && (
                <div className="flex items-center text-gray-700">
                  <span className="font-medium">R$ {personal.pricePerHour}/hora</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalResponsavel; 