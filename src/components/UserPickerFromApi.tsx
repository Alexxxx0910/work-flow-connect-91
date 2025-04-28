
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

export interface SimpleUser {
  id: string;
  name: string;
  photoURL?: string;
}

interface UserPickerProps {
  selectedUsers: SimpleUser[];
  onSelect: (user: SimpleUser) => void;
}

export const UserPickerFromApi = ({ selectedUsers, onSelect }: UserPickerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [loading, setLoading] = useState(false);
  const { token, currentUser } = useAuth();

  useEffect(() => {
    if (token) {
      loadUsers();
    }
  }, [token]);

  const loadUsers = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/users/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Filtrar al usuario actual y los usuarios ya seleccionados
        setUsers(response.data.users.filter((user: SimpleUser) => 
          user.id !== currentUser?.id &&
          !selectedUsers.some(selected => selected.id === user.id)
        ));
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedUsers.some(selected => selected.id === user.id)
  );

  return (
    <div>
      <Input
        placeholder="Buscar usuarios..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-2"
      />
      
      <div className="max-h-48 overflow-y-auto">
        {loading ? (
          <p className="text-center text-sm text-muted-foreground p-2">Cargando usuarios...</p>
        ) : filteredUsers.length > 0 ? (
          <div className="space-y-1">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                onClick={() => onSelect(user)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL} alt={user.name} />
                  <AvatarFallback className="bg-wfc-purple-medium text-white text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{user.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground p-2">
            {searchTerm ? "No se encontraron usuarios" : "No hay usuarios disponibles"}
          </p>
        )}
      </div>
    </div>
  );
};
