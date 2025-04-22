
/**
 * Servicio de Chat
 */

import { apiRequest } from './api';
import { ChatType, MessageType } from "@/contexts/ChatContext";
import { toast } from '@/components/ui/use-toast';

/**
 * Obtener todos los chats para un usuario
 */
export const getChats = async (): Promise<ChatType[]> => {
  try {
    console.log("Solicitando chats al servidor...");
    const response = await apiRequest('/chats');
    
    if (!response.success) {
      console.error("Error en la respuesta del servidor:", response);
      throw new Error(response.message || 'Error al obtener chats');
    }
    
    console.log("Chats recibidos del servidor:", response.chats?.length || 0);
    
    // Procesar y normalizar los datos de los chats
    const chats = response.chats || [];
    return chats.map((chat: any): ChatType => ({
      id: chat.id,
      name: chat.name || '',
      participants: chat.participants.map((p: any) => p.id),
      messages: (chat.messages || []).map((m: any) => ({
        id: m.id,
        senderId: m.userId,
        content: m.content,
        timestamp: new Date(m.createdAt).getTime()
      })),
      isGroup: chat.isGroup,
      lastMessage: chat.messages && chat.messages.length > 0 ? {
        id: chat.messages[0].id,
        senderId: chat.messages[0].userId,
        content: chat.messages[0].content,
        timestamp: new Date(chat.messages[0].createdAt).getTime()
      } : undefined
    }));
  } catch (error) {
    console.error('Error al obtener chats:', error);
    // Solo mostrar toast si es un error que no sea 404 (no hay chats)
    if (error instanceof Error && !error.message.includes('404')) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los chats. Por favor, inténtalo de nuevo."
      });
    }
    // No lanzar error si no hay chats, solo devolver array vacío
    return [];
  }
};

/**
 * Crear un nuevo chat
 */
export const createChat = async (participantIds: string[], name = ""): Promise<ChatType> => {
  try {
    if (!participantIds || participantIds.length === 0) {
      throw new Error('Se requieren participantes para crear un chat');
    }
    
    console.log("Creando chat con participantes:", participantIds, "nombre:", name);
    
    const response = await apiRequest('/chats', 'POST', {
      participantIds,
      name,
      isGroup: participantIds.length > 2 || !!name
    });

    if (!response.success) {
      console.error("Error en respuesta del servidor:", response);
      throw new Error(response.message || 'Error al crear chat');
    }
    
    console.log("Respuesta del servidor al crear chat:", response);
    
    // Procesar y normalizar los datos del chat creado
    const chat = response.chat;
    return {
      id: chat.id,
      name: chat.name || '',
      participants: chat.participants.map((p: any) => p.id),
      messages: [],
      isGroup: chat.isGroup,
      lastMessage: undefined
    };
  } catch (error) {
    console.error('Error al crear chat:', error);
    throw error;
  }
};

/**
 * Enviar un mensaje a un chat
 */
export const sendMessage = async (chatId: string, content: string): Promise<MessageType> => {
  try {
    if (!chatId || !content.trim()) {
      throw new Error('Se requiere un ID de chat y contenido para enviar un mensaje');
    }
    
    const response = await apiRequest(`/chats/${chatId}/messages`, 'POST', {
      content
    });

    if (!response.success) {
      throw new Error(response.message || 'Error al enviar mensaje');
    }

    // Normalizar el mensaje recibido
    const message = response.chatMessage;
    return {
      id: message.id,
      senderId: message.userId,
      content: message.content,
      timestamp: new Date(message.createdAt).getTime()
    };
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    throw error;
  }
};

/**
 * Añadir un participante a un chat existente
 */
export const addParticipantToChat = async (chatId: string, participantId: string): Promise<boolean> => {
  try {
    if (!chatId || !participantId) {
      throw new Error('Se requiere un ID de chat y un ID de participante');
    }
    
    const response = await apiRequest(`/chats/${chatId}/participants`, 'POST', {
      userId: participantId
    });

    if (!response.success) {
      throw new Error(response.message || 'Error al añadir participante');
    }

    return true;
  } catch (error) {
    console.error('Error al añadir participante:', error);
    return false;
  }
};

/**
 * Obtener un chat por ID
 */
export const getChatById = async (chatId: string): Promise<ChatType | null> => {
  try {
    if (!chatId) {
      throw new Error('Se requiere un ID de chat');
    }
    
    const response = await apiRequest(`/chats/${chatId}`);
    if (!response.success) {
      throw new Error(response.message || 'Error al obtener chat');
    }
    
    // Normalizar el chat recibido
    const chat = response.chat;
    return {
      id: chat.id,
      name: chat.name || '',
      participants: chat.participants.map((p: any) => p.id),
      messages: (chat.messages || []).map((m: any) => ({
        id: m.id,
        senderId: m.userId,
        content: m.content,
        timestamp: new Date(m.createdAt).getTime()
      })),
      isGroup: chat.isGroup,
      lastMessage: chat.messages && chat.messages.length > 0 ? {
        id: chat.messages[0].id,
        senderId: chat.messages[0].userId,
        content: chat.messages[0].content,
        timestamp: new Date(chat.messages[0].createdAt).getTime()
      } : undefined
    };
  } catch (error) {
    console.error('Error al obtener chat:', error);
    return null;
  }
};

// Mapa de callbacks para simular listeners en tiempo real
const listeners: ((chats: ChatType[]) => void)[] = [];

/**
 * Configurar un listener para cambios en los chats
 * Esta función simula la funcionalidad en tiempo real que antes proporcionaba Firebase
 */
export const setupChatListener = (callback: (chats: ChatType[]) => void) => {
  listeners.push(callback);
  
  // Llamar inmediatamente con los datos actuales
  getChats().then(chats => {
    callback(chats);
  }).catch(error => {
    console.error("Error al obtener chats iniciales:", error);
    callback([]);
  });
  
  // Devolver una función para eliminar el listener
  return () => {
    const index = listeners.indexOf(callback);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
};

// Función para actualizar manualmente todos los listeners cuando hay cambios
export const updateChatListeners = (chats: ChatType[]) => {
  listeners.forEach(listener => {
    listener(chats);
  });
};
