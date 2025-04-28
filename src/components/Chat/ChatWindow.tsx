
import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, ArrowLeft } from 'lucide-react';

export const ChatWindow = ({ onBack }: { onBack?: () => void }) => {
  const { currentChat, sendMessage, sendingMessage, typingUsers, handleTyping } = useChat();
  const { currentUser } = useAuth();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Desplazar al final de la conversación cuando se cargan mensajes o se envía uno nuevo
  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendingMessage) return;
    
    try {
      await sendMessage(message);
      setMessage('');
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (currentChat) {
      handleTyping(currentChat.id);
    }
  };

  const getChatName = () => {
    if (!currentChat) return '';
    
    if (currentChat.isGroup) return currentChat.name;
    
    const otherParticipant = currentChat.participants.find(p => p.id !== currentUser?.id);
    return otherParticipant?.name || 'Chat';
  };

  const getChatAvatar = () => {
    if (!currentChat || currentChat.isGroup) return null;
    
    const otherParticipant = currentChat.participants.find(p => p.id !== currentUser?.id);
    return otherParticipant?.photoURL || null;
  };

  const formatMessageTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isUserOnline = () => {
    if (!currentChat || currentChat.isGroup) return false;
    
    const otherParticipant = currentChat.participants.find(p => p.id !== currentUser?.id);
    return otherParticipant?.isOnline || false;
  };

  if (!currentChat) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Selecciona una conversación para comenzar</p>
      </div>
    );
  }

  const typingUsersInChat = typingUsers[currentChat.id] || [];
  const isTyping = typingUsersInChat.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="block md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        <div className="relative">
          <Avatar>
            <AvatarImage src={getChatAvatar() || undefined} />
            <AvatarFallback className="bg-wfc-purple-medium text-white">
              {getChatName().charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {isUserOnline() && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background"></span>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium">{getChatName()}</h3>
          {isTyping ? (
            <p className="text-xs text-wfc-purple animate-pulse">
              {typingUsersInChat.length === 1
                ? `${typingUsersInChat[0]} está escribiendo...`
                : 'Varias personas están escribiendo...'}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {isUserOnline() ? 'En línea' : 'Desconectado'}
            </p>
          )}
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {currentChat.messages && currentChat.messages
          .slice()
          .reverse()
          .map((msg) => {
            const isOwnMessage = msg.userId === currentUser?.id;
            
            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    isOwnMessage
                      ? 'bg-wfc-purple text-white rounded-br-none'
                      : 'bg-accent rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-xs opacity-70">
                      {formatMessageTime(msg.createdAt)}
                    </span>
                    {isOwnMessage && (
                      <span className="text-xs opacity-70">
                        {msg.read ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t p-3">
        <div className="flex gap-2">
          <Input
            placeholder="Escribe un mensaje"
            value={message}
            onChange={handleInputChange}
            className="flex-1"
            disabled={sendingMessage}
          />
          <Button 
            type="submit"
            size="icon"
            disabled={!message.trim() || sendingMessage}
            className="bg-wfc-purple hover:bg-wfc-purple-medium"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};
