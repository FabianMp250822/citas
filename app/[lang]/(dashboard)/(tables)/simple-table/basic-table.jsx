"use client";
import { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import useAgentsStore from "@/store/agentContext";


const columns = [
  { key: "agentName", label: "Nombre" },
  { key: "phone", label: "Teléfono" },
  { key: "email", label: "Correo" },
  { key: "city", label: "Ciudad" },
  { key: "sucursal", label: "Sucursal" },
  { key: "agentCode", label: "Código" },
  { key: "department", label: "Departamento" },
  { key: "actions", label: "Acciones" },
];

const BasicTable = () => {
  const { agents, fetchAgents, updateAgent, deleteAgent } = useAgentsStore();

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Función para editar: en este ejemplo se abre un modal o se redirige a una pantalla de edición.
  const handleEdit = (id) => {
    console.log("Editar agente:", id);
    // Aquí puedes implementar la lógica para abrir un modal de edición, por ejemplo:
    // openEditModal(id);
    toast({
      title: "Editar agente",
      description: "Funcionalidad de edición en desarrollo.",
    });
  };

  // Función para suspender el agente
  const handleSuspend = async (id) => {
    console.log("Suspender agente:", id);
    try {
      // Se actualiza el agente agregando la propiedad "suspended"
      await updateAgent(id, { suspended: true });
      toast({
        title: "Agente suspendido",
        description: `El agente ${id} fue suspendido exitosamente.`,
      });
    } catch (error) {
      console.error("Error al suspender agente:", error);
      toast({
        title: "Error",
        description: "No se pudo suspender el agente. Intente de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Función para eliminar el agente
  const handleDelete = async (id) => {
    console.log("Eliminar agente:", id);
    try {
      await deleteAgent(id);
      toast({
        title: "Agente eliminado",
        description: `El agente ${id} fue eliminado exitosamente.`,
      });
    } catch (error) {
      console.error("Error al eliminar agente:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el agente. Intente de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={`basic-table-${column.key}`}>
              {column.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {agents.map((agent) => (
          <TableRow key={agent.id}>
            <TableCell>{agent.agentName}</TableCell>
            <TableCell>{agent.phone}</TableCell>
            <TableCell>{agent.email}</TableCell>
            <TableCell>{agent.city}</TableCell>
            <TableCell>{agent.sucursal}</TableCell>
            <TableCell>{agent.agentCode}</TableCell>
            <TableCell>{agent.department}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button size="sm" onClick={() => handleEdit(agent.id)}>
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSuspend(agent.id)}
                >
                  Suspender
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(agent.id)}
                >
                  Eliminar
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default BasicTable;
