import { FC, useState, FormEvent, useEffect } from 'react';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';
import Input from '../../components/GeralPurposeComponents/input/Input';
import Button from '../../components/GeralPurposeComponents/Button/Button';
import ProfileSetup from './AlunoProfileSetup';
import logo from '../../assets/logo.png';
import Swal from 'sweetalert2';
import { connectionUrl } from '../../config/connection';
import { useUser } from '../../contexts/UserContext';

const AlunoRegister: FC = () => {
  const { userData } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [userId, setUserId] = useState('');
  const [academiaId, setAcademiaId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Obtém o ID da academia a partir do usuário logado
    if (userData?.academia) {
      setAcademiaId(userData.academia.id);
      console.log("Academia ID encontrado:", userData.academia.id);
    } else {
      console.log("Não foi possível encontrar o ID da academia");
    }
  }, [userData]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      Swal.fire('Erro!', 'O nome é obrigatório.', 'error');
      return false;
    }

    if (!formData.email.trim()) {
      Swal.fire('Erro!', 'O email é obrigatório.', 'error');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Swal.fire('Erro!', 'Por favor, insira um email válido.', 'error');
      return false;
    }

    if (formData.password.length < 6) {
      Swal.fire('Erro!', 'A senha deve ter pelo menos 6 caracteres.', 'error');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Swal.fire('Erro!', 'As senhas não coincidem.', 'error');
      return false;
    }

    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      console.log("Enviando dados com academiaId:", academiaId);
      
      const response = await fetch(`${connectionUrl}/aluno/cadastrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          academiaId: academiaId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.error?.includes('já cadastrado')) {
          throw new Error('Este email já está cadastrado. Por favor, use outro email ou faça login.');
        }
        throw new Error(data.error || 'Erro ao fazer cadastro');
      }

      // Quando uma academia cadastra um aluno, não devemos sobrescrever o token atual
      // pois isso faria com que a academia "perdesse" sua sessão
      // Em vez disso, apenas armazenamos o ID do usuário para configuração do perfil
      if (userData?.role === 'ACADEMIA') {
        // Apenas armazena o ID temporariamente para o setup do perfil
        setUserId(data.user.id);
        // Usa o mesmo token da academia para a configuração do perfil
        const tempToken = data.token; // Guardamos para usar apenas no ProfileSetup
        setShowProfileSetup(true);
        
        // Passar o token como propriedade para o componente de setup
        // em vez de substituir no localStorage
        localStorage.setItem('tempUserToken', tempToken);
        localStorage.setItem('tempUserId', data.user.id);
      } else {
        // Caso de auto-cadastro (não sendo feito por uma academia)
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('userRole', data.user.role);
        setUserId(data.user.id);
        setShowProfileSetup(true);
      }
    } catch (error) {
      console.error('Erro ao fazer cadastro:', error);
      Swal.fire({
        title: 'Erro!',
        text: error instanceof Error ? error.message : 'Falha ao realizar cadastro. Tente novamente.',
        icon: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSetupSuccess = () => {
    setShowProfileSetup(false);
    
    // Limpar tokens/IDs temporários após o setup concluído
    localStorage.removeItem('tempUserToken');
    localStorage.removeItem('tempUserId');
    
    // Limpar o formulário
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    
    // Mostrar mensagem de sucesso
    Swal.fire('Sucesso!', 'Aluno cadastrado com sucesso!', 'success');
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h4 className="text-center text-3xl font-extrabold text-gray-900">
            Crie Sua conta como aluno 
          </h4>
          <img src={logo} alt="Logo UGym" className="mx-auto my-4" />
          
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                label="Nome"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                icon={<FiUser size={20} />}
                placeholder="Seu nome completo"
                required
              />

              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                icon={<FiMail size={20} />}
                placeholder="Seu melhor email"
                required
              />

              <Input
                label="Senha"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                icon={<FiLock size={20} />}
                placeholder="Crie uma senha forte"
                required
              />

              <Input
                label="Confirmar Senha"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                icon={<FiLock size={20} />}
                placeholder="Confirme sua senha"
                required
              />

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  required
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                  Eu concordo com os{' '}
                  <a href="#" className="text-indigo-600 hover:text-indigo-500">
                    Termos de Serviço
                  </a>
                  {' '}e{' '}
                  <a href="#" className="text-indigo-600 hover:text-indigo-500">
                    Política de Privacidade
                  </a>
                </label>
              </div>

              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
              >
                {isLoading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>

    
          </div>
        </div>
      </div>

      <ProfileSetup
        isOpen={showProfileSetup}
        onClose={() => setShowProfileSetup(false)}
        onSuccess={handleProfileSetupSuccess}
        userId={userId}
        academiaId={academiaId}
        temporaryToken={localStorage.getItem('tempUserToken')}
      />
    </>
  );
};

export default AlunoRegister; 