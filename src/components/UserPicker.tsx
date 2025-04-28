
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Loader2 } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

type User = {
  id: string;
  name: string;
  photoURL?: string;
  isOnline?: boolean;
};

type UserPickerProps = {
  onUserSelect: (user: User) => void;
};

export const UserPicker = ({ onUserSelect }: UserPickerProps) => {
  const { users } = useData();
  const { createChat } = useChat();
  const { currentUser, isLoggedIn } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    // Filtrar usuarios que no son el usuario actual
    const usersWithoutCurrent = users.filter(user => 
      currentUser ? user.id !== currentUser.id : true
    );
    
    if (!searchTerm) {
      setFilteredUsers(usersWithoutCurrent);
      return;
    }

    const filtered = usersWithoutCurrent.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredUsers(filtered);
  }, [searchTerm, users, currentUser]);

  const handleSelectUser = async (user: User) => {
    if (!isLoggedIn) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para crear un chat",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await createChat([user.id]);
      
      toast({
        title: "Chat creado",
        description: "Se ha iniciado la conversación correctamente"
      });
      
      onUserSelect(user);
    } catch (error) {
      console.error("Error al crear chat:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el chat. Inténtalo de nuevo."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="search-user">Buscar usuario</Label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search-user"
            placeholder="Buscar por nombre de usuario"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Usuarios disponibles</Label>
        <div className="max-h-[300px] overflow-y-auto space-y-2 rounded-md border p-1">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                onClick={() => !isLoading && handleSelectUser(user)}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL} alt={user.name} />
                    <AvatarFallback className="bg-wfc-purple-medium text-white">
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                </div>
                <Button 
                  size="sm"
                  variant="ghost"
                  disabled={isLoading}
                  className="text-wfc-purple hover:text-wfc-purple-medium"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Chat"}
                </Button>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              No se encontraron usuarios
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
