
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

interface UserType {
  id: string;
  name: string;
  photoURL: string;
  role: string;
}

interface UserSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  onUserSelect?: (userId: string) => void;
  excludeUsers?: string[];
  currentUserId?: string;
}

export const UserSelectDialog = ({
  open,
  onOpenChange,
  title = "Seleccionar usuario",
  onUserSelect,
  excludeUsers = [],
  currentUserId,
}: UserSelectDialogProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) fetchUsers();
    // eslint-disable-next-line
  }, [open]);

  async function fetchUsers() {
    setLoading(true);
    try {
      console.log("UserSelectDialog: Solicitando lista de usuarios");
      const response = await apiRequest('/users/all');
      console.log("UserSelectDialog: Respuesta de API:", response);
      
      if (response.success && Array.isArray(response.users)) {
        setUsers(response.users);
        console.log(`UserSelectDialog: Cargados ${response.users.length} usuarios`);
      } else {
        setUsers([]);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los usuarios"
        });
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      setUsers([]);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los usuarios"
      });
    } finally {
      setLoading(false);
    }
  }
  
  const filteredUsers = users.filter(user =>
    user.id !== currentUserId &&
    !excludeUsers.includes(user.id) &&
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectUser = (user: UserType) => {
    if (onUserSelect) {
      console.log("Seleccionando usuario:", user.name, user.id);
      onUserSelect(user.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Selecciona un usuario para iniciar una conversación
          </DialogDescription>
        </DialogHeader>
        <div className="relative mb-4">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <ScrollArea className="h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-wfc-purple" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {users.length > 0
                ? "No se encontraron usuarios con ese nombre"
                : "No hay usuarios disponibles"}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-2 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded-md"
                  onClick={() => handleSelectUser(user)}
                >
                  <Avatar>
                    <AvatarImage src={user.photoURL || ''} />
                    <AvatarFallback className="bg-wfc-purple-medium text-white">
                      {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.role}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
