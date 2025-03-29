import { FC, useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiEdit2 } from 'react-icons/fi';
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaClock,
  FaGraduationCap,
  FaLanguage,
  FaInstagram,
  FaLinkedin,
  FaDollarSign,
  FaEnvelope,
  FaBirthdayCake,
  FaVenusMars
} from 'react-icons/fa';
import Button from '../../components/GeralPurposeComponents/Button/Button';
import Swal from 'sweetalert2';
import { useUser } from '../../contexts/UserContext';
import { connectionUrl } from '../../config/api';
import PersonalProfileSetup from '../AcademiaPages/PersonalProfileSetup';

interface PersonalData {
  user: {
    name: string;
    email: string;
  };
  birthDate: string;
  gender: string;
  specializations: string[];
  yearsOfExperience: string;
  workSchedule: string;
  certifications: string[];
  biography: string;
  workLocation: string;
  pricePerHour: string;
  languages: string[];
  instagram: string | null;
  linkedin: string | null;
}

const PersonalProfile: FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { userData } = useUser();
  const [personalData, setPersonalData] = useState<PersonalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const fetchPersonalData = useCallback(async () => {
    try {
      const profileId = id || userData?.id;
      const token = localStorage.getItem('token');
        
      if (!profileId) {
        throw new Error('ID não encontrado');
      }

      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`${connectionUrl}/personal/${profileId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
        
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sessão expirada');
        }
        if (response.status === 404) {
          throw new Error('Perfil não encontrado');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar dados do personal');
      }

      const data = await response.json();
        
      if (!data || !data.user) {
        throw new Error('Dados do perfil inválidos');
      }

      setPersonalData(data);
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar perfil';
      setError(errorMessage);
        
      if (errorMessage === 'Sessão expirada') {
        localStorage.removeItem('token');
        navigate('/auth/login');
      } else {
        Swal.fire('Erro!', errorMessage, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, userData, navigate]);

  useEffect(() => {
    fetchPersonalData();
  }, [fetchPersonalData]);

  const handleEditProfile = () => {
    setShowProfileSetup(true);
  };

  const handleProfileSetupSuccess = () => {
    setShowProfileSetup(false);
    fetchPersonalData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error || !personalData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar perfil</h2>
          <p className="text-gray-600 mb-4">{error || 'Perfil não encontrado'}</p>
          <Button onClick={() => navigate(-1)}>Voltar</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
        {/* Cabeçalho do Perfil */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 text-white shadow-lg mb-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-3xl">👤</span>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold">{personalData.user.name}</h1>
              <p className="text-gray-300 mt-1">Personal Trainer</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Informações Básicas */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Informações Básicas</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-600">
                <FaEnvelope className="text-red-600" />
                <span>{personalData.user.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <FaBirthdayCake className="text-red-600" />
                <span>{personalData.birthDate}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <FaVenusMars className="text-red-600" />
                <span>{personalData.gender}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <FaBriefcase className="text-red-600" />
                <span>{personalData.yearsOfExperience} anos de experiência</span>
              </div>
            </div>
          </div>

          {/* Especialização e Certificações */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Qualificações</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-3 text-gray-600 mb-2">
                  <FaGraduationCap className="text-red-600" />
                  <span className="font-semibold">Especializações:</span>
                </div>
                <ul className="list-disc list-inside pl-6 text-gray-600">
                  {personalData.specializations.map((spec, index) => (
                    <li key={index}>{spec}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex items-center space-x-3 text-gray-600 mb-2">
                  <FaGraduationCap className="text-red-600" />
                  <span className="font-semibold">Certificações:</span>
                </div>
                <ul className="list-disc list-inside pl-6 text-gray-600">
                  {personalData.certifications.map((cert, index) => (
                    <li key={index}>{cert}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Informações de Trabalho */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Informações de Trabalho</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-600">
                <FaMapMarkerAlt className="text-red-600" />
                <span>{personalData.workLocation}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <FaClock className="text-red-600" />
                <span>{personalData.workSchedule}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <FaDollarSign className="text-red-600" />
                <span>R$ {personalData.pricePerHour}/hora</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <FaLanguage className="text-red-600" />
                <span>{personalData.languages.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Biografia e Redes Sociais */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Sobre Mim</h2>
            <p className="text-gray-600 mb-6">{personalData.biography}</p>
            <div className="flex space-x-4">
              {personalData.instagram && (
                <a
                  href={`https://instagram.com/${personalData.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-red-600 transition-colors"
                >
                  <FaInstagram size={24} />
                </a>
              )}
              {personalData.linkedin && (
                <a
                  href={personalData.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-red-600 transition-colors"
                >
                  <FaLinkedin size={24} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Botão de Edição */}
        <div className="fixed bottom-8 right-8">
          <button
            className="absolute bottom-0 right-0 bg-red-600 p-2 rounded-full hover:bg-red-700 transition-colors"
            onClick={handleEditProfile}
          >
            <FiEdit2 size={16} />
          </button>
        </div>
      </div>

      {showProfileSetup && (
        <PersonalProfileSetup
          isOpen={showProfileSetup}
          onClose={() => setShowProfileSetup(false)}
          onSuccess={handleProfileSetupSuccess}
          userId={userData?.id?.toString() || ''}
        />
      )}
    </>
  );
};

export default PersonalProfile; 