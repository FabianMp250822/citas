"use client";
import React from "react";
import moment from "moment";
import 'moment/locale/es'; // Configuramos el locale en español
import { Icon } from "@iconify/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Undo2 } from "lucide-react";
import { useChat } from "@/store/ChatContext";

// Configuramos moment para usar el locale en español
moment.locale('es');

/**
 * Función auxiliar que determina si una URL corresponde a una imagen.
 */
const isImageFile = (url) => {
  if (!url) return false;
  return /\.(jpg|jpeg|png|gif)$/i.test(url);
};

/**
 * formatTime: Función para formatear la marca de tiempo.
 * Si 'time' es un objeto Timestamp de Firebase se utiliza su método toDate(),
 * de lo contrario se asume que es una cadena con el formato esperado.
 */
const formatTime = (time) => {
  if (!time) return "";
  if (time.toDate) {
    return moment(time.toDate()).format("LLL");
  }
  // Si es una cadena, se intenta parsear con el formato dado (ajústalo si es necesario)
  const parsed = moment(time, "D [de] MMMM YYYY, h:mm:ss A [UTC]Z", true);
  return parsed.isValid() ? parsed.format("LLL") : time;
};

/**
 * Messages: Componente que muestra cada mensaje.
 * Muestra la hora de envío en la parte superior.
 * Si el mensaje incluye un archivo, muestra una vista previa si es imagen,
 * o un enlace de descarga para otros tipos de archivo.
 */
const Messages = ({
  message,
  contact,
  profile,
  handleReply,
  handleForward,
  handlePinMessage,
  pinnedMessages,
  replayData,
  selectedChatId,
}) => {
  const { handleDeleteMessage } = useChat();

  const {
    id: messageId,
    senderId,
    message: chatMessage,
    time,
    replayMetadata,
    documentUrl,
    fileName,
  } = message;

  // Placeholder para el avatar: se usa la primera letra del nombre o "U" por defecto
  const avatarPlaceholder = contact.name ? contact.name[0].toUpperCase() : "U";

  const isMessagePinned = pinnedMessages?.some(
    (pinnedMessage) => pinnedMessage.index === messageId
  );

  const handlePinMessageLocal = (note) => {
    handlePinMessage({
      note,
      avatar: avatarPlaceholder,
      index: messageId,
    });
  };

  return (
    <div className="block md:px-6 px-0">
      {/* Mostrar la hora de envío en la parte superior */}
      <span className="text-xs text-default-500 mb-1 block">
        {formatTime(time)}
      </span>
      {senderId === 11 ? (
        <>
          {replayMetadata && (
            <div className="w-max ml-auto -mb-2 mr-10">
              <div className="flex items-center gap-1 mb-1">
                <Undo2 className="w-4 h-4 text-default-600" />
                <span className="text-xs text-default-700">
                  You replied to{" "}
                  <span className="ml-1 text-default-800">
                    {replayData?.contact?.fullName}
                  </span>
                </span>
              </div>
              <p className="truncate text-sm bg-default-200 rounded-2xl px-3 py-2.5">
                {replayData?.message}
              </p>
            </div>
          )}
          <div className="flex space-x-2 items-start justify-end group w-full rtl:space-x-reverse mb-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <span className="w-7 h-7 rounded-full bg-default-200 flex items-center justify-center">
                        <Icon icon="bi:three-dots-vertical" className="text-lg" />
                      </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-20 p-0" align="center" side="top">
                      <DropdownMenuItem onClick={() => handleDeleteMessage(selectedChatId, messageId)}>
                        Delete
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleForward(chatMessage)}>
                        Forward
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="whitespace-pre-wrap break-all">
                  <div className="bg-primary/70 text-primary-foreground text-sm py-2 px-3 rounded-2xl flex-1">
                    {chatMessage}
                  </div>
                  {documentUrl && (
                    <div className="mt-2">
                      {isImageFile(documentUrl) ? (
                        <img
                          src={documentUrl}
                          alt="Attached image"
                          width={200}
                          height={200}
                          className="rounded"
                        />
                      ) : (
                        <a
                          href={documentUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-blue-600 text-sm"
                        >
                          {fileName || "Download file"}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {/* La hora ya se muestra arriba */}
            </div>
            <div className="flex-none self-end -translate-y-5">
              <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-xs text-white">
                {avatarPlaceholder}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex space-x-2 items-start group rtl:space-x-reverse mb-4">
          <div className="flex-none self-end -translate-y-5">
            <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-xs text-white">
              {avatarPlaceholder}
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <div className="whitespace-pre-wrap break-all relative z-[1]">
                  {isMessagePinned && (
                    <Icon
                      icon="ion:pin-sharp"
                      className="w-5 h-5 text-destructive absolute left-0 -top-3 z-[-1] transform -rotate-[30deg]"
                    />
                  )}
                  <div className="bg-default-200 text-sm py-2 px-3 rounded-2xl flex-1">
                    {chatMessage}
                  </div>
                  {documentUrl && (
                    <div className="mt-2">
                      {isImageFile(documentUrl) ? (
                        <img
                          src={documentUrl}
                          alt="Attached image"
                          width={200}
                          height={200}
                          className="rounded"
                        />
                      ) : (
                        <a
                          href={documentUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-blue-600 text-sm"
                        >
                          {fileName || "Download file"}
                        </a>
                      )}
                    </div>
                  )}
                </div>
                <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <span className="w-7 h-7 rounded-full bg-default-200 flex items-center justify-center">
                        <Icon icon="bi:three-dots-vertical" className="text-lg" />
                      </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-20 p-0" align="center" side="top">
                      <DropdownMenuItem onClick={() => handleDeleteMessage(selectedChatId, messageId)}>
                        Remove
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleReply(chatMessage, contact)}>
                        Reply
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePinMessageLocal(chatMessage)}>
                        {isMessagePinned ? "Unpin" : "Pin"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleForward(chatMessage)}>
                        Forward
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {/* La hora se muestra en la parte superior */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
