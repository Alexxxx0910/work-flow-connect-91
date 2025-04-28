
// Mock data para la aplicación
import { JobType } from "@/contexts/JobContext";
import { ChatType, MessageType } from "@/contexts/ChatContext";

// Usuarios mock
export const mockUsers = [
  {
    id: "user1",
    name: "Juan Pérez",
    email: "juan@example.com",
    role: "freelancer",
    photoURL: "https://randomuser.me/api/portraits/men/1.jpg",
    isOnline: true,
    lastSeen: new Date()
  },
  {
    id: "user2",
    name: "María López",
    email: "maria@example.com",
    role: "client",
    photoURL: "https://randomuser.me/api/portraits/women/1.jpg",
    isOnline: false,
    lastSeen: new Date(Date.now() - 3600000)
  },
  {
    id: "user3",
    name: "Carlos Rodríguez",
    email: "carlos@example.com",
    role: "freelancer",
    photoURL: "https://randomuser.me/api/portraits/men/2.jpg",
    isOnline: true,
    lastSeen: new Date()
  },
  {
    id: "user4",
    name: "Ana García",
    email: "ana@example.com",
    role: "client",
    photoURL: "https://randomuser.me/api/portraits/women/2.jpg",
    isOnline: false,
    lastSeen: new Date(Date.now() - 7200000)
  },
  {
    id: "user5",
    name: "Luis Martínez",
    email: "luis@example.com",
    role: "freelancer",
    photoURL: "https://randomuser.me/api/portraits/men/3.jpg",
    isOnline: true,
    lastSeen: new Date()
  }
];

