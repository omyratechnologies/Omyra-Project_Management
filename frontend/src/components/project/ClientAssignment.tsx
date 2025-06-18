import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { apiClient, Project, Client } from '@/lib/api';
import { Building, X, Users } from 'lucide-react';

interface ClientAssignmentProps {
  project: Project;
  onUpdate: (updatedProject: Project) => void;
  onClose?: () => void;
}

export const ClientAssignment: React.FC<ClientAssignmentProps> = ({ project, onUpdate, onClose }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getClients({ status: 'active' });
      setClients(response.clients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClient = async () => {
    if (!selectedClientId) return;

    try {
      setAssigning(true);
      const updatedProject = await apiClient.assignClientToProject(project._id, selectedClientId);
      onUpdate(updatedProject);
      setSelectedClientId('');
    } catch (error) {
      console.error('Error assigning client:', error);
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveClient = async () => {
    try {
      setAssigning(true);
      const updatedProject = await apiClient.removeClientFromProject(project._id);
      onUpdate(updatedProject);
    } catch (error) {
      console.error('Error removing client:', error);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Building className="w-5 h-5" />
          Client Assignment
        </h3>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Current Client */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Current Client</label>
            {project.client ? (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-2">
                  <Building className="w-3 h-3" />
                  {typeof project.client === 'string' ? project.client : project.client?.companyName || 'Unknown Client'}
                </Badge>
                {project.client && typeof project.client === 'object' && project.client.contactPerson && (
                  <span className="text-sm text-gray-600">
                    {project.client.contactPerson.name} ({project.client.contactPerson.email})
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-500">
                <Users className="w-4 h-4" />
                <span className="text-sm">No client assigned</span>
              </div>
            )}
          </div>
          {project.client && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveClient}
              disabled={assigning}
              className="text-red-600 hover:text-red-700"
            >
              {assigning ? 'Removing...' : 'Remove'}
            </Button>
          )}
        </div>
      </div>

      {/* Assign New Client */}
      <div className="border rounded-lg p-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          {project.client ? 'Change Client' : 'Assign Client'}
        </label>
        <div className="flex gap-2">
          <Select
            value={selectedClientId}
            onValueChange={setSelectedClientId}
            disabled={loading}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={loading ? "Loading clients..." : "Select a client"} />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client._id} value={client._id}>
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{client.companyName}</span>
                    {client.contactPerson && (
                      <span className="text-sm text-gray-500 ml-2">
                        {client.contactPerson.name}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAssignClient}
            disabled={!selectedClientId || assigning}
          >
            {assigning ? 'Assigning...' : 'Assign'}
          </Button>
        </div>
        {!loading && clients.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            No active clients available. Create clients first to assign them to projects.
          </p>
        )}
      </div>
    </div>
  );
};

export default ClientAssignment;
