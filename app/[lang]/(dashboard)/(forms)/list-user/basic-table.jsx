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

  const handleToggleStatus = async (agent) => {
    try {
      const currentStatus = agent.status || "active";
      const newStatus = currentStatus === "active" ? "suspended" : "active";

      await updateAgent(agent.id, { status: newStatus });
      toast({
        title: newStatus === "suspended" ? "Agente suspendido" : "Agente activado",
        description: `El agente ${agent.agentName || "sin nombre"} fue ${
          newStatus === "suspended" ? "suspendido" : "activado"
        } exitosamente.`,
      });
    } catch (error) {
      console.error("Error al cambiar estado del agente:", error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del agente. Intente de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id) => {
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

  // Filtramos los agentes para no mostrar los que no tengan agentName o email
  const filteredAgents = agents.filter(
    (agent) => agent.agentName && agent.email
  );

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Listado de agentes</h2>
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
          {filteredAgents.map((agent) => (
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleStatus(agent)}
                  >
                    {agent.status === "suspended" ? "Activar" : "Suspender"}
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
    </>
  );
};

export default BasicTable;
