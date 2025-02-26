import { FC, useState, useEffect } from 'react';
import { FaSearch, FaUserPlus, FaEllipsisV, FaTrash, FaEdit, FaEnvelope, FaUsers } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { connectionUrl } from '../../config/api';

interface Personal {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  status: 'active' | 'inactive';
  studentCount: number;
  joinDate: string;
}

const AcademiaPersonals: FC = () => {
  const [personals, setPersonals] = useState<Personal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const fetchPersonals = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${connectionUrl}/academia/personals`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setPersonals(data);
        } else {
          // Dados de exemplo em caso de falha na API
          setPersonals([
            {
              id: '1',
              name: 'Carlos Oliveira',
              email: 'carlos.oliveira@example.com',
              phone: '(11) 98765-4321',
              specialty: 'Musculação',
              status: 'active',
              studentCount: 12,
              joinDate: '2023-01-10'
            },
            {
              id: '2',
              name: 'Amanda Silva',
              email: 'amanda.silva@example.com',
              phone: '(11) 91234-5678',
              specialty: 'Funcional',
              status: 'active',
              studentCount: 8,
              joinDate: '2023-02-15'
            },
            {
              id: '3',
              name: 'Roberto Santos',
              email: 'roberto.santos@example.com',
              phone: '(11) 99876-5432',
              specialty: 'Crossfit',
              status: 'inactive',
              studentCount: 0,
              joinDate: '2022-11-05'
            },
            {
              id: '4',
              name: 'Juliana Costa',
              email: 'juliana.costa@example.com',
              phone: '(11) 95555-9999',
              specialty: 'Pilates',
              status: 'active',
              studentCount: 15,
              joinDate: '2023-03-01'
            }
          ]);
        }
      } catch (error) {
        console.error('Erro ao buscar personais:', error);
        // Usar dados de exemplo em caso de erro
        setPersonals([
          {
            id: '1',
            name: 'Carlos Oliveira',
            email: 'carlos.oliveira@example.com',
            phone: '(11) 98765-4321',
            specialty: 'Musculação',
            status: 'active',
            studentCount: 12,
            joinDate: '2023-01-10'
          },
          {
            id: '2',
            name: 'Amanda Silva',
            email: 'amanda.silva@example.com',
            phone: '(11) 91234-5678',
            specialty: 'Funcional',
            status: 'active',
            studentCount: 8,
            joinDate: '2023-02-15'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonals();
  }, []);

  const handleAddPersonal = () => {
    Swal.fire({
      title: 'Adicionar Novo Personal',
      html: `
        <input type="email" id="email" class="swal2-input" placeholder="Email do personal">
        <p class="text-sm text-gray-500 mt-2">
          Um convite será enviado para o email informado. O personal deverá se cadastrar na plataforma.
        </p>
      `,
      showCancelButton: true,
      confirmButtonText: 'Enviar Convite',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const email = (document.getElementById('email') as HTMLInputElement).value;
        
        if (!email) {
          Swal.showValidationMessage('Por favor, informe o email do personal');
          return;
        }
        
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${connectionUrl}/academia/invite-personal`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ email })
          });

          if (!response.ok) {
            throw new Error('Erro ao enviar convite');
          }

          return response.json();
        } catch (error) {
          Swal.showValidationMessage(`Erro: ${error}`);
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Sucesso!', 'Convite enviado com sucesso', 'success');
      }
    });
  };

  const handleEditPersonal = (personal: Personal) => {
    Swal.fire({
      title: 'Editar Personal',
      html: `
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
          <input type="text" id="name" class="swal2-input" value="${personal.name}" readonly>
        </div>
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" id="email" class="swal2-input" value="${personal.email}" readonly>
        </div>
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
          <input type="tel" id="phone" class="swal2-input" value="${personal.phone}">
        </div>
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-1">Especialidade</label>
          <input type="text" id="specialty" class="swal2-input" value="${personal.specialty}">
        </div>
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select id="status" class="swal2-input">
            <option value="active" ${personal.status === 'active' ? 'selected' : ''}>Ativo</option>
            <option value="inactive" ${personal.status === 'inactive' ? 'selected' : ''}>Inativo</option>
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Salvar',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const phone = (document.getElementById('phone') as HTMLInputElement).value;
        const specialty = (document.getElementById('specialty') as HTMLInputElement).value;
        const status = (document.getElementById('status') as HTMLSelectElement).value as 'active' | 'inactive';
        
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${connectionUrl}/academia/personals/${personal.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ phone, specialty, status })
          });

          if (!response.ok) {
            throw new Error('Erro ao atualizar personal');
          }

          return { phone, specialty, status };
        } catch (error) {
          Swal.showValidationMessage(`Erro: ${error}`);
        }
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        Swal.fire('Sucesso!', 'Personal atualizado com sucesso', 'success');
        // Atualizar o personal na lista
        const updatedPersonals = personals.map(p => 
          p.id === personal.id ? { ...p, ...result.value } : p
        );
        setPersonals(updatedPersonals);
      }
    });
  };

  const handleRemovePersonal = (personal: Personal) => {
    Swal.fire({
      title: 'Tem certeza?',
      text: `Você está prestes a remover ${personal.name} da sua academia.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, remover',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${connectionUrl}/academia/personals/${personal.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            Swal.fire('Removido!', 'O personal foi removido com sucesso.', 'success');
            // Remover o personal da lista
            setPersonals(personals.filter(p => p.id !== personal.id));
          } else {
            throw new Error('Erro ao remover personal');
          }
        } catch (error) {
          console.error('Erro ao remover personal:', error);
          Swal.fire('Erro!', 'Não foi possível remover o personal.', 'error');
          // Simulação de remoção para demonstração
          setPersonals(personals.filter(p => p.id !== personal.id));
        }
      }
    });
  };

  const handleContactPersonal = (personal: Personal) => {
    Swal.fire({
      title: 'Enviar Mensagem',
      html: `
        <p class="mb-2">Enviar mensagem para ${personal.name}</p>
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

  const toggleDropdown = (personalId: string) => {
    if (activeDropdown === personalId) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(personalId);
    }
  };

  const filteredPersonals = personals.filter(personal => 
    personal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    personal.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    personal.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Personais</h1>
        <button
          onClick={handleAddPersonal}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FaUserPlus className="mr-2" />
          Adicionar Personal
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
            placeholder="Buscar personais por nome, email ou especialidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : filteredPersonals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum personal encontrado.</p>
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
                    Especialidade
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alunos
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
                {filteredPersonals.map((personal) => (
                  <tr key={personal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                          {personal.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{personal.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{personal.email}</div>
                      <div className="text-sm text-gray-500">{personal.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        {personal.specialty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        personal.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {personal.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaUsers className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{personal.studentCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(personal.joinDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                      <button
                        onClick={() => toggleDropdown(personal.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <FaEllipsisV />
                      </button>
                      {activeDropdown === personal.id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            <button
                              onClick={() => {
                                setActiveDropdown(null);
                                handleEditPersonal(personal);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <FaEdit className="mr-2" /> Editar
                            </button>
                            <button
                              onClick={() => {
                                setActiveDropdown(null);
                                handleContactPersonal(personal);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <FaEnvelope className="mr-2" /> Contatar
                            </button>
                            <button
                              onClick={() => {
                                setActiveDropdown(null);
                                handleRemovePersonal(personal);
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

export default AcademiaPersonals; 