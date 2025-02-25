"use client";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { InputGroup, InputGroupText } from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { db } from "@/firebaseConfig";
import { updateDoc, doc } from "firebase/firestore";
import { useMediaQuery } from "@/hooks/use-media-query";
import useAuthenticationStore from "@/store/autenticationStore";

// Función para formatear los datos del agente.
// Se espera que el objeto 'user' tenga los campos: nombres, apellidos, photo, sucursal y status.
const formatearDatosAgente = (agente) => {
  const { apellidos, nombres, photo, sucursal, status } = agente;
  return {
    fullName: `${nombres || ""} ${apellidos || ""}`.trim(),
    avatar: photo,
    branch: sucursal,
    status: status || "active",
  };
};

// Mapeo de estados a clases de Tailwind para el badge (pequeño círculo)
const statusColorMap = {
  active: "bg-green-500",
  pending: "bg-orange-500",
  resolved: "bg-blue-500",
  inactive: "bg-red-500",
  cancelled: "bg-red-600",
};

const MyProfileHeader = ({ searchTerm, onSearchChange }) => {
  // Obtenemos datos del usuario autenticado
  const { user, loading } = useAuthenticationStore();

  if (loading) return <div>Cargando...</div>;
  if (!user) return <div>No se ha iniciado sesión</div>;

  // Formateamos los datos del agente (para mostrar en la UI)
  const agente = formatearDatosAgente(user);
  const [agentStatus, setAgentStatus] = useState(agente.status);

  // Función para actualizar el estado del agente en Firestore
  const updateAgentStatus = async (newStatus) => {
    setAgentStatus(newStatus);
    console.log(`Cambiando estado del agente a: ${newStatus}`);
    console.log("id del usuario:", user.uid);

    try {
      // Actualizar estado en la colección "agentes"
      // Usamos el uid del usuario autenticado como ID del documento
      const agenteRef = doc(db, "agentes", user.uid);

      // Si el documento NO existe y quieres crearlo, usa setDoc:
      // await setDoc(agenteRef, { status: newStatus }, { merge: true });
      // De lo contrario, si ya existe, updateDoc está bien:
      await updateDoc(agenteRef, { status: newStatus });
      console.log("Estado del agente actualizado en 'agentes'.");

      // Actualizar estado y agregar el campo "chatStatus" en la colección "agentCode"
      // Asegúrate de que 'AG79883' exista, o cámbialo por el ID correcto
      const agentCodeId = "AG79883";
      const agentCodeRef = doc(db, "agentCode", agentCodeId);
      await updateDoc(agentCodeRef, {
        status: newStatus,
        chatStatus: newStatus,
      });
      console.log("Estado y chatStatus actualizados en 'agentCode'.");
    } catch (error) {
      console.error("Error actualizando estado del agente:", error);
    }
  };

  const isLg = useMediaQuery("(max-width: 1024px)");

  return (
    <>
      <div className="flex justify-between mb-4">
        <div className="flex gap-3 items-center">
          <Avatar className="h-10 w-10">
            <AvatarImage src={agente.avatar} alt={agente.fullName} />
            <AvatarFallback>
              {agente.fullName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="block">
            <div className="flex items-center text-sm font-medium text-default-900">
              <span>{agente.fullName}</span>
              {/* Pequeño círculo indicador de estado */}
              <span className={`ml-2 h-2 w-2 rounded-full ${statusColorMap[agentStatus]}`}></span>
            </div>
            <span className="text-xs text-default-600">{agente.branch}</span>
          </div>
        </div>
        {/* En pantallas grandes se muestran las acciones junto con el selector de estado */}
        <div className="hidden lg:flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                color="secondary"
                size="icon"
                className="rounded-full"
              >
                <Icon icon="heroicons:ellipsis-horizontal-20-solid" className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[196px]" align="end" avoidCollisions>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Estado del Agente</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => updateAgentStatus("active")}
                className="focus:bg-primary/10 focus:text-primary"
              >
                En línea
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => updateAgentStatus("pending")}
                className="focus:bg-primary/10 focus:text-primary"
              >
                Ocupado
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => updateAgentStatus("resolved")}
                className="focus:bg-primary/10 focus:text-primary"
              >
                Resuelto
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => updateAgentStatus("inactive")}
                className="focus:bg-primary/10 focus:text-primary"
              >
                Desconectado
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => updateAgentStatus("cancelled")}
                className="focus:bg-primary/10 focus:text-primary"
              >
                Cancelado
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* En pantallas grandes se muestran las acciones */}
      <div className="hidden lg:flex flex-wrap justify-between py-4 border-b border-default-200">
        <InputGroup merged>
          <InputGroupText>
            <Icon icon="heroicons:magnifying-glass" />
          </InputGroupText>
          <Input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </InputGroup>
      </div>
    </>
  );
};

export default MyProfileHeader;
