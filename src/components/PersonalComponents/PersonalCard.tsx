import { FC, useState } from 'react';
import { FaBriefcase, FaMapMarkerAlt, FaDollarSign, FaGraduationCap } from 'react-icons/fa';
import { FiEdit2 } from 'react-icons/fi';
import { useUser } from '../../contexts/UserContext';
import PersonalProfileSetup from '../../pages/AcademiaPages/PersonalProfileSetup';
import PersonalDetailModal from './PersonalDetailModal';

interface PersonalCardProps {
  id: number;
  name: string;
  specializations: string[];
  yearsOfExperience: string;
  workLocation: string;
  pricePerHour: string;
  cref?: string;
  specialization?: string;
  imageUrl?: string;
  education?: string[];
  certifications?: string[];
  biography?: string;
  availableTimes?: string[];
  contactInfo?: {
    email?: string;
    phone?: string;
  };
}

const PersonalCard: FC<PersonalCardProps> = ({
  id,
  name,
  specializations,
  yearsOfExperience,
  workLocation,
  pricePerHour,
  cref = "Não informado",
  specialization = "",
  imageUrl = 'https://via.placeholder.com/150',
  education = [],
  certifications = [],
  biography = "",
  availableTimes = [],
  contactInfo = {}
}) => {
  const { userData } = useUser();
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Evita navegação quando clicamos no botão de edição
    if (e.target instanceof HTMLElement && 
        (e.target.closest('button') || e.target.tagName === 'svg' || e.target.tagName === 'path')) {
      return;
    }
    // Em vez de navegar, mostramos o modal de detalhes
    setShowDetailModal(true);
  };

  const handleEditProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowProfileSetup(true);
  };

  const handleProfileSetupSuccess = () => {
    setShowProfileSetup(false);
    // Aqui você pode adicionar uma lógica para atualizar os dados do card
  };

  // Determinar a(s) especialização(ões) a serem exibidas
  const displaySpecializations = specializations.length > 0 
    ? specializations 
    : specialization ? [specialization] : ["Não informado"];

  return (
    <>
      <div 
        className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition hover:shadow-xl"
        onClick={handleCardClick}
      >
        <div className="relative">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-40 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{name}</h3>
              {userData?.role === 'ACADEMIA' && (
                <button
                  className="bg-red-600 p-2 rounded-full hover:bg-red-700 transition-colors z-10"
                  onClick={handleEditProfile}
                >
                  <FiEdit2 size={16} color="white" />
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4 space-y-2">
          <div className="flex items-center text-gray-700 mb-1">
            <FaGraduationCap className="mr-2 text-red-600" />
            <span className="font-medium">CREF: {cref}</span>
          </div>
          
          <div className="flex items-center text-gray-700">
            <FaBriefcase className="mr-2 text-red-600" />
            <span>{yearsOfExperience !== "N/A" ? `${yearsOfExperience} anos de experiência` : "Experiência não informada"}</span>
          </div>
          
          <div className="flex items-center text-gray-700">
            <FaMapMarkerAlt className="mr-2 text-red-600" />
            <span>{workLocation !== "N/A" ? workLocation : "Local não informado"}</span>
          </div>
          
          <div className="flex items-center text-gray-700">
            <FaDollarSign className="mr-2 text-red-600" />
            <span>{pricePerHour !== "N/A" ? `R$ ${pricePerHour}/hora` : "Valor não informado"}</span>
          </div>

          <div className="mt-3">
            <p className="text-sm text-gray-600 mb-1">Especialidades:</p>
            <div className="flex flex-wrap gap-2">
              {displaySpecializations.slice(0, 3).map((spec, index) => (
                <span
                  key={index}
                  className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full"
                >
                  {spec}
                </span>
              ))}
              {displaySpecializations.length > 3 && (
                <span className="text-gray-500 text-xs">
                  +{displaySpecializations.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {showProfileSetup && (
        <PersonalProfileSetup
          isOpen={showProfileSetup}
          onClose={() => setShowProfileSetup(false)}
          onSuccess={handleProfileSetupSuccess}
          userId={id.toString()}
          academiaId={userData?.academia?.id || null}
        />
      )}

      {/* Modal de detalhes do personal */}
      <PersonalDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        personal={{
          id,
          name,
          cref,
          yearsOfExperience,
          workLocation,
          pricePerHour,
          specializations: displaySpecializations,
          imageUrl,
          education,
          certifications,
          biography,
          availableTimes,
          contactInfo
        }}
      />
    </>
  );
};

export default PersonalCard; 