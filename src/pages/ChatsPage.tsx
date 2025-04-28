
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ChatGroupForm } from "@/components/ChatGroupForm";
import { ChatList } from "@/components/Chat/ChatList";
import { ChatWindow } from "@/components/Chat/ChatWindow";
import { UserPicker } from "@/components/UserPicker";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { Plus, Users, MessageSquare } from "lucide-react";

const ChatsPage = () => {
  const { isLoggedIn } = useAuth();
  const { currentChat } = useChat();
  const [showMobileChatList, setShowMobileChatList] = useState(true);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);

  // Detectar si estamos en móvil
  const isMobile = window.innerWidth < 768;

  // Cuando se selecciona un chat en móvil, mostrar la ventana de chat
  useEffect(() => {
    if (currentChat && isMobile) {
      setShowMobileChatList(false);
    }
  }, [currentChat, isMobile]);

  // Manejar el botón de regreso en móvil
  const handleBackToList = () => {
    setShowMobileChatList(true);
  };

  // Mostrar contenido principal basado en autenticación
  const renderContent = () => {
    if (!isLoggedIn) {
      return (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center p-4">
          <MessageSquare className="h-16 w-16 text-wfc-purple mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Mensajes de WorkFlowConnect</h2>
          <p className="text-muted-foreground mb-6">
            Inicia sesión para ver tus conversaciones y contactar con otros profesionales
          </p>
          <Button className="bg-wfc-purple hover:bg-wfc-purple-medium">Iniciar Sesión</Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col md:flex-row h-[calc(100vh-7rem)] rounded-lg overflow-hidden border">
        {/* Lista de chats (visible en desktop o cuando showMobileChatList es true) */}
        {(showMobileChatList || !isMobile) && (
          <div className="w-full md:w-1/3 border-r flex flex-col">
            <div className="p-3 border-b flex items-center justify-between">
              <h2 className="font-medium">Mensajes</h2>
              <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-wfc-purple hover:text-wfc-purple-medium">
                    <Plus className="h-5 w-5" />
                    <span className="ml-1">Nuevo mensaje</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogTitle>Nuevo mensaje</DialogTitle>
                  <Separator className="my-2" />
                  <div className="flex flex-col space-y-4 py-2">
                    <UserPicker
                      onUserSelect={(user) => {
                        setShowNewChatDialog(false);
                        if (isMobile) setShowMobileChatList(false);
                      }}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <ChatList />
          </div>
        )}

        {/* Ventana de chat (visible en desktop o cuando showMobileChatList es false) */}
        {(!showMobileChatList || !isMobile) && (
          <div className="flex-1 md:w-2/3">
            <ChatWindow onBack={isMobile ? handleBackToList : undefined} />
          </div>
        )}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Mensajes</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Users className="h-4 w-4" />
                <span>Crear grupo</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Crear chat grupal</DialogTitle>
              <Separator className="my-2" />
              <ChatGroupForm onClose={() => {}} />
            </DialogContent>
          </Dialog>
        </div>
        {renderContent()}
      </div>
    </MainLayout>
  );
};

export default ChatsPage;
