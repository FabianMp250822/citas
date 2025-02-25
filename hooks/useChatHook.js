// useChatHook.js
"use client";
import { useContext, useCallback } from "react";
import { ChatContext } from "@/store/ChatContext"; 
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig"; 

export default function useChatHook() {
  const {
    user,
    chatData,
    setChatData,
    messages,
    loading,
    subscribeToChat,
    sendMessage,
    sendDocument,
  } = useContext(ChatContext);

  // Función para asegurar que el chat está activo y que el usuario está autorizado.
  // Si no existe el chat, se crea; de lo contrario, se valida que el usuario sea participante.
  const ensureActiveChat = useCallback(
    async (chatId, participants) => {
      if (!user) {
        throw new Error("El usuario no está autenticado");
      }

      // Si ya tenemos datos de chat en el contexto, asumimos que ya está validado.
      if (chatData) return;

      const chatDocRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatDocRef);
      if (chatSnap.exists()) {
        const data = chatSnap.data();
        // Validamos que el usuario autenticado forme parte de la conversación.
        if (data.participants && data.participants.includes(user.uid)) {
          setChatData({ ...data, id: chatSnap.id });
        } else {
          throw new Error("Usuario no autorizado en este chat");
        }
      } else {
        // Si el chat no existe, lo creamos de forma segura
        const newChat = {
          participants, // Debe incluir, por ejemplo, el UID del paciente y el del agente
          createdAt: new Date(), // Considera usar serverTimestamp() en producción
          status: "active",
        };
        await setDoc(chatDocRef, newChat);
        setChatData({ ...newChat, id: chatId });
      }
    },
    [user, chatData, setChatData]
  );

  // Función para procesar mensajes, por ejemplo, filtrando contenido indeseado o validando formato.
  const processMessages = useCallback((msgs) => {
    // Aquí podrías agregar validaciones o formateos adicionales.
    // En este ejemplo simplemente filtramos mensajes que no sean cadenas de texto.
    return msgs.filter(msg => msg && typeof msg.message === "string");
  }, []);

  // Envolver la suscripción al chat para aplicar el procesamiento de mensajes si es necesario.
  const subscribeToSecureChat = useCallback(
    (chatId) => {
      const unsubscribe = subscribeToChat(chatId);
      return unsubscribe;
    },
    [subscribeToChat]
  );

  // Enviar mensaje de texto: se valida que el mensaje no esté vacío y se limpia espacios.
  const secureSendMessage = useCallback(
    async (chatId, text) => {
      if (!text || typeof text !== "string" || text.trim().length === 0) return;
      await sendMessage(chatId, text.trim());
    },
    [sendMessage]
  );

  return {
    user,
    chatData,
    setChatData,
    messages: processMessages(messages),
    loading,
    subscribeToChat: subscribeToSecureChat,
    sendMessage: secureSendMessage,
    sendDocument, // agregar validaciones similares dentro de sendDocument si es necesario
    ensureActiveChat,
  };
}
