
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Plus } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';

export type SimpleUser = {
  id: string;
  name: string;
  photoURL?: string;
};

type UserPickerFromApiProps = {
  selectedUsers: SimpleUser[];
  onSelect: (user: SimpleUser) => void;
};

export const UserPickerFromApi = ({ selectedUsers, onSelect }: UserPickerFromApiProps) => {
  const { users } = useData();
  const { currentUser } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [availableUsers, setAvailableUsers] = useState<SimpleUser[]>([]);

  useEffect(() => {
    // Filtrar usuarios ya seleccionados y el usuario actual
    const filteredUsers = users.filter(user => 
      !selectedUsers.some(selected => selected.id === user.id) && 
      (!currentUser || user.id !== currentUser.id)
    );
    
    if (!searchTerm) {
      setAvailableUsers(filteredUsers);
      return;
    }

    const filtered = filteredUsers.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setAvailableUsers(filtered);
  }, [searchTerm, users, selectedUsers, currentUser]);

  return (
    <div className="space-y-2">
      <Label htmlFor="user-search">Añadir participantes</Label>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          id="user-search"
          placeholder="Buscar usuarios"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      
      {availableUsers.length > 0 ? (
        <div className="max-h-[200px] overflow-y-auto border rounded-md">
          {availableUsers.map(user => (
            <div
              key={user.id}
              onClick={() => onSelect(user)}
              className="flex items-center justify-between p-2 hover:bg-accent cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.photoURL} alt={user.name} />
                  <AvatarFallback className="bg-wfc-purple-medium text-white text-xs">
                    {user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{user.name}</span>
              </div>
              <Plus className="h-4 w-4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="border rounded-md p-3 text-center text-muted-foreground text-sm">
          {searchTerm ? "No se encontraron usuarios" : "No hay más usuarios disponibles"}
        </div>
      )}
    </div>
  );
};
