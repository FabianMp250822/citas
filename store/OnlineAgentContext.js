"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "@/firebaseConfig";
import { doc, setDoc, updateDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import useAuthenticationStore from "@/store/autenticationStore";

// Creamos el contexto
const OnlineAgentContext = createContext(null);

// Función auxiliar para verificar si una fecha es hoy
const isToday = (timestamp) => {
  const d = timestamp.toDate(); // Si es un Timestamp de Firestore
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
};

export const OnlineAgentProvider = ({ children }) => {
  // Obtenemos el usuario autenticado (si existe)
  const { user } = useAuthenticationStore();

  // Estados locales para el status y la hora de inicio
  const [status, setStatus] = useState("Inactive");
  const [startTime, setStartTime] = useState(null);

  // Efecto para suscribirse al documento onlineAgent del usuario y actualizar estado/hora
  useEffect(() => {
    if (user) {
      const docRef = doc(db, "onlineAgent", user.uid);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setStatus(data.status);
          // Si el status es "Active" y la marca de tiempo es de hoy, se asigna startTime
          if (data.status === "Active" && data.startedAt && isToday(data.startedAt)) {
            setStartTime(data.startedAt.toDate());
          } else {
            setStartTime(null);
          }
        } else {
          // Si no existe el documento, se resetea el estado
          setStatus("Inactive");
          setStartTime(null);
        }
      });
      return () => unsubscribe();
    } else {
      setStatus("Inactive");
      setStartTime(null);
    }
  }, [user]);

  // startSession: crea o actualiza un documento en Firestore
  const startSession = async () => {
    if (!user) return;
    try {
      const now = new Date();
      await setDoc(
        doc(db, "onlineAgent", user.uid),
        {
          status: "Active",
          startedAt: serverTimestamp(), // Se asigna la marca de tiempo del servidor
          email: user.email ?? "",
          displayName: user.displayName ?? "Usuario",
        },
        { merge: true }
      );
      // Como serverTimestamp es asíncrono, asignamos localmente la hora actual
      setStatus("Active");
      setStartTime(now);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  // updateStatus: actualiza el estado
  const updateStatus = async (newStatus) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "onlineAgent", user.uid), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      setStatus(newStatus);
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  };

  // endSession: finaliza la sesión (marca como Offline)
  const endSession = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "onlineAgent", user.uid), {
        status: "Offline",
        endedAt: serverTimestamp(),
      });
      setStatus("Offline");
      setStartTime(null);
    } catch (error) {
      console.error("Error al finalizar sesión:", error);
    }
  };

  return (
    <OnlineAgentContext.Provider
      value={{
        status,
        startTime,
        startSession,
        updateStatus,
        endSession,
      }}
    >
      {children}
    </OnlineAgentContext.Provider>
  );
};

// Hook para consumir el contexto
export const useOnlineAgent = () => useContext(OnlineAgentContext);
