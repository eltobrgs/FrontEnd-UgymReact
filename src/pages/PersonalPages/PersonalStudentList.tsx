import { FC, useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import StudentCard from '../../components/GeralPurposeComponents/StudentCard/StudentCard';
import Swal from 'sweetalert2';
import { connectionUrl } from '../../config/connection';
import { motion } from 'framer-motion';

interface Student {
  id: number;
  name: string;
  age: number;
  weight: string;
  height: string;
  goal: string;
  trainingTime: string;
  imageUrl?: string;
  gender?: string;
  healthCondition?: string;
  experience?: string;
  activityLevel?: string;
  physicalLimitations?: string;
}

const PersonalStudentList: FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token não encontrado');
        }

        // Este endpoint já foi modificado no backend para filtrar alunos da mesma academia que o personal
        const response = await fetch(`${connectionUrl}/alunos/listar`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Falha ao buscar alunos');
        }

        const data = await response.json();
        
        // Garantir que todos os campos necessários existam
        const processedData = data.map((student: Student) => ({
          id: student.id || 0,
          name: student.name || 'Nome não informado',
          age: student.age || 'N/A',
          weight: student.weight || 'Dados em relatórios',
          height: student.height || 'Dados em relatórios',
          goal: student.goal || 'Não informado',
          trainingTime: student.trainingTime || 'Iniciante',
          imageUrl: student.imageUrl || undefined,
          gender: student.gender || '',
          healthCondition: student.healthCondition || '',
          experience: student.experience || '',
          activityLevel: student.activityLevel || '',
          physicalLimitations: student.physicalLimitations || ''
        }));
        
        setStudents(processedData);
        setFilteredStudents(processedData);
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        Swal.fire({
          title: 'Erro!',
          text: 'Não foi possível carregar a lista de alunos',
          icon: 'error',
          confirmButtonColor: '#dc2626' // Cor vermelha para combinar com o tema
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    const filtered = students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.goal.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-red-600"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            Explorar Alunos
          </h1>
          <p className="text-lg text-gray-600">
            Encontre alunos para orientar em sua jornada fitness
          </p>
        </motion.div>

        {/* Barra de Pesquisa */}
        <motion.div 
          className="max-w-2xl mx-auto mb-8"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nome ou objetivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 shadow-sm"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </motion.div>

        {/* Lista de Cards */}
        {filteredStudents.length === 0 ? (
          <motion.div 
            className="text-center text-gray-600 mt-12 p-8 bg-white rounded-xl shadow-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-xl">Nenhum aluno encontrado</p>
            <p className="mt-2 text-gray-500">Tente ajustar sua busca ou verifique se há alunos cadastrados</p>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {filteredStudents.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05, duration: 0.3 }}
              >
                <StudentCard
                  id={student.id}
                  name={student.name}
                  age={student.age}
                  weight={student.weight}
                  height={student.height}
                  goal={student.goal}
                  trainingTime={student.trainingTime}
                  imageUrl={student.imageUrl}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default PersonalStudentList; 