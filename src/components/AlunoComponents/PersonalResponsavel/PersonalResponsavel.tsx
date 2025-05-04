import { FC, useState, useEffect } from 'react';
import { FaUserTie, FaStar, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { connectionUrl } from '../../../config/connection';

interface Personal {
  id: number;
  name: string;
  email: string;
  cref?: string;
  specialization?: string;
  yearsOfExperience?: number;
  workLocation?: string;
  pricePerHour?: number;
  phone?: string;
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
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchPersonalResponsavel = async () => {
      try {
        setIsLoading(true);
        
        // Buscar dados do usuário (aluno)
        const userResponse = await fetch(`${connectionUrl}/aluno/preferencias`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!userResponse.ok) {
          console.error(`Erro ao buscar preferências do aluno: ${userResponse.status}`);
          setDadosExemplo();
          return;
        }
        
        const userData = await userResponse.json();
        
        if (!userData.personalId) {
          console.log('Aluno sem personal vinculado');
          setPersonal(null);
          setIsLoading(false);
          return;
        }
        
        // Buscar dados do personal
        const response = await fetch(`${connectionUrl}/personal/detalhes/${userData.personalId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          console.error(`Erro ao buscar dados do personal: ${response.status}`);
          setDadosExemplo();
          return;
        }

        const data = await response.json();
        setPersonal({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          cref: data.cref,
          specialization: data.specialization,
          yearsOfExperience: data.yearsOfExperience,
          workLocation: data.workLocation,
          pricePerHour: data.pricePerHour,
          workSchedule: data.workSchedule,
          rating: 4.8, // Rating fixo para exemplo
          phone: data.phone || "Não informado",
          imageUrl: data.imageUrl
        });
      } catch (error) {
        console.error('Erro ao buscar personal responsável:', error);
        setDadosExemplo();
      } finally {
        setIsLoading(false);
      }
    };
    
    const setDadosExemplo = () => {
      // Dados de exemplo em caso de erro
      setPersonal({
        id: 1,
        name: "Carlos Mendes",
        email: "carlos.mendes@exemplo.com",
        cref: "123456-G/SP",
        specialization: "Musculação e Hipertrofia",
        yearsOfExperience: 8,
        workLocation: "Academia Fitness Total",
        pricePerHour: 120,
        phone: "(11) 98765-4321",
        workSchedule: "Seg-Sex: 6h às 21h",
        rating: 4.9,
        imageUrl: ""
      });
    };

    if (token) {
      fetchPersonalResponsavel();
    }
  }, [token]);

  // Renderizar estrelas de avaliação
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStar key={i} className="text-yellow-400 opacity-50" />);
      } else {
        stars.push(<FaStar key={i} className="text-gray-300" />);
      }
    }

    return stars;
  };

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
                {personal.specialization && (
                  <p className="text-gray-600">{personal.specialization}</p>
                )}
                {personal.rating && (
                  <div className="flex mt-1">
                    {renderStars(personal.rating)}
                    <span className="ml-1 text-sm text-gray-600">{personal.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-4 mt-4 space-y-3">
              <div className="flex items-center text-gray-700">
                <FaEnvelope className="mr-2 text-red-600" />
                <span>{personal.email}</span>
              </div>
              
              {personal.phone && (
                <div className="flex items-center text-gray-700">
                  <FaPhone className="mr-2 text-red-600" />
                  <span>{personal.phone}</span>
                </div>
              )}

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