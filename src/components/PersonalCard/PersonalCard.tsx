import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBriefcase, FaMapMarkerAlt, FaDollarSign } from 'react-icons/fa';

interface PersonalCardProps {
  id: number;
  name: string;
  specializations: string[];
  yearsOfExperience: string;
  workLocation: string;
  pricePerHour: string;
  imageUrl?: string;
}

const PersonalCard: FC<PersonalCardProps> = ({
  id,
  name,
  specializations,
  yearsOfExperience,
  workLocation,
  pricePerHour,
  imageUrl = 'https://via.placeholder.com/150'
}) => {
  const navigate = useNavigate();

  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-transform duration-300 hover:scale-105"
      onClick={() => navigate(`/personal/${id}`)}
    >
      <div className="relative">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <h3 className="text-xl font-bold text-white">{name}</h3>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="flex items-center text-gray-600">
          <FaBriefcase className="mr-2" />
          <span>{yearsOfExperience} anos de experiência</span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <FaMapMarkerAlt className="mr-2" />
          <span>{workLocation}</span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <FaDollarSign className="mr-2" />
          <span>R$ {pricePerHour},00 /hora</span>
        </div>

        <div className="mt-3">
          <div className="flex flex-wrap gap-2">
            {specializations.slice(0, 3).map((spec, index) => (
              <span
                key={index}
                className="bg-indigo-100 text-indigo-800 text-sm px-2 py-1 rounded-full"
              >
                {spec}
              </span>
            ))}
            {specializations.length > 3 && (
              <span className="text-gray-500 text-sm">
                +{specializations.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalCard; 