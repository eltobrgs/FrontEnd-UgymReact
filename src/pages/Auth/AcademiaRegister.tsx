import { FC, useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiFileText } from 'react-icons/fi';
import Input from '../../components/input/Input';
import Button from '../../components/Button/Button';
import logo from '../../assets/logo.png';
import Swal from 'sweetalert2';
import { connectionUrl } from '../../config/api';

const AcademiaRegister: FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    cnpj: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      Swal.fire('Erro!', 'As senhas não coincidem.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${connectionUrl}/cadastro-academia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          cnpj: formData.cnpj
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao fazer cadastro');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userRole', data.user.role);
      
      Swal.fire('Sucesso!', 'Cadastro realizado com sucesso!', 'success');
      navigate('/auth/academia-profile-setup');
    } catch (error) {
      console.error('Erro ao fazer cadastro:', error);
      Swal.fire('Erro!', error instanceof Error ? error.message : 'Falha ao realizar cadastro. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Cadastro de Academia
        </h2>
        <img src={logo} alt="Logo UGym" className="mx-auto my-4" />
        <p className="mt-2 text-center text-sm text-gray-600">
          Junte-se à nossa plataforma de academias
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Nome da Academia"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              icon={<FiUser size={20} />}
              placeholder="Nome da sua academia"
              required
            />

            <Input
              label="Email Comercial"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              icon={<FiMail size={20} />}
              placeholder="Email comercial da academia"
              required
            />

            <Input
              label="CNPJ"
              type="text"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
              icon={<FiFileText size={20} />}
              placeholder="CNPJ da academia"
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
              Criar Conta de Academia
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

export default AcademiaRegister; 