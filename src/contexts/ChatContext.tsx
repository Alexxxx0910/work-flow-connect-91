
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';
import {
  fetchChats,
  fetchChat,
  createChat as createChatApi,
  sendMessage as sendMessageApi,
  initializeSocket,
  disconnectSocket,
  onNewMessage,
  onUserTyping,
  onMessagesRead,
  onUserStatusChange,
  emitSendMessage,
  emitTyping,
  emitMarkRead,
  emitJoinChat
} from '@/api/chatApi';

// Definición de tipos
export interface UserType {
  id: string;
  name: string;
  photoURL?: string;
  isOnline?: boolean;
  lastSeen?: Date;
}

export interface MessageType {
  id: string;
  content: string;
  chatId: string;
  userId: string;
  user?: UserType;
  read: boolean;
  createdAt: Date;
}

export interface ChatType {
  id: string;
  name: string;
  isGroup: boolean;
  lastMessageAt: Date;
  participants: UserType[];
  messages: MessageType[];
}

interface ChatContextType {
  chats: ChatType[];
  currentChat: ChatType | null;
  loadingChats: boolean;
  loadingMessages: boolean;
  sendingMessage: boolean;
  typingUsers: { [chatId: string]: string[] };
  fetchUserChats: () => Promise<void>;
  selectChat: (chatId: string) => Promise<void>;
  createChat: (participantIds: string[], name?: string, isGroup?: boolean) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  handleTyping: (chatId: string) => void;
}

const ChatContext = createContext<ChatContextType>({
  chats: [],
  currentChat: null,
  loadingChats: false,
  loadingMessages: false,
  sendingMessage: false,
  typingUsers: {},
  fetchUserChats: async () => {},
  selectChat: async () => {},
  createChat: async () => {},
  sendMessage: async () => {},
  handleTyping: () => {},
});

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, token } = useAuth();
  const [chats, setChats] = useState<ChatType[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatType | null>(null);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{ [chatId: string]: string[] }>({});

  // Inicializar socket cuando el usuario inicia sesión
  useEffect(() => {
    if (currentUser && token) {
      initializeSocket(token);

      // Configurar listeners de socket
      onNewMessage((message) => {
        setChats((prevChats) => {
          return prevChats.map((chat) => {
            if (chat.id === message.chatId) {
              // Añadir mensaje al chat actual si está abierto
              if (currentChat?.id === message.chatId) {
                setCurrentChat({
                  ...currentChat,
                  messages: [...currentChat.messages, message],
                  lastMessageAt: new Date(),
                });
                emitMarkRead(message.chatId); // Marcar como leído si es el chat actual
              }
              return {
                ...chat,
                messages: [...chat.messages, message],
                lastMessageAt: new Date(),
              };
            }
            return chat;
          });
        });

        // Mostrar notificación si no es un mensaje propio y no está en el chat actual
        if (message.userId !== currentUser.id && currentChat?.id !== message.chatId) {
          const senderName = message.user?.name || 'Alguien';
          toast({
            title: `Mensaje nuevo de ${senderName}`,
            description: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
          });
        }
      });

      onUserTyping(({ chatId, userName }) => {
        setTypingUsers((prev) => {
          const updatedUsers = { ...prev };
          if (!updatedUsers[chatId]) {
            updatedUsers[chatId] = [];
          }
          if (!updatedUsers[chatId].includes(userName)) {
            updatedUsers[chatId] = [...updatedUsers[chatId], userName];
          }
          
          // Eliminar después de 3 segundos
          setTimeout(() => {
            setTypingUsers((current) => {
              const updated = { ...current };
              if (updated[chatId]) {
                updated[chatId] = updated[chatId].filter(name => name !== userName);
                if (updated[chatId].length === 0) {
                  delete updated[chatId];
                }
              }
              return updated;
            });
          }, 3000);
          
          return updatedUsers;
        });
      });

      onMessagesRead(({ chatId }) => {
        if (currentChat && currentChat.id === chatId) {
          setCurrentChat({
            ...currentChat,
            messages: currentChat.messages.map(msg => ({
              ...msg,
              read: true
            }))
          });
        }
      });

      onUserStatusChange(({ userId, isOnline, lastSeen }) => {
        setChats(prevChats => 
          prevChats.map(chat => ({
            ...chat,
            participants: chat.participants.map(p => 
              p.id === userId ? { ...p, isOnline, lastSeen: new Date(lastSeen) } : p
            )
          }))
        );

        if (currentChat) {
          setCurrentChat({
            ...currentChat,
            participants: currentChat.participants.map(p => 
              p.id === userId ? { ...p, isOnline, lastSeen: new Date(lastSeen) } : p
            )
          });
        }
      });

      return () => {
        disconnectSocket();
      };
    }
  }, [currentUser, token, currentChat]);

  const fetchUserChats = async () => {
    if (!currentUser || !token) return;
    
    setLoadingChats(true);
    try {
      const response = await fetchChats(token);
      if (response.success) {
        setChats(response.chats);
      }
    } catch (error) {
      console.error("Error al cargar chats:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los chats. Inténtalo de nuevo más tarde."
      });
    } finally {
      setLoadingChats(false);
    }
  };

  const selectChat = async (chatId: string) => {
    if (!currentUser || !token) return;
    
    setLoadingMessages(true);
    try {
      const response = await fetchChat(chatId, token);
      if (response.success) {
        setCurrentChat(response.chat);
        
        // Unirse al chat a través de socket
        emitJoinChat(chatId);
        
        // Marcar mensajes como leídos
        emitMarkRead(chatId);
      }
    } catch (error) {
      console.error("Error al cargar chat:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar la conversación. Inténtalo de nuevo más tarde."
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  const createChat = async (participantIds: string[], name?: string, isGroup: boolean = false) => {
    if (!currentUser || !token) return;
    
    try {
      const response = await createChatApi(participantIds, name, isGroup, token);
      if (response.success) {
        // Añadir el nuevo chat a la lista
        setChats(prevChats => [response.chat, ...prevChats]);
        
        // Seleccionar el chat recién creado
        setCurrentChat(response.chat);
        
        // Unirse al chat vía socket
        emitJoinChat(response.chat.id);
      }
      return response;
    } catch (error) {
      console.error("Error al crear chat:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el chat. Inténtalo de nuevo más tarde."
      });
      throw error;
    }
  };

  const sendMessage = async (content: string) => {
    if (!currentUser || !currentChat || !token) return;
    
    setSendingMessage(true);
    try {
      // Enviar a través de socket para tiempo real
      emitSendMessage(currentChat.id, content);
      
      // También guardar en la base de datos
      await sendMessageApi(currentChat.id, content, token);
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el mensaje. Inténtalo de nuevo más tarde."
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleTyping = (chatId: string) => {
    if (!currentUser) return;
    emitTyping(chatId);
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        loadingChats,
        loadingMessages,
        sendingMessage,
        typingUsers,
        fetchUserChats,
        selectChat,
        createChat,
        sendMessage,
        handleTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
