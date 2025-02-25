"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  onSnapshot,
  collection,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db, storage } from "@/firebaseConfig";
import usePatientsStore from "@/store/pacientesStore";

// Creamos el contexto
const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { patients, loading, error, fetchPatients } = usePatientsStore();
  const [user, setUser] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [subLoading, setSubLoading] = useState(true);
  const [chatError, setChatError] = useState(null);

  useEffect(() => {
    console.log("Iniciando onAuthStateChanged...");
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      console.log("Usuario autenticado:", currentUser);
      setUser(currentUser);
    });
    return unsubscribeAuth;
  }, []);

  // Suscribirse a los mensajes del chat (memoizado)
  const subscribeToChat = useCallback((chatId) => {
    console.log("Suscribiéndose al chat:", chatId);
    setSubLoading(true);

    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        console.log("Mensajes recibidos:", msgs);
        setMessages(msgs);
        setSubLoading(false);
      },
      (err) => {
        console.error("Error cargando mensajes:", err);
        setChatError(err);
        setSubLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const sendMessage = useCallback(
    async (chatId, text) => {
      console.log("sendMessage invocado con chatId:", chatId, "y texto:", text);
      if (!user) {
        console.log("No hay usuario autenticado. Se aborta sendMessage.");
        return;
      }
      try {
        const messagesRef = collection(db, "chats", chatId, "messages");
        await addDoc(messagesRef, {
          senderId: user.uid,
          message: text,
          timestamp: serverTimestamp(),
        });
        console.log("Mensaje de texto enviado correctamente a Firestore.");
      } catch (error) {
        console.error("Error al enviar el mensaje:", error);
        setChatError(error);
        throw error;
      }
    },
    [user]
  );

  const sendDocument = useCallback(
    async (chatId, file) => {
      console.log("sendDocument invocado con chatId:", chatId, "y file:", file);
      if (!user) {
        console.log("No hay usuario autenticado. Se aborta sendDocument.");
        return;
      }
      try {
        const fileRef = ref(storage, `documents/${chatId}/${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log("Archivo subido con éxito. URL:", downloadURL);
        const messagesRef = collection(db, "chats", chatId, "messages");
        await addDoc(messagesRef, {
          senderId: user.uid,
          message: "",
          documentUrl: downloadURL,
          fileName: file.name,
          timestamp: serverTimestamp(),
        });
        console.log("Mensaje de documento enviado correctamente a Firestore.");
      } catch (error) {
        console.error("Error al enviar el documento:", error);
        setChatError(error);
        throw error;
      }
    },
    [user]
  );

  const handleSendMessage = useCallback(
    async (chatId, messageContent, file = null) => {
      console.log("handleSendMessage invocado con:");
      console.log("  chatId:", chatId);
      console.log("  messageContent:", messageContent);
      console.log("  file:", file);
      if (!chatId) {
        console.log("No hay chatId definido. Se aborta handleSendMessage.");
        return;
      }
      if (!messageContent && !file) {
        console.log("No hay contenido de mensaje ni archivo. Se aborta handleSendMessage.");
        return;
      }
      try {
        if (file) {
          await sendDocument(chatId, file);
        }
        if (messageContent && messageContent.trim() !== "") {
          await sendMessage(chatId, messageContent);
        }
      } catch (err) {
        console.error("Error en handleSendMessage:", err);
        setChatError(err);
        throw err;
      }
    },
    [sendDocument, sendMessage]
  );

  const handleDeleteMessage = useCallback(
    async (chatId, messageId) => {
      console.log("handleDeleteMessage invocado con chatId:", chatId, "y messageId:", messageId);
      try {
        await deleteDoc(doc(db, "chats", chatId, "messages", messageId));
        console.log("Mensaje eliminado correctamente de Firestore.");
      } catch (err) {
        console.error("Error eliminando mensaje:", err);
        setChatError(err);
        throw err;
      }
    },
    []
  );

  const value = {
    user,
    patients,
    loading,
    error,
    chatError,
    messages,
    subLoading,
    subscribeToChat,
    sendMessage,
    sendDocument,
    handleSendMessage,
    handleDeleteMessage,
    // También se exponen setChatData si lo necesitas en otro componente
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat debe usarse dentro de un ChatProvider");
  }
  return context;
}

export default ChatContext;
