
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, User } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

export type SimpleUser = {
  id: string;
  name: string;
  photoURL: string;
  role: string;
};

interface UserPickerFromApiProps {
  excludeIds?: string[];
  onSelect: (user: SimpleUser) => void;
  selectedUsers: SimpleUser[];
  label?: string;
}

export const UserPickerFromApi: React.FC<UserPickerFromApiProps> = ({
  excludeIds = [],
  onSelect,
  selectedUsers,
  label = "Selecciona usuarios"
}) => {
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const response = await apiRequest('/users/all');
        if (response.success && Array.isArray(response.users)) {
          setUsers(response.users);
        } else {
          toast({
            variant: "destructive",
            title: "Error cargando usuarios",
            description: "No se pudieron cargar los usuarios desde la base de datos.",
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo comunicar con el backend."
        });
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      !excludeIds.includes(user.id) &&
      !selectedUsers.some((sel) => sel.id === user.id) &&
      user.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <label className="block font-semibold">{label}</label>
      <div className="relative mt-1 mb-2">
        <Input
          placeholder="Buscar usuario por nombre..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="pl-7"
        />
        <User className="absolute left-2 top-2.5 text-gray-400 h-4 w-4 pointer-events-none" />
      </div>
      <ScrollArea className="max-h-56">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="animate-spin h-6 w-6 text-wfc-purple" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-2 text-gray-500 text-sm">No se encontraron usuarios</div>
        ) : (
          <ul>
            {filteredUsers.map(user => (
              <li key={user.id}>
                <button
                  type="button"
                  className="flex items-center w-full px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
                  onClick={() => onSelect(user)}
                >
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={user.photoURL || ''} />
                    <AvatarFallback className="bg-wfc-purple-medium text-white">{user.name[0]?.toUpperCase() || "?"}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{user.name}</span>
                  <span className="ml-auto text-xs text-gray-500">{user.role}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
};
