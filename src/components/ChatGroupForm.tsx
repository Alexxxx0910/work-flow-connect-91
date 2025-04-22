
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useChat } from '@/contexts/ChatContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { UserPickerFromApi, SimpleUser } from './UserPickerFromApi';

export const ChatGroupForm = ({ onClose }: { onClose: () => void }) => {
  const { createChat } = useChat();
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<SimpleUser[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleSelectUser = (user: SimpleUser) => {
    setSelectedUsers((prev) => [...prev, user]);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleCreateGroup = async () => {
    if (selectedUsers.length < 1) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes seleccionar al menos un usuario para el chat",
      });
      return;
    }
    
    setIsCreating(true);
    try {
      const participantIds = selectedUsers.map((u) => u.id);
      console.log("Creando chat grupal con:", { participantIds, groupName });
      await createChat(participantIds, groupName || undefined);
      
      toast({
        title: "Chat creado",
        description: "Se ha creado el chat grupal correctamente"
      });
      onClose();
    } catch (error) {
      console.error("Error al crear chat grupal:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el chat grupal. Inténtalo de nuevo."
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <Label htmlFor="group-name">Nombre del grupo (opcional)</Label>
        <Input
          id="group-name"
          placeholder="Nombre del grupo"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="mt-1"
        />
      </div>
      {selectedUsers.length > 0 && (
        <div>
          <Label>Participantes seleccionados</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedUsers.map((user) => (
              <div 
                key={user.id}
                className="flex items-center bg-wfc-purple/10 text-wfc-purple rounded-full pl-1 pr-2 py-1 text-sm"
              >
                <Avatar className="h-5 w-5 mr-1">
                  <AvatarImage src={user.photoURL} alt={user.name} />
                  <AvatarFallback className="text-[10px] bg-wfc-purple-medium text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {user.name}
                <button
                  onClick={() => handleRemoveUser(user.id)}
                  className="ml-1 text-wfc-purple hover:text-wfc-purple-medium"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <UserPickerFromApi
        selectedUsers={selectedUsers}
        onSelect={handleSelectUser}
      />

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose} disabled={isCreating}>Cancelar</Button>
        <Button
          onClick={handleCreateGroup}
          className="bg-wfc-purple hover:bg-wfc-purple-medium"
          disabled={isCreating}
        >
          {isCreating ? "Creando..." : "Crear Chat"}
        </Button>
      </div>
    </div>
  );
};
