"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { getMessages, sendMessage, deleteMessage, getProfile } from "./chat-config";
import usePatientsStore from "@/store/pacientesStore";
import { db, storage } from "@/firebaseConfig";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  listAll,
} from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";

// Creamos el contexto
const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  // Obtención de pacientes mediante el store de Zustand
  const { patients, loading, error, fetchPatients } = usePatientsStore();

  // Estados para la lógica del chat
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [reply, setReply] = useState(null); // Objeto: { message, contact }
  const [forward, setForward] = useState(null); // Mensaje a reenviar
  const [profile, setProfile] = useState(null); // Perfil del usuario o paciente actual
  const [chatError, setChatError] = useState(null);

  // Cargar perfil al montar el componente
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await getProfile();
        setProfile(profileData);
      } catch (err) {
        console.error("Error cargando perfil:", err);
        setChatError(err);
      }
    };
    loadProfile();
  }, []);

  // Cada vez que se seleccione un chat, se cargan sus mensajes
  useEffect(() => {
    if (selectedChatId) {
      const loadMessages = async () => {
        try {
          const data = await getMessages(selectedChatId);
          setMessages(data);
        } catch (err) {
          console.error("Error cargando mensajes:", err);
          setChatError(err);
        }
      };
      loadMessages();
    }
  }, [selectedChatId]);

  // Función para subir un archivo a Firebase Storage y obtener su URL
  const uploadFile = async (file, chatId) => {
    if (!chatId) {
      throw new Error("El chatId es requerido para subir archivos");
    }
    try {
      const fileRef = storageRef(storage, `chats/${chatId}/${file.name}`);
      const snapshot = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (err) {
      console.error("Error subiendo archivo:", err);
      throw err;
    }
  };

  // Función para obtener los archivos compartidos de un chat
  const getSharedFiles = async (chatId) => {
    if (!chatId) return [];
    try {
      const folderRef = storageRef(storage, `chats/${chatId}/`);
      const result = await listAll(folderRef);
      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return { name: itemRef.name, url };
        })
      );
      return files;
    } catch (err) {
      console.error("Error obteniendo archivos compartidos:", err);
      return [];
    }
  };

  // Función para crear un chat en Firestore
  const createChat = async (patientId) => {
    try {
      // Se asume que el chat se crea con los participantes: el usuario actual y el paciente
      const chatDocRef = await addDoc(collection(db, "chats"), {
        participants: [profile?.id, patientId],
        createdAt: new Date().toISOString(),
      });
      return chatDocRef.id;
    } catch (err) {
      console.error("Error creando chat:", err);
      throw err;
    }
  };

  // Función para seleccionar un chat (se crea uno si es necesario)
  const selectChat = async (patientId) => {
    try {
      // Aquí podrías validar si ya existe un chat entre los participantes
      const newChatId = await createChat(patientId);
      setSelectedChatId(newChatId);
    } catch (err) {
      console.error("Error seleccionando chat:", err);
      setChatError(err);
    }
  };

  // Función para enviar mensaje, con opción de adjuntar un archivo
  const handleSendMessage = async (messageContent, file = null) => {
    if (!selectedChatId || (!messageContent && !file)) return;
    try {
      let fileURL = null;
      if (file) {
        fileURL = await uploadFile(file, selectedChatId);
      }
      const newMessage = {
        message: messageContent,
        file: fileURL, // URL del archivo o null
        contact: { id: selectedChatId },
        replayMetadata: reply ? true : false,
        timestamp: new Date().toISOString(),
      };
      await sendMessage(newMessage);
      const data = await getMessages(selectedChatId);
      setMessages(data);
      setReply(null);
    } catch (err) {
      console.error("Error enviando mensaje:", err);
      setChatError(err);
    }
  };

  // Función para eliminar un mensaje
  const handleDeleteMessage = async (chatId, index) => {
    try {
      await deleteMessage({ selectedChatId: chatId, index });
      setPinnedMessages((prev) => prev.filter((msg) => msg.index !== index));
      const data = await getMessages(selectedChatId);
      setMessages(data);
    } catch (err) {
      console.error("Error eliminando mensaje:", err);
      setChatError(err);
    }
  };

  // Función para preparar una respuesta (reply)
  const handleReply = (messageContent, contact) => {
    setReply({ message: messageContent, contact });
  };

  // Función para pinear o despinear un mensaje
  const handlePinMessage = (messageContent, avatar, index) => {
    const isPinned = pinnedMessages.some((msg) => msg.index === index);
    if (isPinned) {
      setPinnedMessages((prev) => prev.filter((msg) => msg.index !== index));
    } else {
      setPinnedMessages((prev) => [...prev, { note: messageContent, avatar, index }]);
    }
  };

  // Función para reenviar un mensaje
  const handleForward = (messageContent) => {
    setForward(messageContent);
    // Aquí podrías abrir un modal o lógica adicional para reenviar
  };

  const value = {
    patients,
    loading,
    error,
    chatError,
    fetchPatients,
    selectedChatId,
    setSelectedChatId,
    messages,
    setMessages,
    pinnedMessages,
    setPinnedMessages,
    reply,
    setReply,
    forward,
    setForward,
    profile,
    uploadFile,
    getSharedFiles,
    createChat,
    selectChat,
    handleSendMessage,
    handleDeleteMessage,
    handleReply,
    handlePinMessage,
    handleForward,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// Hook para usar el ChatContext en otros componentes
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat debe usarse dentro de un ChatProvider");
  }
  return context;
};

export default ChatContext;