// Trabajos mock
export const mockJobs: JobType[] = [
  {
    id: "job1",
    title: "Diseño de logotipo para empresa de tecnología",
    description: "Necesito un logotipo moderno y atractivo para mi nueva startup de tecnología. Debe transmitir innovación y confianza.",
    budget: 500,
    category: "Diseño gráfico",
    skills: ["Illustrator", "Branding", "Diseño moderno"],
    status: "open",
    userId: "user2",
    user: {
      id: "user2",
      name: "María López",
      photoURL: "https://randomuser.me/api/portraits/women/1.jpg",
    },
    timestamp: Date.now() - 86400000 * 3, // 3 días atrás
    comments: [
      {
        id: "comment1",
        content: "Hola, me interesa tu proyecto. ¿Tienes alguna preferencia de color?",
        userId: "user1",
        userName: "Juan Pérez",
        userPhoto: "https://randomuser.me/api/portraits/men/1.jpg",
        timestamp: Date.now() - 86400000 * 2, // 2 días atrás
        replies: [
          {
            id: "reply1",
            content: "Prefiero colores azules y verdes, algo que refleje tecnología.",
            userId: "user2",
            userName: "María López",
            userPhoto: "https://randomuser.me/api/portraits/women/1.jpg",
            timestamp: Date.now() - 86400000 * 1, // 1 día atrás
          }
        ]
      }
    ],
    likedBy: []
  },
  {
    id: "job2",
    title: "Desarrollo de aplicación web con React",
    description: "Busco desarrollador para crear una aplicación web de gestión de inventario usando React, Node.js y MongoDB.",
    budget: 2000,
    category: "Desarrollo web",
    skills: ["React", "Node.js", "MongoDB"],
    status: "open",
    userId: "user4",
    user: {
      id: "user4",
      name: "Ana García",
      photoURL: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    timestamp: Date.now() - 86400000 * 2, // 2 días atrás
    comments: [],
    likedBy: ["user1", "user3"]
  },
  {
    id: "job3",
    title: "Redacción de contenido para blog de viajes",
    description: "Necesito redactor con experiencia en blogs de viajes para escribir 5 artículos de 1000 palabras sobre destinos en Europa.",
    budget: 250,
    category: "Redacción y traducción",
    skills: ["Redacción", "SEO", "Viajes"],
    status: "open",
    userId: "user2",
    user: {
      id: "user2",
      name: "María López",
      photoURL: "https://randomuser.me/api/portraits/women/1.jpg",
    },
    timestamp: Date.now() - 86400000 * 1, // 1 día atrás
    comments: [],
    likedBy: []
  },
  {
    id: "job4",
    title: "Aplicación móvil para gimnasio",
    description: "Buscamos desarrollador para crear una aplicación móvil para gimnasio con funciones de seguimiento de ejercicios, reserva de clases y notificaciones.",
    budget: 3000,
    category: "Desarrollo móvil",
    skills: ["React Native", "Firebase", "UX/UI"],
    status: "open",
    userId: "user4",
    user: {
      id: "user4",
      name: "Ana García",
      photoURL: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    timestamp: Date.now() - 86400000 * 5, // 5 días atrás
    comments: [],
    likedBy: ["user5"]
  },
  {
    id: "job5",
    title: "Edición de video para canal de YouTube",
    description: "Necesito editor de video para editar 3 videos semanales para mi canal de YouTube sobre tecnología.",
    budget: 150,
    category: "Video y animación",
    skills: ["Premiere Pro", "After Effects", "Edición de video"],
    status: "open",
    userId: "user2",
    user: {
      id: "user2",
      name: "María López",
      photoURL: "https://randomuser.me/api/portraits/women/1.jpg",
    },
    timestamp: Date.now() - 86400000 * 7, // 7 días atrás
    comments: [],
    likedBy: []
  }
];

// Mensajes mock
const mockMessages: Record<string, MessageType[]> = {
  "chat1": [
    {
      id: "message1",
      content: "Hola, ¿cómo estás?",
      userId: "user1",
      chatId: "chat1",
      createdAt: new Date(Date.now() - 86400000), // 1 día atrás
      read: true,
    },
    {
      id: "message2",
      content: "¡Hola! Muy bien, gracias. ¿En qué puedo ayudarte?",
      userId: "user2",
      chatId: "chat1",
      createdAt: new Date(Date.now() - 86400000 + 3600000), // 1 día atrás + 1 hora
      read: true,
    },
    {
      id: "message3",
      content: "Me interesa tu oferta de trabajo para diseño de logotipo",
      userId: "user1",
      chatId: "chat1",
      createdAt: new Date(Date.now() - 86400000 + 7200000), // 1 día atrás + 2 horas
      read: true,
    }
  ],
  "chat2": [
    {
      id: "message4",
      content: "Hola Carlos, vi tu perfil y creo que serías perfecto para mi proyecto de desarrollo web",
      userId: "user4",
      chatId: "chat2",
      createdAt: new Date(Date.now() - 172800000), // 2 días atrás
      read: true,
    },
    {
      id: "message5",
      content: "Hola Ana, gracias por contactarme. Me encantaría saber más detalles sobre el proyecto",
      userId: "user3",
      chatId: "chat2",
      createdAt: new Date(Date.now() - 172800000 + 3600000), // 2 días atrás + 1 hora
      read: true,
    }
  ]
};

// Chats mock
export const mockChats: ChatType[] = [
  {
    id: "chat1",
    name: "",
    isGroup: false,
    lastMessageAt: new Date(Date.now() - 86400000 + 7200000), // 1 día atrás + 2 horas
    participants: [
      {
        id: "user1",
        name: "Juan Pérez",
        photoURL: "https://randomuser.me/api/portraits/men/1.jpg",
        isOnline: true,
      },
      {
        id: "user2",
        name: "María López",
        photoURL: "https://randomuser.me/api/portraits/women/1.jpg",
        isOnline: false,
      }
    ],
    messages: mockMessages.chat1
  },
  {
    id: "chat2",
    name: "",
    isGroup: false,
    lastMessageAt: new Date(Date.now() - 172800000 + 3600000), // 2 días atrás + 1 hora
    participants: [
      {
        id: "user3",
        name: "Carlos Rodríguez",
        photoURL: "https://randomuser.me/api/portraits/men/2.jpg",
        isOnline: true,
      },
      {
        id: "user4",
        name: "Ana García",
        photoURL: "https://randomuser.me/api/portraits/women/2.jpg",
        isOnline: false,
      }
    ],
    messages: mockMessages.chat2
  },
  {
    id: "chat3",
    name: "Proyecto diseño web",
    isGroup: true,
    lastMessageAt: new Date(Date.now() - 259200000), // 3 días atrás
    participants: [
      {
        id: "user1",
        name: "Juan Pérez",
        photoURL: "https://randomuser.me/api/portraits/men/1.jpg",
        isOnline: true,
      },
      {
        id: "user2",
        name: "María López",
        photoURL: "https://randomuser.me/api/portraits/women/1.jpg",
        isOnline: false,
      },
      {
        id: "user3",
        name: "Carlos Rodríguez",
        photoURL: "https://randomuser.me/api/portraits/men/2.jpg",
        isOnline: true,
      }
    ],
    messages: []
  }
];

// Función para generar un nuevo chat
export const generateNewChat = (
  participantIds: string[], 
  currentUser: any, 
  name?: string, 
  isGroup: boolean = false
): ChatType => {
  // Asegurar que el usuario actual está en los participantes
  const allParticipantIds = [...new Set([...participantIds, currentUser.id])];
  
  // Encontrar usuarios participantes
  const participants = allParticipantIds.map(id => {
    const user = mockUsers.find(u => u.id === id);
    return {
      id: user?.id || id,
      name: user?.name || "Usuario",
      photoURL: user?.photoURL,
      isOnline: user?.isOnline || false,
      lastSeen: user?.lastSeen
    };
  });
  
  // Crear ID único para el nuevo chat
  const chatId = `chat_${Date.now()}`;
  
  // Crear mensaje de bienvenida para nuevo chat
  const welcomeMessage: MessageType = {
    id: `message_${Date.now()}`,
    content: isGroup 
      ? `${currentUser.name} creó el grupo ${name || "Chat grupal"}`
      : `${currentUser.name} inició la conversación`,
    userId: null, // Mensaje del sistema
    chatId,
    createdAt: new Date(),
    read: true,
  };
  
  // Crear nuevo chat
  const newChat: ChatType = {
    id: chatId,
    name: isGroup ? (name || "Nuevo grupo") : "",
    isGroup,
    lastMessageAt: new Date(),
    participants,
    messages: [welcomeMessage]
  };
  
  return newChat;
};
