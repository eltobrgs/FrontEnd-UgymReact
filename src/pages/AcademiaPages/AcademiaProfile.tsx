import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { FiEdit2 } from 'react-icons/fi';
import {
  FaMapMarkerAlt,
  FaClock,
  FaPhone,
  FaGlobe,
  FaInstagram,
  FaFacebook,
  FaBuilding,
  FaIdCard,
  FaDollarSign,
  FaCheckCircle
} from 'react-icons/fa';
import AcademiaProfileEdit from './AcademiaProfileEdit';

const AcademiaProfile: FC = () => {
  const { userData, fetchUserData } = useUser();
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  const handleEditProfile = () => {
    setShowProfileEdit(true);
  };

  const handleProfileEditSuccess = () => {
    setShowProfileEdit(false);
    fetchUserData();
  };

  if (!userData || !userData.academia) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-4">Perfil não encontrado</h2>
          <p className="text-gray-300 mb-6">
            Não foi possível encontrar os dados do seu perfil. Por favor, complete seu cadastro.
          </p>
          <Link
            to="/edit-academia-profile"
            className="w-full block text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
          >
            Completar Perfil
          </Link>
        </div>
      </div>
    );
  }

  const { academia } = userData;

  return (
    <>
      <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
        {/* Cabeçalho do Perfil */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 text-white shadow-lg mb-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              {academia.academiaAvatar ? (
                <img 
                  src={academia.academiaAvatar} 
                  alt="Perfil da Academia" 
                  className="w-24 h-24 rounded-full object-cover border-2 border-red-500 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center">
                  <FaBuilding size={40} />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{userData.name}</h1>
              <p className="text-gray-300 mt-1">Academia</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Informações Básicas */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Informações Básicas</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-600">
                <FaIdCard className="text-red-600" />
                <span>CNPJ: {academia.cnpj}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <FaMapMarkerAlt className="text-red-600" />
                <span>{academia.endereco}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <FaPhone className="text-red-600" />
                <span>{academia.telefone}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <FaClock className="text-red-600" />
                <span>{academia.horarioFuncionamento}</span>
              </div>
            </div>
          </div>

          {/* Planos */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Planos Oferecidos</h2>
            <div className="space-y-4">
              {academia.planos && academia.planos.length > 0 ? (
                <div className="space-y-2">
                  {academia.planos.map((plano, index) => (
                    <div key={index} className="flex items-center space-x-3 text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <FaDollarSign className="text-red-600" />
                      <span>{plano}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhum plano cadastrado</p>
              )}
            </div>
          </div>

          {/* Comodidades */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Comodidades</h2>
            <div className="space-y-4">
              {academia.comodidades && academia.comodidades.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {academia.comodidades.map((comodidade, index) => (
                    <span
                      key={index}
                      className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-full text-gray-600"
                    >
                      <FaCheckCircle className="text-red-600" />
                      <span>{comodidade}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma comodidade cadastrada</p>
              )}
            </div>
          </div>

          {/* Descrição e Redes Sociais */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Sobre a Academia</h2>
            <p className="text-gray-600 mb-6">{academia.descricao}</p>
            <div className="flex flex-wrap gap-4">
              {academia.website && (
                <a
                  href={academia.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <FaGlobe size={20} />
                  <span>Website</span>
                </a>
              )}
              {academia.instagram && (
                <a
                  href={`https://instagram.com/${academia.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <FaInstagram size={20} />
                  <span>Instagram</span>
                </a>
              )}
              {academia.facebook && (
                <a
                  href={`https://facebook.com/${academia.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <FaFacebook size={20} />
                  <span>Facebook</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Botão de Edição */}
        <div className="fixed bottom-8 right-8">
          <button
            onClick={handleEditProfile}
            className="bg-red-600 p-4 rounded-full hover:bg-red-700 transition-colors text-white shadow-lg"
          >
            <FiEdit2 size={20} />
          </button>
        </div>
      </div>

      {showProfileEdit && (
        <AcademiaProfileEdit
          isOpen={showProfileEdit}
          onClose={() => setShowProfileEdit(false)}
          onSuccess={handleProfileEditSuccess}
        />
      )}
    </>
  );
};

export default AcademiaProfile; 