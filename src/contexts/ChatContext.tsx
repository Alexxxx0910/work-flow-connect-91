
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';
import { initializeSocket, getSocket, emitTyping, emitMarkRead, emitJoinChat } from '@/api/chatApi';
import { useData } from './DataContext';
import { mockChats, generateNewChat } from '@/data/mockData';
import { USE_MOCK_DATA } from '@/lib/apiUrl';

// Tipos
export type MessageType = {
  id: string;
  content: string;
  userId: string | null;
  chatId: string;
  createdAt: Date;
  read: boolean;
  userName?: string;
  userPhoto?: string;
};

export type ParticipantType = {
  id: string;
  name: string;
  photoURL?: string;
  isOnline?: boolean;
  lastSeen?: Date;
};

export type ChatType = {
  id: string;
  name: string;
  isGroup: boolean;
  lastMessageAt: Date;
  participants: ParticipantType[];
  messages: MessageType[];
};

type ChatContextType = {
  chats: ChatType[];
  currentChat: ChatType | null;
  loadingChats: boolean;
  sendingMessage: boolean;
  typingUsers: Record<string, string[]>;
  fetchUserChats: () => Promise<void>;
  selectChat: (chatId: string) => void;
  sendMessage: (content: string) => Promise<void>;
  createChat: (participantIds: string[], name?: string, isGroup?: boolean) => Promise<void>;
  handleTyping: (chatId: string) => void;
  markMessagesRead: (chatId: string) => Promise<void>;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, token, isLoggedIn } = useAuth();
  const { addNewChat, updateChat } = useData();
  
  const [chats, setChats] = useState<ChatType[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatType | null>(null);
  const [loadingChats, setLoadingChats] = useState<boolean>(false);
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  
  // Inicializar socket cuando hay usuario autenticado
  useEffect(() => {
    if (isLoggedIn && token) {
      const socket = initializeSocket(token);
      
      // Manejar nuevos mensajes
      socket.on('new_message', (message: MessageType) => {
        setChats(prevChats => {
          const updatedChats = prevChats.map(chat => {
            if (chat.id === message.chatId) {
              const isCurrentChat = currentChat?.id === chat.id;
              
              // Si es el chat actual, marcar como leído inmediatamente
              if (isCurrentChat) {
                emitMarkRead(chat.id);
              }
              
              return {
                ...chat,
                messages: [message, ...chat.messages],
                lastMessageAt: message.createdAt,
              };
            }
            return chat;
          });
          
          // Ordenar chats por último mensaje
          return updatedChats.sort((a, b) => 
            new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
          );
        });
        
        // Actualizar el chat actual si está abierto
        if (currentChat?.id === message.chatId) {
          setCurrentChat(prevChat => {
            if (!prevChat) return prevChat;
            return {
              ...prevChat,
              messages: [message, ...prevChat.messages],
              lastMessageAt: message.createdAt,
            };
          });
        }
      });
      
      // Manejar escritura de usuarios
      socket.on('user_typing', (data) => {
        const { chatId, userId, userName } = data;
        
        setTypingUsers(prev => {
          const chatTypers = prev[chatId] || [];
          if (!chatTypers.includes(userName)) {
            const newChatTypers = [...chatTypers, userName];
            
            // Eliminar después de un tiempo
            setTimeout(() => {
              setTypingUsers(latest => {
                const currentTypers = latest[chatId] || [];
                return {
                  ...latest,
                  [chatId]: currentTypers.filter(name => name !== userName)
                };
              });
            }, 3000);
            
            return { ...prev, [chatId]: newChatTypers };
          }
          return prev;
        });
      });
      
      // Manejar mensajes leídos
      socket.on('messages_read', (data) => {
        const { chatId, userId } = data;
        
        // Actualizar estado de lectura de mensajes
        setChats(prevChats => {
          return prevChats.map(chat => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: chat.messages.map(msg => {
                  if (msg.userId === currentUser?.id && !msg.read) {
                    return { ...msg, read: true };
                  }
                  return msg;
                })
              };
            }
            return chat;
          });
        });
        
        // Actualizar mensajes en chat actual
        if (currentChat?.id === chatId) {
          setCurrentChat(prevChat => {
            if (!prevChat) return prevChat;
            return {
              ...prevChat,
              messages: prevChat.messages.map(msg => {
                if (msg.userId === currentUser?.id && !msg.read) {
                  return { ...msg, read: true };
                }
                return msg;
              })
            };
          });
        }
      });
      
      // Manejar cambios de estado de usuarios
      socket.on('user_status_change', (data) => {
        const { userId, isOnline, lastSeen } = data;
        
        setChats(prevChats => {
          return prevChats.map(chat => {
            return {
              ...chat,
              participants: chat.participants.map(p => {
                if (p.id === userId) {
                  return { ...p, isOnline, lastSeen };
                }
                return p;
              })
            };
          });
        });
        
        // Actualizar participantes en chat actual
        if (currentChat) {
          setCurrentChat(prevChat => {
            if (!prevChat) return prevChat;
            return {
              ...prevChat,
              participants: prevChat.participants.map(p => {
                if (p.id === userId) {
                  return { ...p, isOnline, lastSeen };
                }
                return p;
              })
            };
          });
        }
      });
      
      // Limpiar eventos al desmontar
      return () => {
        socket.off('new_message');
        socket.off('user_typing');
        socket.off('messages_read');
        socket.off('user_status_change');
      };
    }
  }, [isLoggedIn, token, currentUser?.id, currentChat?.id]);
  
  // Función para obtener chats del usuario
  const fetchUserChats = useCallback(async () => {
    if (!isLoggedIn) return;
    
    setLoadingChats(true);
    
    try {
      // Usar datos mock si está configurado así
      if (USE_MOCK_DATA) {
        console.log("Usando datos mock para chats");
        setChats(mockChats);
        setLoadingChats(false);
        return;
      }
      
      // Si no hay socket, no podemos obtener chats
      const socket = getSocket();
      if (!socket) {
        throw new Error("No hay conexión de socket disponible");
      }
      
      // Implementar lógica para obtener chats desde la API real
      // TODO: Implementar cuando API esté disponible
      
    } catch (error) {
      console.error("Error al cargar chats:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar tus conversaciones"
      });
      
      // Usar datos mock como fallback
      setChats(mockChats);
      
    } finally {
      setLoadingChats(false);
    }
  }, [isLoggedIn]);
  
  // Cargar chats al iniciar
  useEffect(() => {
    if (isLoggedIn) {
      fetchUserChats();
    } else {
      setChats([]);
      setCurrentChat(null);
    }
  }, [isLoggedIn, fetchUserChats]);
  
  // Seleccionar un chat
  const selectChat = useCallback((chatId: string) => {
    // Buscar el chat seleccionado
    const selectedChat = chats.find(chat => chat.id === chatId);
    if (selectedChat) {
      setCurrentChat(selectedChat);
      
      // Unirse a la sala de chat vía socket
      if (isLoggedIn) {
        emitJoinChat(chatId);
        
        // Marcar mensajes como leídos
        emitMarkRead(chatId);
      }
    }
  }, [chats, isLoggedIn]);
  
  // Enviar un mensaje
  const sendMessage = async (content: string) => {
    if (!isLoggedIn || !currentUser || !currentChat) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión y seleccionar un chat para enviar mensajes"
      });
      return;
    }
    
    setSendingMessage(true);
    
    try {
      // Usar datos mock si está configurado así
      if (USE_MOCK_DATA) {
        // Crear un ID único para el mensaje
        const messageId = Date.now().toString();
        
        // Crear el mensaje
        const newMessage: MessageType = {
          id: messageId,
          content,
          userId: currentUser.id,
          chatId: currentChat.id,
          createdAt: new Date(),
          read: false,
          userName: currentUser.name,
          userPhoto: currentUser.photoURL,
        };
        
        // Actualizar el chat actual
        setCurrentChat(prevChat => {
          if (!prevChat) return prevChat;
          return {
            ...prevChat,
            messages: [newMessage, ...prevChat.messages],
            lastMessageAt: new Date(),
          };
        });
        
        // Actualizar la lista de chats
        setChats(prevChats => {
          const updatedChats = prevChats.map(chat => {
            if (chat.id === currentChat.id) {
              return {
                ...chat,
                messages: [newMessage, ...chat.messages],
                lastMessageAt: new Date(),
              };
            }
            return chat;
          });
          
          // Ordenar chats por último mensaje
          return updatedChats.sort((a, b) => 
            new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
          );
        });
        
        // Actualizar el chat en el contexto de Data
        updateChat(currentChat.id, {
          ...currentChat,
          messages: [newMessage, ...currentChat.messages],
          lastMessageAt: new Date(),
        });
        
        return;
      }
      
      // Si tenemos socket, enviar mensaje
      const socket = getSocket();
      if (socket) {
        socket.emit('send_message', { 
          chatId: currentChat.id, 
          content 
        });
      } else {
        throw new Error("No hay conexión de socket disponible");
      }
      
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el mensaje"
      });
    } finally {
      setSendingMessage(false);
    }
  };
  
  // Crear un nuevo chat
  const createChat = async (participantIds: string[], name?: string, isGroup: boolean = false) => {
    if (!isLoggedIn || !currentUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para crear chats"
      });
      return;
    }
    
    try {
      // Usar datos mock si está configurado así
      if (USE_MOCK_DATA) {
        // Generar nuevo chat con los participantes
        const newChat = generateNewChat(participantIds, currentUser, name, isGroup);
        
        // Agregar chat a la lista
        setChats(prevChats => {
          const updatedChats = [...prevChats, newChat];
          return updatedChats.sort((a, b) => 
            new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
          );
        });
        
        // Seleccionar el nuevo chat
        setCurrentChat(newChat);
        
        // Guardar en el contexto de Data
        addNewChat(newChat);
        
        return;
      }
      
      // Implementar lógica para crear chat real cuando la API esté disponible
      // TODO: Implementar cuando API esté disponible
      
    } catch (error) {
      console.error("Error al crear chat:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el chat"
      });
      throw error;
    }
  };
  
  // Manejar escritura
  const handleTyping = useCallback((chatId: string) => {
    if (!isLoggedIn) return;
    
    // Enviar evento de escritura por socket
    const socket = getSocket();
    if (socket) {
      socket.emit('typing', { chatId });
    }
  }, [isLoggedIn]);
  
  // Marcar mensajes como leídos
  const markMessagesRead = async (chatId: string) => {
    if (!isLoggedIn) return;
    
    try {
      // Enviar evento de marcar como leído por socket
      emitMarkRead(chatId);
      
      // Actualizar localmente
      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: chat.messages.map(msg => {
                if (msg.userId !== currentUser?.id && !msg.read) {
                  return { ...msg, read: true };
                }
                return msg;
              })
            };
          }
          return chat;
        });
      });
      
      // Actualizar en el chat actual
      if (currentChat?.id === chatId) {
        setCurrentChat(prevChat => {
          if (!prevChat) return prevChat;
          return {
            ...prevChat,
            messages: prevChat.messages.map(msg => {
              if (msg.userId !== currentUser?.id && !msg.read) {
                return { ...msg, read: true };
              }
              return msg;
            })
          };
        });
      }
      
    } catch (error) {
      console.error("Error al marcar mensajes como leídos:", error);
    }
  };
  
  const value = {
    chats,
    currentChat,
    loadingChats,
    sendingMessage,
    typingUsers,
    fetchUserChats,
    selectChat,
    sendMessage,
    createChat,
    handleTyping,
    markMessagesRead
  };
  
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
