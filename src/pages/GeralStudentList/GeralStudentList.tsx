import { FC, useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import StudentCard from '../../components/StudentCard/StudentCard';
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

const StudentList: FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${connectionUrl}/all-students`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar lista de alunos');
        }

        const data = await response.json();
        setStudents(data);
        setFilteredStudents(data);
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        Swal.fire('Erro!', 'Não foi possível carregar a lista de alunos', 'error');
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

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
             Todos os Alunos
          </h1>
          <p className="text-xl text-gray-600">
            Catálogo de Alunos
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

export default StudentList; 