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
import usePacientesStore from "@/store/usePacientesStore";

const columns = [
  { key: "nombres", label: "Nombres" },
  { key: "apellidos", label: "Apellidos" },
  { key: "telefono", label: "Teléfono" },
  { key: "email", label: "Correo" },
  { key: "direccion", label: "Dirección" },
  { key: "identificacion", label: "Identificación" },
  { key: "lugarSolicitud", label: "Lugar Solicitud" },
  { key: "photo", label: "Foto" },
  { key: "estado", label: "Estado" },
  { key: "actions", label: "Acciones" },
];

const BasicTable = () => {
  const { pacientes, fetchPacientes, updatePaciente, deletePaciente } = usePacientesStore();

  useEffect(() => {
    fetchPacientes();
  }, [fetchPacientes]);

  const handleToggleEstado = async (paciente) => {
    try {
      // Se alterna entre "cancelada" y "activa"
      const currentEstado = paciente.estado || "activa";
      const newEstado = currentEstado === "cancelada" ? "activa" : "cancelada";
      await updatePaciente(paciente.id, { estado: newEstado });
      toast({
        title: newEstado === "cancelada" ? "Paciente cancelado" : "Paciente activado",
        description: `El estado del paciente ${paciente.nombres || "sin nombre"} se actualizó a ${newEstado}.`,
      });
    } catch (error) {
      console.error("Error al cambiar estado del paciente:", error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del paciente. Intente de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePaciente(id);
      toast({
        title: "Paciente eliminado",
        description: `El paciente ${id} fue eliminado exitosamente.`,
      });
    } catch (error) {
      console.error("Error al eliminar paciente:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el paciente. Intente de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Opcional: filtrar los pacientes que tengan información básica (por ejemplo, nombres y email)
  const filteredPacientes = pacientes.filter(
    (paciente) => paciente.nombres && paciente.email
  );

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Listado de Pacientes</h2>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={`pacientes-table-${column.key}`}>
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPacientes.map((paciente) => (
            <TableRow key={paciente.id}>
              <TableCell>{paciente.nombres}</TableCell>
              <TableCell>{paciente.apellidos}</TableCell>
              <TableCell>{paciente.telefono}</TableCell>
              <TableCell>{paciente.email}</TableCell>
              <TableCell>{paciente.direccion}</TableCell>
              <TableCell>{paciente.identificacion}</TableCell>
              <TableCell>{paciente.lugarSolicitud}</TableCell>
              <TableCell>
                <img
                  src={paciente.photo}
                  alt={paciente.nombres}
                  className="w-10 h-10 rounded-full"
                />
              </TableCell>
              <TableCell>{paciente.estado}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleEstado(paciente)}
                  >
                    {paciente.estado === "cancelada" ? "Retomar" : "Cancelar"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(paciente.id)}
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
