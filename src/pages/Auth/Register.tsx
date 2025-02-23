import { FC, useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';
import Input from '../../components/input/Input';
import Button from '../../components/Button/Button';
import logo from '../../assets/logo.png';
import Swal from 'sweetalert2';
import { connectionUrl } from '../../config/api';

const Register: FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

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
      [name]: value.trim()
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${connectionUrl}/cadastro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.error?.includes('já cadastrado')) {
          throw new Error('Este email já está cadastrado. Por favor, use outro email ou faça login.');
        }
        throw new Error(data.error || 'Erro ao fazer cadastro');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userRole', data.user.role);

      await Swal.fire({
        title: 'Sucesso!',
        text: 'Cadastro realizado com sucesso!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      navigate('/auth/profile-setup');
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Crie sua conta
        </h2>
        <img src={logo} alt="Logo UGym" className="mx-auto my-4" />
        <p className="mt-2 text-center text-sm text-gray-600">
          Comece sua jornada fitness com o UGym
        </p>
        <p className="mt-2 text-center text-sm text-gray-500">
          É um personal trainer?{' '}
          <Link
            to="/auth/personal-register"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Cadastre-se aqui
          </Link>
        </p>
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

          <p className="mt-6 text-center text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link
              to="/auth/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 