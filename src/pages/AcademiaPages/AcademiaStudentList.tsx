import { FC, useState, useEffect } from 'react';
import { FaSearch, FaUserPlus } from 'react-icons/fa';
import StudentCard from '../../components/GeralPurposeComponents/StudentCard/StudentCard';
import Swal from 'sweetalert2';
import { connectionUrl } from '../../config/connection';
import Modal from '../../components/GeralPurposeComponents/Modal/Modal';
import Button from '../../components/GeralPurposeComponents/Button/Button';
import { useUser } from '../../contexts/UserContext';

interface Student {
  id: number;
  name: string;
  age: number | string;
  weight: string;
  height: string;
  goal: string;
  trainingTime: string;
  imageUrl?: string;
  academiaId?: number | null;
  imc?: string;
}

const AcademiaStudentList: FC = () => {
  const { userData } = useUser();
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAssociateModal, setShowAssociateModal] = useState(false);
  const [alunoEmail, setAlunoEmail] = useState('');
  const [isAssociating, setIsAssociating] = useState(false);

  // Função para buscar todos os alunos da academia
  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      // Este endpoint já foi modificado no backend para filtrar alunos da mesma academia que o usuário logado
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
        weight: student.weight || 'Não informado',
        height: student.height || 'Não informado',
        goal: student.goal || 'Não informado',
        trainingTime: student.trainingTime || 'Iniciante',
        imageUrl: student.imageUrl || undefined,
        academiaId: student.academiaId,
        imc: student.imc || 'Não calculado'
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

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const filtered = students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.goal.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  // Função para lidar com a exclusão de um aluno
  const handleStudentDelete = () => {
    // Recarregar a lista de alunos após a exclusão
    fetchStudents();
  };

  // Função para associar um aluno à academia
  const handleAssociateStudent = async () => {
    if (!alunoEmail) {
      Swal.fire('Aviso', 'Por favor, informe o email do aluno', 'warning');
      return;
    }

    try {
      setIsAssociating(true);
      const token = localStorage.getItem('token');
      
      if (!token || !userData?.academia?.id) {
        throw new Error('Dados de autenticação/academia não encontrados');
      }

      // Primeiro, buscar o aluno pelo email
      const findResponse = await fetch(`${connectionUrl}/buscar-aluno-email?email=${alunoEmail}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!findResponse.ok) {
        throw new Error('Aluno não encontrado com este email');
      }

      const alunoData = await findResponse.json();
      
      // Associar o aluno à academia
      const associateResponse = await fetch(`${connectionUrl}/associar-aluno-academia`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          alunoId: alunoData.id,
          academiaId: userData.academia.id
        })
      });

      if (!associateResponse.ok) {
        const errorData = await associateResponse.json();
        throw new Error(errorData.error || 'Erro ao associar aluno');
      }

      await Swal.fire({
        title: 'Sucesso!',
        text: 'Aluno associado à academia com sucesso!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      setShowAssociateModal(false);
      setAlunoEmail('');
      
      // Atualizar a lista de alunos
      fetchStudents();

    } catch (error) {
      console.error('Erro ao associar aluno:', error);
      Swal.fire({
        title: 'Erro!',
        text: error instanceof Error ? error.message : 'Falha ao associar aluno',
        icon: 'error'
      });
    } finally {
      setIsAssociating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                Membros da Academia
              </h1>
              <p className="text-xl text-gray-600">
                Gerencie e acompanhe os alunos de sua academia
              </p>
            </div>
            
            <button
              onClick={() => setShowAssociateModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaUserPlus />
              Associar Aluno
            </button>
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
                  imc={student.imc}
                  onDelete={handleStudentDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal para associar aluno */}
      <Modal
        isOpen={showAssociateModal}
        onClose={() => setShowAssociateModal(false)}
        title="Associar Aluno à Academia"
      >
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-6">
            Digite o email do aluno que deseja associar à sua academia
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email do Aluno
            </label>
            <input
              type="email"
              value={alunoEmail}
              onChange={(e) => setAlunoEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="email@exemplo.com"
              required
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAssociateModal(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              isLoading={isAssociating}
              onClick={handleAssociateStudent}
            >
              Associar Aluno
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AcademiaStudentList; 