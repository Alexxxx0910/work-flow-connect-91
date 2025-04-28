
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ChatList } from '@/components/Chat/ChatList';
import { ChatWindow } from '@/components/Chat/ChatWindow';
import { Plus } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { ChatGroupForm } from '@/components/ChatGroupForm';
import { useIsMobile } from '@/hooks/use-mobile';

const ChatsPage = () => {
  const { currentChat } = useChat();
  const isMobile = useIsMobile();
  const [showChatList, setShowChatList] = useState(true);
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);

  // En dispositivos móviles, mostrar solo la lista de chats o la ventana de chat actual
  useEffect(() => {
    if (isMobile) {
      setShowChatList(!currentChat);
    } else {
      setShowChatList(true);
    }
  }, [currentChat, isMobile]);

  const handleBackToList = () => {
    setShowChatList(true);
  };

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Mensajes</h1>
        <Dialog open={newChatDialogOpen} onOpenChange={setNewChatDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-wfc-purple hover:bg-wfc-purple-medium">
              <Plus className="h-4 w-4 mr-2" /> Nuevo mensaje
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear nuevo mensaje</DialogTitle>
            </DialogHeader>
            <ChatGroupForm onClose={() => setNewChatDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden border rounded-lg">
        {/* Lista de chats (visible siempre en desktop, toggleable en móvil) */}
        {showChatList && (
          <div className={`${isMobile ? 'w-full' : 'w-1/3 border-r'} h-full`}>
            <ChatList />
          </div>
        )}
        
        {/* Ventana de chat (visible siempre en desktop, toggleable en móvil) */}
        {(!isMobile || !showChatList) && (
          <div className={`${isMobile ? 'w-full' : 'w-2/3'} h-full`}>
            <ChatWindow onBack={isMobile ? handleBackToList : undefined} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsPage;
