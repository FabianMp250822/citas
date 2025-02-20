//hooks/useNotifications.js
"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/firebaseConfig";

const useNotifications = (agentId) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Si no hay agentId, no hacemos nada (pero el hook se llama igual)
    if (!agentId) {
      setNotifications([]);
      return;
    }

    const notificationsRef = collection(db, "agentes", agentId, "citasRecibidas");
    const q = query(notificationsRef, orderBy("asignadoEn", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(notifs);
      },
      (error) => {
        console.error("Error al obtener notificaciones:", error);
      }
    );

    return () => unsubscribe();
  }, [agentId]);

  return notifications;
};

export default useNotifications;
