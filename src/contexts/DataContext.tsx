
import React, { createContext, useContext, useState, useEffect } from 'react';
import { JobType } from './JobContext';
import { ChatType } from './ChatContext';
import { mockJobs, mockUsers, mockChats } from '@/data/mockData';
import { API_URL, USE_MOCK_DATA } from '@/lib/apiUrl';

// Tipos
type UserType = {
  id: string;
  name: string;
  email?: string;
  role?: string;
  photoURL?: string;
  isOnline?: boolean;
  lastSeen?: Date;
};

type DataContextType = {
  users: UserType[];
  jobs: JobType[];
  jobCategories: string[];
  skillsList: string[];
  loadingUsers: boolean;
  loadingJobs: boolean;
  addNewJob: (job: JobType) => void;
  updateJob: (jobId: string, updatedJob: JobType) => void;
  deleteJob: (jobId: string) => void;
  addNewChat: (chat: ChatType) => void;
  updateChat: (chatId: string, updatedChat: ChatType) => void;
};

// Categorías de trabajo y habilidades predefinidas
const JOB_CATEGORIES = [
  'Desarrollo web',
  'Desarrollo móvil',
  'Diseño gráfico',
  'Marketing digital',
  'Redacción y traducción',
  'Video y animación',
  'Música y audio',
  'Programación y tecnología',
  'Negocios',
  'Estilo de vida',
  'Otros'
];

const SKILLS_LIST = [
  'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js', 'Node.js',
  'Python', 'Java', 'PHP', 'Ruby', 'C#', '.NET',
  'HTML', 'CSS', 'Sass', 'Bootstrap', 'Tailwind CSS',
  'MongoDB', 'MySQL', 'PostgreSQL', 'Firebase',
  'AWS', 'Azure', 'Google Cloud',
  'Docker', 'Kubernetes', 'CI/CD',
  'WordPress', 'Shopify', 'Wix',
  'SEO', 'SEM', 'Social Media',
  'Photoshop', 'Illustrator', 'Sketch', 'Figma', 'XD',
  'UX/UI', 'Diseño web', 'Diseño móvil',
  'Swift', 'Kotlin', 'Flutter', 'React Native',
  'Redacción', 'Copywriting', 'Traducción',
  'Video', 'Animación', 'Motion Graphics',
  'Edición de audio', 'Producción musical'
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [loadingJobs, setLoadingJobs] = useState<boolean>(false);
  
  // Cargar usuarios y trabajos al iniciar
  useEffect(() => {
    fetchUsers();
    fetchJobs();
  }, []);
  
  // Función para obtener usuarios
  const fetchUsers = async () => {
    setLoadingUsers(true);
    
    try {
      // Primero intentar obtener usuarios reales
      if (!USE_MOCK_DATA) {
        try {
          const response = await fetch(`${API_URL}/users`);
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.users) {
              setUsers(data.users);
              setLoadingUsers(false);
              return;
            }
          }
        } catch (error) {
          console.error("Error al cargar usuarios reales:", error);
        }
      }
      
      // Si no se pudieron obtener usuarios reales, usar mock data
      setUsers(mockUsers);
      console.log("Usuarios mock cargados");
      
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    } finally {
      setLoadingUsers(false);
    }
  };
  
  // Función para obtener trabajos
  const fetchJobs = async () => {
    setLoadingJobs(true);
    
    try {
      // Primero intentar obtener trabajos reales
      if (!USE_MOCK_DATA) {
        try {
          console.log("API Request: GET", `${API_URL}/jobs`, undefined);
          const response = await fetch(`${API_URL}/jobs`);
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.jobs) {
              setJobs(data.jobs);
              setLoadingJobs(false);
              return;
            }
          }
        } catch (error) {
          console.error("Error al cargar trabajos reales:", error);
        }
      }
      
      // Si no se pudieron obtener trabajos reales, usar mock data
      setJobs(mockJobs);
      console.log("Trabajos mock cargados");
      
    } catch (error) {
      console.error("Error al obtener trabajos:", error);
    } finally {
      setLoadingJobs(false);
    }
  };
  
  // Función para añadir un nuevo trabajo
  const addNewJob = (job: JobType) => {
    setJobs(prevJobs => [job, ...prevJobs]);
  };
  
  // Función para actualizar un trabajo
  const updateJob = (jobId: string, updatedJob: JobType) => {
    setJobs(prevJobs => 
      prevJobs.map(job => job.id === jobId ? updatedJob : job)
    );
  };
  
  // Función para eliminar un trabajo
  const deleteJob = (jobId: string) => {
    setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
  };
  
  // Función para añadir un nuevo chat
  const addNewChat = (chat: ChatType) => {
    // Esta función sería implementada si se añadiera gestión de chats al contexto
    // Por ahora solo para demo
    console.log("Nuevo chat añadido:", chat);
  };
  
  // Función para actualizar un chat
  const updateChat = (chatId: string, updatedChat: ChatType) => {
    // Esta función sería implementada si se añadiera gestión de chats al contexto
    // Por ahora solo para demo
    console.log("Chat actualizado:", chatId, updatedChat);
  };
  
  const value = {
    users,
    jobs,
    jobCategories: JOB_CATEGORIES,
    skillsList: SKILLS_LIST,
    loadingUsers,
    loadingJobs,
    addNewJob,
    updateJob,
    deleteJob,
    addNewChat,
    updateChat
  };
  
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
