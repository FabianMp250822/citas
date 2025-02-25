"use client";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Menu } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";

const MessageHeader = ({
  showInfo,
  handleShowInfo,
  profile,              // Datos del paciente seleccionado
  mblChatHandler,
  patientStatus,        // Estado actual del paciente (e.g.: "activo", "inactivo", "pendiente", etc.)
  onPatientStatusChange // Función para cambiar el estado
}) => {
  // Construir el nombre completo del paciente
  const fullName = profile ? `${profile.nombres} ${profile.apellidos}` : "Desconocido";

  // Mapeo de estados a colores para el badge
  const statusColorMap = {
    activo: "success",       // verde
    inactivo: "destructive", // rojo
    pendiente: "warning",    // naranja
    programada: "primary",   // azul
    finalizada: "muted",     // gris
    cancelada: "destructive" // rojo
  };

  // Selecciona el color según el estado; si no coincide, usa "secondary"
  const badgeColor = statusColorMap[patientStatus] || "secondary";

  const isLg = useMediaQuery("(max-width: 1024px)");

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {isLg && (
          <Menu
            className="h-5 w-5 cursor-pointer text-default-600"
            onClick={mblChatHandler}
          />
        )}
        <div className="relative inline-block">
          <Avatar>
            <AvatarImage src={profile?.photo} alt={fullName} />
            <AvatarFallback>{fullName.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <Badge
            className="h-3 w-3 p-0 ring-1 ring-border ring-offset-[1px] absolute left-[calc(100%-12px)] top-[calc(100%-12px)]"
            color={badgeColor}
          />
        </div>
        <div className="hidden lg:block">
          <div className="text-sm font-medium text-default-900">
            <span className="relative">{fullName}</span>
          </div>
          <span className="text-xs text-default-500">
            {patientStatus.charAt(0).toUpperCase() + patientStatus.slice(1)}
          </span>
        </div>
      </div>
      {/* Selector de estado del paciente (ubicado en el header) */}
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <select
          id="patientStatus"
          value={patientStatus}
          onChange={onPatientStatusChange}
          className="p-1 border rounded text-sm"
        >
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="pendiente">Pendiente</option>
          <option value="programada">Cita Programada</option>
          <option value="finalizada">Cita Finalizada</option>
          <option value="cancelada">Cita Cancelada</option>
        </select>
        {/* Botones de acciones (llamada, video, info) */}
        {/* <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                className="bg-transparent rounded-full hover:bg-default-50"
              >
                <span className="text-xl text-primary">
                  <Icon icon="solar:phone-linear" />
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="end">
              <p>Start a voice call</p>
              <TooltipArrow className="fill-primary" />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider> */}
        {/* <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                className="bg-transparent rounded-full hover:bg-default-50"
              >
                <span className="text-xl text-primary">
                  <Icon icon="mdi:video-outline" />
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="end">
              <p>Start a video call</p>
              <TooltipArrow className="fill-primary" />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                className={cn("bg-transparent hover:bg-default-50 rounded-full", {
                  "text-primary": !showInfo,
                })}
                onClick={handleShowInfo}
              >
                <span className="text-xl text-primary">
                  {showInfo ? (
                    <Icon icon="material-symbols:info" />
                  ) : (
                    <Icon icon="material-symbols:info-outline" />
                  )}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="end">
              <p>Conversation information</p>
              <TooltipArrow className="fill-primary" />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider> */}
      </div>
    </div>
  );
};

export default MessageHeader;
