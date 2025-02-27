import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { connectionUrl } from '../config/api';

interface Stats {
  steps: number;
  calories: number;
  progress: number;
}

interface PreferenciasAluno {
  id: number;
  birthDate: string;
  gender: string;
  goal: string;
  healthCondition: string;
  experience: string;
  height: string;
  weight: string;
  activityLevel: string;
  medicalConditions: string;
  physicalLimitations: string;
  userId: number;
  personalId?: number;
  imc?: number; // Opcional pois é calculado
}

interface PreferenciasPersonal {
  id: number;
  cref: string;
  specialization: string;
  birthDate: string;
  gender: string;
  specializations: string[];
  yearsOfExperience: string;
  workSchedule: string;
  certifications: string[];
  biography: string;
  workLocation: string;
  pricePerHour: string;
  languages: string[];
  instagram?: string;
  linkedin?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

interface Academia {
  id: number;
  cnpj: string;
  endereco: string;
  telefone: string;
  horarioFuncionamento: string;
  descricao: string;
  comodidades: string[];
  planos: string[];
  website?: string;
  instagram?: string;
  facebook?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserData {
  id: number;
  name: string;
  email: string;
  role: 'ALUNO' | 'PERSONAL' | 'ACADEMIA';
  preferenciasAluno?: PreferenciasAluno;
  preferenciasPersonal?: PreferenciasPersonal;
  academia?: Academia;
  plan?: string;
  image?: string;
  stats?: Stats;
  userPlan?: string;
  imageUrl?: string;
}

interface UserContextType {
  userData: UserData | null;
  setUserData: (userData: UserData | null) => void;
  fetchUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<UserData | null>(null);

  const calculateIMC = (weight: string, height: string): number => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height) / 100; // convertendo cm para metros
    if (weightNum && heightNum) {
      return Number((weightNum / (heightNum * heightNum)).toFixed(2));
    }
    return 0;
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUserData(null);
        return;
      }

      // Buscar dados do usuário
      const userResponse = await fetch(`${connectionUrl}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!userResponse.ok) {
        throw new Error('Falha ao buscar dados do usuário');
      }

      const userData = await userResponse.json();

      // Buscar preferências do usuário se for ALUNO
      if (userData.role === 'ALUNO') {
        const preferencesResponse = await fetch(`${connectionUrl}/preferences`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (preferencesResponse.ok) {
          const preferencesData = await preferencesResponse.json();
          const imc = calculateIMC(preferencesData.weight, preferencesData.height);

          setUserData({
            ...userData,
            preferenciasAluno: {
              ...preferencesData,
              imc
            },
            stats: {
              steps: 8000,
              calories: 1200,
              progress: 75
            }
          });
        } else {
          setUserData({
            ...userData,
            stats: {
              steps: 8000,
              calories: 1200,
              progress: 75
            }
          });
        }
      } 
      // Buscar dados do personal se for PERSONAL
      else if (userData.role === 'PERSONAL') {
        const personalResponse = await fetch(`${connectionUrl}/personal/${userData.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (personalResponse.ok) {
          const personalData = await personalResponse.json();
          setUserData({
            ...userData,
            preferenciasPersonal: personalData
          });
        } else {
          setUserData(userData);
        }
      }
      // Buscar dados da academia se for ACADEMIA
      else if (userData.role === 'ACADEMIA') {
        const academiaResponse = await fetch(`${connectionUrl}/academia-profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (academiaResponse.ok) {
          const academiaData = await academiaResponse.json();
          setUserData({
            ...userData,
            academia: academiaData
          });
        } else {
          setUserData(userData);
        }
      }
      else {
        setUserData(userData);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      setUserData(null);
    }
  };

  useEffect(() => {
    fetchUserData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <UserContext.Provider value={{ userData, setUserData, fetchUserData }}>
      {children}
    </UserContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
}; 