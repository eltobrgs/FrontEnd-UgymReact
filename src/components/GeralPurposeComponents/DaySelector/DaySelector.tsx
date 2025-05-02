import { FC } from 'react';
import { motion } from 'framer-motion';

interface DaySelectorProps {
  selectedDay: number;
  onDaySelect: (day: number) => void;
}

const DaySelector: FC<DaySelectorProps> = ({ selectedDay, onDaySelect }) => {
  // Array de dias da semana para exibição, na ordem de domingo a sábado
  const weekdays = [
    { id: 0, name: 'Domingo', shortName: 'Dom' },
    { id: 1, name: 'Segunda', shortName: 'Seg' },
    { id: 2, name: 'Terça', shortName: 'Ter' },
    { id: 3, name: 'Quarta', shortName: 'Qua' },
    { id: 4, name: 'Quinta', shortName: 'Qui' },
    { id: 5, name: 'Sexta', shortName: 'Sex' },
    { id: 6, name: 'Sábado', shortName: 'Sáb' }
  ];

  return (
    <motion.div 
      className="bg-white rounded-xl p-6 shadow-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Selecione o dia do treino:</h3>
      <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
        {weekdays.map((day) => (
          <motion.button
            key={day.id}
            onClick={() => onDaySelect(day.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`py-3 px-2 rounded-xl transition-all shadow-sm 
              ${selectedDay === day.id
                ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
          >
            <span className="block text-lg font-medium">{day.shortName}</span>
            <span className="block text-xs mt-1">{day.name}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default DaySelector; 