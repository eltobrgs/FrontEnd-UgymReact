import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface UserData {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  plan?: string;
  image?: string;
  stats?: {
    steps: number;
    calories: number;
    progress: number;
  };
  preferences?: {
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
    imc?: number;
  };
}

interface UserContextType {
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
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
      if (!token) return;

      const userResponse = await fetch('http://localhost:3000/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) throw new Error('Erro ao buscar dados do usuário');

      const userData = await userResponse.json();

      const preferencesResponse = await fetch('http://localhost:3000/preferences', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (preferencesResponse.ok) {
        const preferencesData = await preferencesResponse.json();
        const imc = calculateIMC(preferencesData.weight, preferencesData.height);
        
        setUserData({
          ...userData,
          preferences: {
            ...preferencesData,
            imc
          },
          plan: 'Silver Plan', // Você pode ajustar isso conforme necessário
          image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=500&h=500&fit=crop',
          stats: {
            steps: 9300,
            calories: 2900,
            progress: 86
          }
        });
      } else {
        setUserData(userData);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{ userData, setUserData, fetchUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 