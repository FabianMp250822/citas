"use client";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ContactList = ({ contact, openChat, selectedChatId }) => {
  // Desestructuramos las propiedades del paciente, incluyendo "estado"
  const {
    id,
    nombres,
    apellidos,
    photo,
    email,
    telefono,
    lugarSolicitud,
    estado // <-- Campo con el estado del paciente en Firestore
  } = contact;

  const fullName = `${nombres} ${apellidos}`;

  // Opcional: Mapeo de estado a color del Badge
  const statusColorMap = {
    activo: "success",       // verde
    inactivo: "destructive", // rojo
    pendiente: "warning",    // naranja
    programada: "primary",   // azul
    finalizada: "muted",     // gris
    cancelada: "destructive" // rojo
  };

  // Determinamos el color según el estado
  const badgeColor = statusColorMap[estado] || "secondary";

  return (
    <div
      className={cn(
        "gap-4 py-2 lg:py-2.5 px-3 border-l-2 border-transparent hover:bg-default-200 cursor-pointer flex",
        {
          "lg:border-primary/70 lg:bg-default-200": id === selectedChatId,
        }
      )}
      onClick={() => openChat(id)}
    >
      <div className="flex-1 flex gap-3">
        <div className="relative inline-block">
          <Avatar>
            <AvatarImage src={photo} alt={fullName} />
            <AvatarFallback className="uppercase">
              {fullName.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="block">
          <div className="truncate max-w-[120px]">
            <span className="text-sm text-default-900 font-medium">
              {fullName}
            </span>
          </div>
          <div className="truncate max-w-[120px]">
            <span className="text-xs text-default-600">
              {email}
            </span>
          </div>
        </div>
      </div>

      {/* Sección derecha (teléfono, lugar, estado) */}
      <div className="flex-none flex-col items-end gap-2 hidden lg:flex">
        <span className="text-xs text-default-600 text-end uppercase">
          {telefono}
        </span>
        <span className="text-[10px] font-medium text-default-600">
          {lugarSolicitud}
        </span>

        {/* Mostramos el estado con un Badge de color distinto según el mapeo */}
        {estado && (
          <Badge color={badgeColor} className="text-[10px] font-medium uppercase">
            {estado}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default ContactList;
