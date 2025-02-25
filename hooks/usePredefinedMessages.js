"use client";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebaseConfig";

// Valores por defecto en caso de error o ausencia de datos en Firestore
const localPredefinedMessages = {
  firstmessage: "Hola, bienvenido a nuestra clínica. ¿En qué puedo ayudarte?",
  timemessage: "Estamos trabajando en tu solicitud. Gracias por la espera.",
};

export const usePredefinedMessages = () => {
  const [messages, setMessages] = useState(localPredefinedMessages);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPredefined = async () => {
      try {
        const colRef = collection(db, "pedismessage");
        const snapshot = await getDocs(colRef);
        if (!snapshot.empty) {
          // Tomamos el primer documento (puedes ajustar la lógica según tu estructura)
          const docData = snapshot.docs[0].data();
          setMessages({
            firstmessage: docData.firstmessage || localPredefinedMessages.firstmessage,
            timemessage: docData.timemessage || localPredefinedMessages.timemessage,
          });
        }
      } catch (err) {
        console.error("Error obteniendo mensajes predefinidos:", err);
        // Se utiliza el fallback local
        setMessages(localPredefinedMessages);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPredefined();
  }, []);

  return { messages, loading, error };
};
