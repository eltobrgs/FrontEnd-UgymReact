import { FC, useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import StudentCard from '../../components/GeralPurposeComponents/StudentCard/StudentCard';
import Swal from 'sweetalert2';
import { connectionUrl } from '../../config/api';

interface Student {
  id: number;
  name: string;
  age: number;
  weight: string;
  height: string;
  goal: string;
  trainingTime: string;
  imageUrl?: string;
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
        const response = await fetch(`${connectionUrl}/all-students`, {
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
          weight: student.weight || 'Não informado',
          height: student.height || 'Não informado',
          goal: student.goal || 'Não informado',
          trainingTime: student.trainingTime || 'Iniciante',
          imageUrl: student.imageUrl || undefined
        }));
        
        setStudents(processedData);
        setFilteredStudents(processedData);
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        Swal.fire('Erro!', 'Não foi possível carregar a lista de alunos', 'error');
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
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
             Explorar Alunos
          </h1>
          <p className="text-xl text-gray-600">
            Encontre alunos para orientar em sua jornada fitness
          </p>
        </div>

        {/* Barra de Pesquisa */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nome ou objetivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Lista de Cards */}
        {filteredStudents.length === 0 ? (
          <div className="text-center text-gray-600">
            <p className="text-xl">Nenhum aluno encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStudents.map(student => (
              <StudentCard
                key={student.id}
                id={student.id}
                name={student.name}
                age={student.age}
                weight={student.weight}
                height={student.height}
                goal={student.goal}
                trainingTime={student.trainingTime}
                imageUrl={student.imageUrl}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalStudentList; 