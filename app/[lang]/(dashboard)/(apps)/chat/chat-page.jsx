"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import ContactList from "./contact-list";
import Blank from "./blank";
import ContactInfo from "./contact-info";
import MessageHeader from "./message-header";
import MessageFooter from "./message-footer";
import Messages from "./messages";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import MyProfileHeader from "./my-profile-header";
import EmptyMessage from "./empty-message";
import Loader from "./loader";
import { isObjectNotEmpty } from "@/lib/utils";
import SearchMessages from "./features/search-messages";
import Image from "next/image";

/* 
   IMPORTANTE:
   - Aquí mantenemos las llamadas de React Query solo para los contactos y el perfil,
     asumiendo que vienen de un endpoint propio.
   - Para los mensajes, usamos el hook de ChatContext.
*/
import { useQuery } from "@tanstack/react-query";
import { getContacts, getProfile } from "./chat-config";

/* 
   Nuestro hook que encapsula la lógica de chat con Firestore 
   (ya configurado en tu proyecto).
*/
import useChatHook from "@/store/useChatHook";

export const ChatPage = () => {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [showInfo, setShowInfo] = useState(true);

  // Estado para "respuestas" (reply)
  const [replay, setReply] = useState(false);
  const [replayData, setReplyData] = useState({});

  // Estado para búsqueda
  const [isOpenSearch, setIsOpenSearch] = useState(false);

  // Estado para mensajes fijados
  const [pinnedMessages, setPinnedMessages] = useState([]);

  // -----------------------------
  // Hooks y funciones del ChatContext
  // -----------------------------
  const {
    messages,            // Mensajes procesados
    loading,            // Loading del chat
    ensureActiveChat,   // Asegura que el chat exista o lo crea
    subscribeToChat,    // Suscribe a la subcolección de mensajes
    sendMessage,        // Envía un mensaje de texto
    sendDocument,       // Envía un archivo (opcional)
  } = useChatHook();

  // -----------------------------
  // React Query para contactos y perfil
  // -----------------------------
  const {
    isLoading: isContactsLoading,
    isError: isContactsError,
    data: contactsData,
  } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => getContacts(),
    keepPreviousData: true,
  });

  const {
    isLoading: isProfileLoading,
    isError: isProfileError,
    data: profileData,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: () => getProfile(),
    keepPreviousData: true,
  });

  // -----------------------------
  // Funciones de la UI
  // -----------------------------

  // Al abrir un chat (por ejemplo, al hacer clic en un contacto)
  const openChat = async (chatId, participants = []) => {
    try {
      setSelectedChatId(chatId);

      // 1. Aseguramos que el chat exista en Firestore y que el usuario actual esté autorizado
      //    participants debe ser un array con los UIDs del agente y paciente
      await ensureActiveChat(chatId, participants);

      // 2. Nos suscribimos a la colección "messages" de este chat
      //    (lo hacemos en un useEffect para limpiar la suscripción al desmontar)
    } catch (error) {
      console.error("Error al abrir el chat:", error);
    }
  };

  // Escuchar cambios de chatId para suscribirse en tiempo real
  useEffect(() => {
    if (!selectedChatId) return;
    const unsubscribe = subscribeToChat(selectedChatId);
    return () => {
      // Importante: desuscribimos al desmontar o cambiar de chat
      unsubscribe && unsubscribe();
    };
  }, [selectedChatId, subscribeToChat]);

  // Mostrar/ocultar el panel de información
  const handleShowInfo = () => {
    setShowInfo(!showInfo);
  };

  // Enviar mensaje de texto
  const handleSendMessage = async (message) => {
    if (!selectedChatId || !message) return;
    // Envía el texto usando la función del context
    await sendMessage(selectedChatId, message);
    setReply(false); // Reseteamos el estado de "reply" si lo deseas
  };

  // Manejar scroll automático al enviar/recibir mensajes
  const chatHeightRef = useRef(null);
  useEffect(() => {
    if (chatHeightRef.current) {
      chatHeightRef.current.scrollTo({
        top: chatHeightRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Manejar respuesta (reply) a un mensaje
  const handleReply = (data, contact) => {
    const newObj = {
      message: data,
      contact,
    };
    setReply(true);
    setReplyData(newObj);
  };

  // Búsqueda de mensajes
  const handleSetIsOpenSearch = () => {
    setIsOpenSearch(!isOpenSearch);
  };

  // Fijar mensajes (pin)
  const handlePinNote = (note) => {
    setPinnedMessages((prev) => [...prev, note]);
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="flex gap-5 app-height relative rtl:space-x-reverse">
      {/* Panel de contactos */}
      <div className="transition-all duration-150 flex-none lg:w-[260px]">
        <Card className="h-full pb-0">
          <CardHeader className="border-none pb-0 mb-0">
            <MyProfileHeader profile={profileData} />
          </CardHeader>
          <CardContent className="pt-0 px-0 h-[calc(100%-170px)]">
            <ScrollArea className="h-full">
              {isContactsLoading ? (
                <Loader />
              ) : isContactsError ? (
                <p>Error al cargar contactos</p>
              ) : (
                contactsData?.contacts?.map((contact) => (
                  <ContactList
                    key={contact.id}
                    contact={contact}
                    selectedChatId={selectedChatId}
                    // Aquí, por ejemplo, pasas un array con [agenteUID, contact.idPacienteUID] si lo tuvieras
                    // De momento, usamos [profileData?.id, contact.id] como ejemplo
                    openChat={() => openChat(contact.chat.id, [profileData?.id, contact.id])}
                  />
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Panel de chat principal */}
      {selectedChatId ? (
        <div className="flex-1">
          <div className="flex space-x-5 h-full rtl:space-x-reverse">
            {/* Mensajes */}
            <div className="flex-1">
              <Card className="h-full flex flex-col">
                <CardHeader className="flex-none mb-1">
                  <MessageHeader
                    showInfo={showInfo}
                    handleShowInfo={handleShowInfo}
                    profile={profileData}
                  />
                </CardHeader>

                {isOpenSearch && (
                  <SearchMessages
                    handleSetIsOpenSearch={handleSetIsOpenSearch}
                  />
                )}

                <CardContent className="px-0 relative flex-1 overflow-y-auto">
                  <div
                    className="h-full overflow-y-auto no-scrollbar"
                    ref={chatHeightRef}
                  >
                    {/* Loader de mensajes */}
                    {loading ? (
                      <Loader />
                    ) : messages.length === 0 ? (
                      <EmptyMessage />
                    ) : (
                      messages.map((message, i) => (
                        <Messages
                          key={`message-list-${i}`}
                          message={message}
                          // Ajusta 'contact' según tu lógica
                          contact={{ id: selectedChatId }}
                          profile={profileData}
                          // onDelete={...} // Podrías implementar delete en el contexto/hook
                          index={i}
                          selectedChatId={selectedChatId}
                          handleReply={handleReply}
                          replayData={replayData}
                          handlePinNote={handlePinNote}
                        />
                      ))
                    )}

                    {/* Mensajes fijados (pinned) */}
                    {pinnedMessages.length > 0 && (
                      <div className="mt-4 p-2 border-t border-gray-200">
                        {pinnedMessages?.map((msg, i) => (
                          <div key={i} className="text-xs text-default-700 my-2">
                            Has fijado un mensaje.{" "}
                            <Dialog>
                              <DialogTrigger asChild>
                                <span className="font-bold text-primary cursor-pointer">
                                  Ver todos
                                </span>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Mensajes fijados</DialogTitle>
                                  <DialogDescription>
                                    {pinnedMessages.map((pinnedMessage, index) => (
                                      <div key={index} className="flex items-center gap-2 my-2">
                                        {pinnedMessage.avatar && (
                                          <div className="h-10 w-10">
                                            <Image
                                              src={pinnedMessage.avatar}
                                              alt=""
                                              className="w-full h-full rounded-full object-cover"
                                            />
                                          </div>
                                        )}
                                        <p>{pinnedMessage.note}</p>
                                      </div>
                                    ))}
                                  </DialogDescription>
                                </DialogHeader>
                              </DialogContent>
                            </Dialog>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex-none flex-col px-0 py-0 pb-6">
                  <MessageFooter
                    handleSendMessage={handleSendMessage}
                    replay={replay}
                    setReply={setReply}
                    replayData={replayData}
                  />
                </CardFooter>
              </Card>
            </div>

            {/* Panel de información del contacto */}
            {showInfo && (
              <ContactInfo handleSetIsOpenSearch={handleSetIsOpenSearch} />
            )}
          </div>
        </div>
      ) : (
        <Blank />
      )}
    </div>
  );
};
