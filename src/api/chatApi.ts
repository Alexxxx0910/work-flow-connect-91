
import axios from 'axios';
import { Socket, io } from 'socket.io-client';

const API_URL = 'http://localhost:5000/api';
let socket: Socket | null = null;

export const initializeSocket = (token: string) => {
  if (socket) return socket;
  
  socket = io('http://localhost:5000', {
    auth: { token }
  });
  
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
  return socket;
};

// API para chats
export const fetchChats = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/chats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener chats:', error);
    throw error;
  }
};

export const fetchChat = async (chatId: string, token: string) => {
  try {
    const response = await axios.get(`${API_URL}/chats/${chatId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener chat:', error);
    throw error;
  }
};

export const createChat = async (participantIds: string[], name: string | undefined = undefined, isGroup: boolean = false, token: string) => {
  try {
    const response = await axios.post(`${API_URL}/chats`, 
      { participantIds, name, isGroup },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error al crear chat:', error);
    throw error;
  }
};

export const sendMessage = async (chatId: string, content: string, token: string) => {
  try {
    const response = await axios.post(`${API_URL}/chats/${chatId}/messages`, 
      { content },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    throw error;
  }
};

// Socket.io events
export const onNewMessage = (callback: (message: any) => void) => {
  if (socket) {
    socket.on('new_message', callback);
  }
};

export const onUserTyping = (callback: (data: { chatId: string, userId: string, userName: string }) => void) => {
  if (socket) {
    socket.on('user_typing', callback);
  }
};

export const onMessagesRead = (callback: (data: { chatId: string, userId: string }) => void) => {
  if (socket) {
    socket.on('messages_read', callback);
  }
};

export const onUserStatusChange = (callback: (data: { userId: string, isOnline: boolean, lastSeen: Date }) => void) => {
  if (socket) {
    socket.on('user_status_change', callback);
  }
};

export const emitSendMessage = (chatId: string, content: string) => {
  if (socket) {
    socket.emit('send_message', { chatId, content });
  }
};

export const emitTyping = (chatId: string) => {
  if (socket) {
    socket.emit('typing', { chatId });
  }
};

export const emitMarkRead = (chatId: string) => {
  if (socket) {
    socket.emit('mark_read', { chatId });
  }
};

export const emitJoinChat = (chatId: string) => {
  if (socket) {
    socket.emit('join_chat', { chatId });
  }
};
