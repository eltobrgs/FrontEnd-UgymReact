import { FC } from 'react';

interface StudentCardProps {
  id: number;
  name: string;
  age: number;
  weight: string;
  height: string;
  goal: string;
  trainingTime: string;
  imageUrl?: string;
}

const StudentCard: FC<StudentCardProps> = ({
  id,
  name,
  age,
  weight,
  height,
  goal,
  trainingTime,
  imageUrl
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="flex items-center p-4">
        <div className="flex-shrink-0">
          <img
            src={imageUrl || 'https://via.placeholder.com/50'}
            alt={name}
            className="w-12 h-12 rounded-full object-cover"
          />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
              ID: {id}
            </span>
            <p className="text-sm text-gray-600">{age} anos</p>
          </div>
        </div>
      </div>
      
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-600">Peso:</p>
            <p className="font-medium">{weight}</p>
          </div>
          <div>
            <p className="text-gray-600">Altura:</p>
            <p className="font-medium">{height}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-600">Objetivo:</p>
            <p className="font-medium">{goal}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-600">Tempo de Treino:</p>
            <p className="font-medium">{trainingTime}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCard; 