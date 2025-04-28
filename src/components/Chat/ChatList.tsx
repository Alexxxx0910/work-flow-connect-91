
import React, { useEffect } from 'react';
import { useChat, ChatType } from '@/contexts/ChatContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';

export const ChatList = () => {
  const { chats, fetchUserChats, selectChat, currentChat, loadingChats } = useChat();
  const { currentUser, isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserChats();
    }
  }, [isLoggedIn]);

  const getChatName = (chat: ChatType) => {
    if (chat.isGroup) return chat.name;
    
    const otherParticipant = chat.participants.find(p => p.id !== currentUser?.id);
    return otherParticipant?.name || 'Chat';
  };

  const getChatAvatar = (chat: ChatType) => {
    if (chat.isGroup) return null;
    
    const otherParticipant = chat.participants.find(p => p.id !== currentUser?.id);
    return otherParticipant?.photoURL || null;
  };

  const getLastMessage = (chat: ChatType) => {
    if (!chat.messages || chat.messages.length === 0) return 'No hay mensajes aún';
    
    const lastMessage = chat.messages[0]; // Asumiendo que están ordenados por fecha desc
    
    if (lastMessage.userId === currentUser?.id) {
      return `Tú: ${lastMessage.content}`;
    }
    
    return lastMessage.content;
  };

  const getUnreadCount = (chat: ChatType) => {
    if (!chat.messages) return 0;
    
    return chat.messages.filter(msg => 
      msg.userId !== currentUser?.id && !msg.read
    ).length;
  };

  const formatDate = (date: Date) => {
    const messageDate = new Date(date);
    const now = new Date();
    
    // Si es hoy, mostrar hora
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Si es esta semana, mostrar día
    const diff = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 7) {
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Si es este año, mostrar día y mes
    if (messageDate.getFullYear() === now.getFullYear()) {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Si es otro año, mostrar fecha completa
    return messageDate.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (!isLoggedIn) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Inicia sesión para ver tus conversaciones</p>
      </div>
    );
  }

  if (loadingChats) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Cargando chats...</p>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">No tienes conversaciones aún</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 h-full overflow-y-auto py-2">
      {chats.map((chat) => {
        const chatName = getChatName(chat);
        const chatAvatar = getChatAvatar(chat);
        const lastMessage = getLastMessage(chat);
        const unreadCount = getUnreadCount(chat);
        const isSelected = currentChat?.id === chat.id;
        const otherUser = chat.participants.find(p => p.id !== currentUser?.id);
        const isOnline = otherUser?.isOnline;
        
        return (
          <div
            key={chat.id}
            className={`flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-accent ${
              isSelected ? 'bg-accent' : ''
            }`}
            onClick={() => selectChat(chat.id)}
          >
            <div className="relative">
              <Avatar>
                <AvatarImage src={chatAvatar || undefined} />
                <AvatarFallback className="bg-wfc-purple-medium text-white">
                  {chatName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between">
                <h3 className="font-medium truncate">{chatName}</h3>
                <span className="text-xs text-muted-foreground">
                  {formatDate(chat.lastMessageAt)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{lastMessage}</p>
            </div>
            
            {unreadCount > 0 && (
              <Badge className="ml-auto bg-wfc-purple hover:bg-wfc-purple-medium">
                {unreadCount}
              </Badge>
            )}
          </div>
        );
      })}
    </div>
  );
};
