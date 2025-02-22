import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const ProgressSummary: React.FC = () => {
  const [progressData, setProgressData] = useState<{ totalDays: number; completedDays: number }>({ totalDays: 0, completedDays: 0 });
  const [daysDetails, setDaysDetails] = useState<{ [key: string]: number[] }>({});

  useEffect(() => {
    const storedDays = localStorage.getItem('daysState');
    if (storedDays) {
      const daysState = JSON.parse(storedDays);
      const currentMonthKey = `${new Date().getFullYear()}-${new Date().getMonth()}`;
      const currentMonthDays = daysState[currentMonthKey] || [];
      const completedDays = currentMonthDays.filter((day: number) => day === 1).length; // Contar dias "Foi"
      const totalDays = currentMonthDays.length; // Total de dias no mês

      setProgressData({ totalDays, completedDays });
      setDaysDetails(daysState); // Armazenar detalhes dos dias
    }
  }, []);

  const completionRate = progressData.totalDays > 0 ? (progressData.completedDays / progressData.totalDays) * 100 : 0;

  const showDetails = () => {
    const currentMonthKey = `${new Date().getFullYear()}-${new Date().getMonth()}`;
    const currentMonthDays = daysDetails[currentMonthKey] || [];
    const details = currentMonthDays
      .map((day, index) => {
        if (day === 1) {
          return `Dia ${index + 1}: ✅ Foi`;
        }
        return null; // Ignora os dias que não foram
      })
      .filter(Boolean); // Remove os valores nulos

    Swal.fire({
      title: 'Detalhes dos Dias',
      html: details.length > 0 ? `<pre>${details.join('\n')}</pre>` : 'Nenhum dia registrado como "Foi".', // Usar <pre> para manter a formatação
      icon: 'info',
      confirmButtonText: 'Fechar',
      customClass: {
        popup: 'bg-white rounded-lg shadow-lg p-4', // Estilo do popup
        title: 'text-lg font-semibold text-gray-800', // Estilo do título
        htmlContainer: 'text-gray-700', // Estilo do texto
      },
      backdrop: true,
    });
  };

  return (
    <div className="fixed bottom-8 right-8">
      <div className="relative w-20 h-20 cursor-pointer" onClick={showDetails}>
        <svg className="w-20 h-20 transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="#E5E7EB"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="#4F46E5"
            strokeWidth="8"
            fill="none"
            strokeDasharray="226.19"
            strokeDashoffset={226.19 * (1 - completionRate / 100)}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-indigo-600">{completionRate.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressSummary; 