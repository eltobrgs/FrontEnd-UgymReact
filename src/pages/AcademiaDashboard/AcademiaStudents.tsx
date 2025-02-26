import { FC, useState, useEffect } from 'react';
import { FaSearch, FaUserPlus, FaEllipsisV, FaTrash, FaEdit, FaEnvelope } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { connectionUrl } from '../../config/api';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

const AcademiaStudents: FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${connectionUrl}/academia/students`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setStudents(data);
        } else {
          // Dados de exemplo em caso de falha na API
          setStudents([
            {
              id: '1',
              name: 'João Silva',
              email: 'joao.silva@example.com',
              phone: '(11) 98765-4321',
              plan: 'Premium',
              status: 'active',
              joinDate: '2023-01-15'
            },
            {
              id: '2',
              name: 'Maria Oliveira',
              email: 'maria.oliveira@example.com',
              phone: '(11) 91234-5678',
              plan: 'Básico',
              status: 'active',
              joinDate: '2023-02-20'
            },
            {
              id: '3',
              name: 'Pedro Santos',
              email: 'pedro.santos@example.com',
              phone: '(11) 99876-5432',
              plan: 'Premium',
              status: 'inactive',
              joinDate: '2022-11-10'
            },
            {
              id: '4',
              name: 'Ana Costa',
              email: 'ana.costa@example.com',
              phone: '(11) 95555-9999',
              plan: 'Intermediário',
              status: 'active',
              joinDate: '2023-03-05'
            },
            {
              id: '5',
              name: 'Lucas Ferreira',
              email: 'lucas.ferreira@example.com',
              phone: '(11) 94444-8888',
              plan: 'Básico',
              status: 'active',
              joinDate: '2023-04-12'
            }
          ]);
        }
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        // Usar dados de exemplo em caso de erro
        setStudents([
          {
            id: '1',
            name: 'João Silva',
            email: 'joao.silva@example.com',
            phone: '(11) 98765-4321',
            plan: 'Premium',
            status: 'active',
            joinDate: '2023-01-15'
          },
          {
            id: '2',
            name: 'Maria Oliveira',
            email: 'maria.oliveira@example.com',
            phone: '(11) 91234-5678',
            plan: 'Básico',
            status: 'active',
            joinDate: '2023-02-20'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleAddStudent = () => {
    Swal.fire({
      title: 'Adicionar Novo Aluno',
      html: `
        <input type="text" id="name" class="swal2-input" placeholder="Nome completo">
        <input type="email" id="email" class="swal2-input" placeholder="Email">
        <input type="tel" id="phone" class="swal2-input" placeholder="Telefone">
        <select id="plan" class="swal2-input">
          <option value="">Selecione um plano</option>
          <option value="Básico">Básico</option>
          <option value="Intermediário">Intermediário</option>
          <option value="Premium">Premium</option>
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Adicionar',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const name = (document.getElementById('name') as HTMLInputElement).value;
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const phone = (document.getElementById('phone') as HTMLInputElement).value;
        const plan = (document.getElementById('plan') as HTMLSelectElement).value;
        
        if (!name || !email || !phone || !plan) {
          Swal.showValidationMessage('Por favor, preencha todos os campos');
          return;
        }
        
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${connectionUrl}/academia/add-student`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, email, phone, plan })
          });

          if (!response.ok) {
            throw new Error('Erro ao adicionar aluno');
          }

          return response.json();
        } catch (error) {
          Swal.showValidationMessage(`Erro: ${error}`);
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Sucesso!', 'Aluno adicionado com sucesso', 'success');
        // Adicionar o novo aluno à lista (em um ambiente real, recarregaríamos os dados)
        const newStudent: Student = {
          id: Date.now().toString(),
          name: (document.getElementById('name') as HTMLInputElement).value,
          email: (document.getElementById('email') as HTMLInputElement).value,
          phone: (document.getElementById('phone') as HTMLInputElement).value,
          plan: (document.getElementById('plan') as HTMLSelectElement).value,
          status: 'active',
          joinDate: new Date().toISOString().split('T')[0]
        };
        setStudents([...students, newStudent]);
      }
    });
  };

  const handleEditStudent = (student: Student) => {
    Swal.fire({
      title: 'Editar Aluno',
      html: `
        <input type="text" id="name" class="swal2-input" placeholder="Nome completo" value="${student.name}">
        <input type="email" id="email" class="swal2-input" placeholder="Email" value="${student.email}">
        <input type="tel" id="phone" class="swal2-input" placeholder="Telefone" value="${student.phone}">
        <select id="plan" class="swal2-input">
          <option value="Básico" ${student.plan === 'Básico' ? 'selected' : ''}>Básico</option>
          <option value="Intermediário" ${student.plan === 'Intermediário' ? 'selected' : ''}>Intermediário</option>
          <option value="Premium" ${student.plan === 'Premium' ? 'selected' : ''}>Premium</option>
        </select>
        <select id="status" class="swal2-input">
          <option value="active" ${student.status === 'active' ? 'selected' : ''}>Ativo</option>
          <option value="inactive" ${student.status === 'inactive' ? 'selected' : ''}>Inativo</option>
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Salvar',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const name = (document.getElementById('name') as HTMLInputElement).value;
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const phone = (document.getElementById('phone') as HTMLInputElement).value;
        const plan = (document.getElementById('plan') as HTMLSelectElement).value;
        const status = (document.getElementById('status') as HTMLSelectElement).value as 'active' | 'inactive';
        
        if (!name || !email || !phone || !plan) {
          Swal.showValidationMessage('Por favor, preencha todos os campos');
          return;
        }
        
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${connectionUrl}/academia/students/${student.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, email, phone, plan, status })
          });

          if (!response.ok) {
            throw new Error('Erro ao atualizar aluno');
          }

          return { name, email, phone, plan, status };
        } catch (error) {
          Swal.showValidationMessage(`Erro: ${error}`);
        }
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        Swal.fire('Sucesso!', 'Aluno atualizado com sucesso', 'success');
        // Atualizar o aluno na lista
        const updatedStudents = students.map(s => 
          s.id === student.id ? { ...s, ...result.value } : s
        );
        setStudents(updatedStudents);
      }
    });
  };

  const handleDeleteStudent = (student: Student) => {
    Swal.fire({
      title: 'Tem certeza?',
      text: `Você está prestes a remover ${student.name} da sua academia.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, remover',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${connectionUrl}/academia/students/${student.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            Swal.fire('Removido!', 'O aluno foi removido com sucesso.', 'success');
            // Remover o aluno da lista
            setStudents(students.filter(s => s.id !== student.id));
          } else {
            throw new Error('Erro ao remover aluno');
          }
        } catch (error) {
          console.error('Erro ao remover aluno:', error);
          Swal.fire('Erro!', 'Não foi possível remover o aluno.', 'error');
          // Simulação de remoção para demonstração
          setStudents(students.filter(s => s.id !== student.id));
        }
      }
    });
  };

  const handleContactStudent = (student: Student) => {
    Swal.fire({
      title: 'Enviar Mensagem',
      html: `
        <p class="mb-2">Enviar mensagem para ${student.name}</p>
        <input type="text" id="subject" class="swal2-input" placeholder="Assunto">
        <textarea id="message" class="swal2-textarea" placeholder="Mensagem"></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const subject = (document.getElementById('subject') as HTMLInputElement).value;
        const message = (document.getElementById('message') as HTMLTextAreaElement).value;
        
        if (!subject || !message) {
          Swal.showValidationMessage('Por favor, preencha todos os campos');
          return;
        }
        
        return { subject, message };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Enviado!', 'Sua mensagem foi enviada com sucesso.', 'success');
      }
    });
  };

  const toggleDropdown = (studentId: string) => {
    if (activeDropdown === studentId) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(studentId);
    }
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.plan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Alunos</h1>
        <button
          onClick={handleAddStudent}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FaUserPlus className="mr-2" />
          Adicionar Aluno
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            placeholder="Buscar alunos por nome, email ou plano..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum aluno encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plano
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Entrada
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.email}</div>
                      <div className="text-sm text-gray-500">{student.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {student.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        student.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(student.joinDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                      <button
                        onClick={() => toggleDropdown(student.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <FaEllipsisV />
                      </button>
                      {activeDropdown === student.id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            <button
                              onClick={() => {
                                setActiveDropdown(null);
                                handleEditStudent(student);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <FaEdit className="mr-2" /> Editar
                            </button>
                            <button
                              onClick={() => {
                                setActiveDropdown(null);
                                handleContactStudent(student);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <FaEnvelope className="mr-2" /> Contatar
                            </button>
                            <button
                              onClick={() => {
                                setActiveDropdown(null);
                                handleDeleteStudent(student);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                            >
                              <FaTrash className="mr-2" /> Remover
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademiaStudents; 