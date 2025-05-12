import { FC, useState, useEffect } from 'react';
import { FaBriefcase, FaMapMarkerAlt, FaDollarSign, FaGraduationCap, FaUserTie, FaTrash } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import PersonalProfileSetup from '../../pages/AcademiaPages/PersonalProfileSetup';
import PersonalDetailModal from './PersonalDetailModal';
import { connectionUrl } from '../../config/connection';
import Swal from 'sweetalert2';

interface PersonalCardProps {
  id: number;
  name: string;
  specializations: string[];
  yearsOfExperience: string;
  workLocation: string;
  pricePerHour: string;
  cref?: string;
  imageUrl?: string;
  education?: string[];
  certifications?: string[];
  biography?: string;
  availableTimes?: string[];
  contactInfo?: {
    email?: string;
    phone?: string;
  };
  onDelete?: () => void;
}

const PersonalCard: FC<PersonalCardProps> = ({
  id,
  name,
  specializations,
  yearsOfExperience,
  workLocation,
  pricePerHour,
  cref,
  imageUrl,
  education = [],
  certifications = [],
  biography = '',
  availableTimes = [],
  contactInfo = {},
  onDelete
}) => {
  const { userData } = useUser();
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [personalAvatar, setPersonalAvatar] = useState<string | undefined>(imageUrl);
  const isAcademia = userData?.role === 'ACADEMIA';

  // Efeito para buscar dados do personal diretamente da API se necessário
  useEffect(() => {
    const fetchPersonalData = async () => {
      if (!imageUrl) {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;

          const response = await fetch(`${connectionUrl}/personal/detalhes/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.personalAvatar) {
              console.log(`[PersonalCard] Imagem obtida da API para ${name} (ID: ${id}):`, data.personalAvatar);
              setPersonalAvatar(data.personalAvatar);
            }
          }
        } catch (error) {
          console.error(`[PersonalCard] Erro ao buscar dados do personal ${id}:`, error);
        }
      }
    };

    fetchPersonalData();
  }, [id, imageUrl, name]);

  // Efeito para logar informações da imagem para depuração
  useEffect(() => {
    console.log(`[PersonalCard] ID: ${id}, Nome: ${name}, ImageUrl:`, personalAvatar || imageUrl);
  }, [id, name, imageUrl, personalAvatar]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Evita navegação quando clicamos no botão de edição
    if (e.target instanceof HTMLElement && 
        (e.target.closest('button') || e.target.tagName === 'svg' || e.target.tagName === 'path')) {
      return;
    }
    // Em vez de navegar, mostramos o modal de detalhes
    setShowDetailModal(true);
  };

  const handleProfileSetupSuccess = () => {
    setShowProfileSetup(false);
  };

  const handleImageError = () => {
    console.error(`[PersonalCard] Erro ao carregar imagem para ${name} (ID: ${id}), URL:`, personalAvatar || imageUrl);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log(`[PersonalCard] Imagem carregada com sucesso para ${name} (ID: ${id})`);
  };

  const handleDeletePersonal = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const result = await Swal.fire({
      title: 'Confirmar exclusão',
      text: `Deseja realmente desvincular ${name} da academia? Isso também removerá a associação com todos os alunos vinculados.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, desvincular',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token não encontrado');

        const response = await fetch(`${connectionUrl}/desvincular-personal-academia/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao desvincular personal');
        }

        Swal.fire('Sucesso', `${name} foi desvinculado da academia com sucesso!`, 'success');
        
        // Chamar a função de callback para atualizar a lista
        if (onDelete) onDelete();
      } catch (error) {
        console.error('Erro ao desvincular personal:', error);
        Swal.fire('Erro', `Falha ao desvincular personal: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'error');
      }
    }
  };

  // Verificar se a URL da imagem é válida
  const effectiveImageUrl = personalAvatar || imageUrl;

  return (
    <>
      <div 
        className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition hover:shadow-xl hover:scale-[1.02] mb-4"
        onClick={handleCardClick}
      >
        <div className="relative">
          {effectiveImageUrl && !imageError ? (
            <img
              src={effectiveImageUrl}
              alt={`Foto de ${name}`}
              className="w-full h-56 object-cover"
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          ) : (
            <div className="w-full h-56 bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center">
              <FaUserTie className="text-blue-300" size={80} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-70"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white drop-shadow-md">{name}</h3>
              {isAcademia && (
                <button
                  className="bg-red-600 p-2 rounded-full hover:bg-red-700 transition-colors z-10 shadow-md"
                  onClick={handleDeletePersonal}
                  title="Desvincular Personal"
                >
                  <FaTrash size={16} color="white" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap mt-1">
              {specializations.slice(0, 2).map((spec, index) => (
                <span 
                  key={index} 
                  className="text-xs bg-blue-600 text-white rounded-full px-2 py-1 mr-1 mb-1"
                >
                  {spec}
                </span>
              ))}
              {specializations.length > 2 && (
                <span className="text-xs text-white">+{specializations.length - 2}</span>
              )}
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center">
              <FaUserTie className="text-blue-500 mr-2" />
              <span className="text-sm text-gray-700">identificação: {id} </span>
            </div>
            <div className="flex items-center">
              <FaGraduationCap className="text-blue-500 mr-2" />
              <span className="text-sm text-gray-700">CREF: {cref || 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <FaBriefcase className="text-blue-500 mr-2" />
              <span className="text-sm text-gray-700">{yearsOfExperience}</span>
            </div>
            <div className="flex items-center">
              <FaMapMarkerAlt className="text-blue-500 mr-2" />
              <span className="text-sm text-gray-700 truncate">{workLocation}</span>
            </div>
            <div className="flex items-center">
              <FaDollarSign className="text-blue-500 mr-2" />
              <span className="text-sm text-gray-700">{pricePerHour}</span>
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
        />
      )}

      {/* Modal de detalhes do personal */}
      <PersonalDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        personal={{
          id,
          name,
          specializations,
          yearsOfExperience,
          workLocation,
          pricePerHour,
          cref: cref || 'N/A',
          imageUrl: imageError ? undefined : effectiveImageUrl,
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