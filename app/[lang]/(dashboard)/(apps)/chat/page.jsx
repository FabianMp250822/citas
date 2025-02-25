"use client";
import React, { useEffect, useState, useRef } from "react";
import moment from "moment";
import "moment/locale/es"; // Configuramos moment en español
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Blank from "./blank";
import MessageHeader from "./message-header";
import MessageFooter from "./message-footer";
import Messages from "./messages";
import MyProfileHeader from "./my-profile-header";
import EmptyMessage from "./empty-message";
import Loader from "./loader";
import { cn } from "@/lib/utils";
import SearchMessages from "./contact-info/search-messages";
import PinnedMessages from "./pin-messages";
import ForwardMessage from "./forward-message";
import ContactInfo from "./contact-info";
import { useMediaQuery } from "@/hooks/use-media-query";
import usePatientsStore from "@/store/pacientesStore"; // Store de pacientes (Zustand)
import { useChat } from "@/store/ChatContext";        // Nuestro ChatContext
import ContactList from "./contact-list";
import { usePredefinedMessages } from "@/hooks/usePredefinedMessages"; // Hook para mensajes predefinidos (si lo usas)

moment.locale("es");

const ChatPage = () => {
  // Estados de UI
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [showContactSidebar, setShowContactSidebar] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [replay, setReply] = useState(false);
  const [replayData, setReplyData] = useState({});
  const [isOpenSearch, setIsOpenSearch] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [isForward, setIsForward] = useState(false);

  // Estado para el status del paciente (puede ser "activo", "inactivo", etc.)
  const [patientStatus, setPatientStatus] = useState("activo");

  // Estado para el texto de búsqueda
  const [searchTerm, setSearchTerm] = useState("");

  // Del store de pacientes
  const { patients, loading, fetchPatients } = usePatientsStore();

  // Del ChatContext
  const {
    user,
    messages,
    subLoading,
    subscribeToChat,
    handleSendMessage,
    handleDeleteMessage,
  } = useChat();

  // Mensajes predefinidos
  const { messages: predefinedMessages, loading: predefinedLoading } = usePredefinedMessages();

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Suscribirse al chat cuando cambia selectedChatId
  useEffect(() => {
    if (!selectedChatId) return;
    console.log("Suscribiéndose al chat con ID:", selectedChatId);
    const unsubscribe = subscribeToChat(selectedChatId);
    return () => {
      console.log("Desuscribiéndose del chat con ID:", selectedChatId);
      if (unsubscribe) unsubscribe();
    };
  }, [selectedChatId, subscribeToChat]);

  // Scroll automático al final cuando llegan mensajes
  const chatHeightRef = useRef(null);
  useEffect(() => {
    if (chatHeightRef.current) {
      chatHeightRef.current.scrollTo({
        top: chatHeightRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Lógica de bienvenida (opcional)
  useEffect(() => {
    if (selectedChatId && messages.length === 0 && !predefinedLoading) {
      if (patientStatus !== "activo") {
        console.log("Paciente no activo, no se envía mensaje de bienvenida.");
        return;
      }
      if (predefinedMessages?.firstmessage) {
        handleSendMessage(selectedChatId, predefinedMessages.firstmessage);
      }
    }
  }, [
    selectedChatId,
    messages,
    patientStatus,
    predefinedLoading,
    predefinedMessages,
    handleSendMessage
  ]);

  // (Opcional) Lógica de inactividad
  useEffect(() => {
    if (!selectedChatId || messages.length === 0) return;
    const lastPatientMsg = [...messages].reverse().find(
      (msg) => msg.senderId === selectedChatId
    );
    if (!lastPatientMsg || !lastPatientMsg.timestamp) return;

    const lastMsgTime = lastPatientMsg.timestamp.toDate
      ? lastPatientMsg.timestamp.toDate()
      : new Date(lastPatientMsg.timestamp);

    const diffMinutes = moment().diff(moment(lastMsgTime), "minutes");
    if (diffMinutes >= 15 && patientStatus === "activo") {
      console.log("Paciente inactivo tras 15 minutos sin escribir.");
      setPatientStatus("inactivo");
      // Aquí podrías actualizar en Firestore si lo deseas
    } else if (diffMinutes < 15 && patientStatus === "inactivo") {
      console.log("Paciente vuelve a escribir, lo ponemos 'activo'.");
      setPatientStatus("activo");
      // También podrías actualizar en Firestore
    }
  }, [messages, selectedChatId, patientStatus]);

  // Función para abrir un chat al hacer clic en un contacto
  const openChat = (chatId) => {
    console.log("openChat llamado con chatId:", chatId);
    if (chatId === selectedChatId) {
      console.log("El chat ya está abierto, no hacemos nada.");
      return;
    }
    setSelectedChatId(chatId);
    setReply(false);
    if (showContactSidebar) {
      setShowContactSidebar(false);
    }
  };

  // Lógica para eliminar mensajes
  const onDelete = (chatId, messageId) => {
    console.log("Eliminando mensaje con id:", messageId, "del chat:", chatId);
    handleDeleteMessage(chatId, messageId);
    setPinnedMessages((prev) => prev.filter((p) => p.index !== messageId));
  };

  // Lógica para "reply"
  const handleReply = (data, contact) => {
    setReply(true);
    setReplyData({ message: data, contact });
  };

  // Función para enviar mensaje
  const handleSendMsg = (messageContent, file = null) => {
    if (!selectedChatId || !messageContent) return;
    console.log("Enviando mensaje desde ChatPage, replayData:", replayData);
    handleSendMessage(selectedChatId, messageContent, file);
    setReply(false);
  };

  // Lógica para "pin"
  const handlePinMessage = (note) => {
    const updatedPinnedMessages = [...pinnedMessages];
    const existingIndex = updatedPinnedMessages.findIndex(
      (msg) => msg.note === note.note
    );
    if (existingIndex !== -1) {
      updatedPinnedMessages.splice(existingIndex, 1);
    } else {
      updatedPinnedMessages.push(note);
    }
    setPinnedMessages(updatedPinnedMessages);
  };
  const handleUnpinMessage = (pinnedMessage) => {
    const updated = pinnedMessages.filter((p) => p.note !== pinnedMessage.note);
    setPinnedMessages(updated);
  };

  // Lógica para "forward"
  const handleForward = () => {
    setIsForward(!isForward);
  };

  // Lógica para "search"
  const handleSetIsOpenSearch = () => {
    setIsOpenSearch(!isOpenSearch);
  };

  // Lógica para "info" lateral
  const handleShowInfo = () => {
    setShowInfo(!showInfo);
  };

  // Función para que el agente cambie manualmente el estado del paciente
  const handlePatientStatusChange = (e) => {
    const newStatus = e.target.value;
    console.log(`Cambiando estado del paciente a: ${newStatus}`);
    setPatientStatus(newStatus);
    // Si deseas actualizarlo en Firestore, lo harías aquí
  };

  // ---- LÓGICA DE FILTRO ----
  // Filtramos los pacientes según el 'searchTerm'. 
  // Filtramos por 'nombres' + 'apellidos' (o cualquier campo que necesites).
  const filteredPatients = patients.filter((p) => {
    const fullName = `${p.nombres} ${p.apellidos}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const isLg = useMediaQuery("(max-width: 1024px)");

  return (
    <div className="flex gap-5 app-height relative rtl:space-x-reverse">
      {/* Sidebar de contactos (lista de pacientes) */}
      <div
        className={cn("transition-all duration-150 flex-none", {
          "absolute h-full top-0 md:w-[260px] w-[200px] z-[999]": isLg,
          "flex-none min-w-[260px]": !isLg,
          "left-0": isLg && showContactSidebar,
          "-left-full": isLg && !showContactSidebar,
        })}
      >
        <Card className="h-full pb-0">
          <CardHeader className="border-none pb-0 mb-0">
            {/* 
              Pasamos la función setSearchTerm a MyProfileHeader
              para que el usuario escriba y se actualice 'searchTerm' 
            */}
            <MyProfileHeader 
              profile={user}
              searchTerm={searchTerm}
              onSearchChange={(value) => setSearchTerm(value)}
            />
          </CardHeader>

          <CardContent className="pt-0 px-0 lg:h-[calc(100%-170px)] h-[calc(100%-70px)]">
            <ScrollArea className="h-full">
              {loading ? (
                <Loader />
              ) : (
                // Aquí usamos 'filteredPatients' en lugar de 'patients'
                filteredPatients.map((patient) => (
                  <ContactList
                    key={patient.id}
                    contact={patient}
                    selectedChatId={selectedChatId}
                    openChat={openChat}
                  />
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Área principal del chat */}
      {selectedChatId ? (
        <div className="flex-1">
          <div className="flex space-x-5 h-full rtl:space-x-reverse">
            <div className="flex-1">
              <Card className="h-full flex flex-col">
                {/* Encabezado del chat: datos del paciente + selector de estado */}
                <CardHeader className="flex-none mb-0">
                  <MessageHeader
                    showInfo={showInfo}
                    handleShowInfo={handleShowInfo}
                    profile={patients.find((p) => p.id === selectedChatId)}
                    mblChatHandler={() => setShowContactSidebar(!showContactSidebar)}
                    patientStatus={patientStatus}
                    onPatientStatusChange={handlePatientStatusChange}
                  />
                </CardHeader>

                {isOpenSearch && (
                  <SearchMessages handleSetIsOpenSearch={handleSetIsOpenSearch} />
                )}

                <CardContent className="!p-0 relative flex-1 overflow-y-auto">
                  <div className="h-full py-4 overflow-y-auto no-scrollbar" ref={chatHeightRef}>
                    {subLoading ? (
                      <Loader />
                    ) : messages.length === 0 ? (
                      <EmptyMessage />
                    ) : (
                      <>
                        {messages.map((message) => (
                          <Messages
                            key={message.id}
                            message={message}
                            contact={{ avatar: null, name: "Usuario" }}
                            profile={user}
                            onDelete={onDelete}
                            index={message.id}
                            selectedChatId={selectedChatId}
                            handleReply={handleReply}
                            replayData={replayData}
                            handleForward={handleForward}
                            handlePinMessage={handlePinMessage}
                            pinnedMessages={pinnedMessages}
                          />
                        ))}
                      </>
                    )}
                    <PinnedMessages
                      pinnedMessages={pinnedMessages}
                      handleUnpinMessage={handleUnpinMessage}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex-none flex-col px-0 py-4 border-t border-border">
                  <MessageFooter
                    chatId={selectedChatId}
                    replay={replay}
                    setReply={setReply}
                    replayData={replayData}
                    handleSendMessage={handleSendMsg}
                  />
                </CardFooter>
              </Card>
            </div>
            {showInfo && (
              <ContactInfo
                handleSetIsOpenSearch={handleSetIsOpenSearch}
                handleShowInfo={handleShowInfo}
                contact={patients.find((patient) => patient.id === selectedChatId)}
              />
            )}
          </div>
        </div>
      ) : (
        <Blank mblChatHandler={() => setShowContactSidebar(true)} />
      )}

      <ForwardMessage
        open={isForward}
        contact={"s"}
        setIsOpen={setIsForward}
        contacts={patients}
      />
    </div>
  );
};

export default ChatPage;
