"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  collection,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";

// Creamos el contexto para los doctores
const DoctorsContext = createContext();

// Proveedor del contexto de doctores
export function DoctorsProvider({ children }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener la lista de doctores
  const fetchDoctors = useCallback(async () => {
    try {
      const doctorsRef = collection(db, "doctores");
      // Ordenamos por el nombre del doctor (puedes ajustar según tu esquema)
      const q = query(doctorsRef, orderBy("doctorName", "asc"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          setDoctors(docs);
          setLoading(false);
        },
        (err) => {
          console.error("Error obteniendo doctores:", err);
          setError(err);
          setLoading(false);
        }
      );
      return unsubscribe;
    } catch (err) {
      console.error("Error en fetchDoctors:", err);
      setError(err);
    }
  }, []);

  // Función para crear un doctor
  const createDoctor = useCallback(async (doctorData) => {
    try {
      // Puedes agregar timestamp u otros campos adicionales
      doctorData.createdAt = serverTimestamp();
      const docRef = await addDoc(collection(db, "doctores"), doctorData);
      return { success: true, id: docRef.id };
    } catch (err) {
      console.error("Error creando doctor:", err);
      setError(err);
      return { success: false, error: err };
    }
  }, []);

  // Función para actualizar un doctor
  const updateDoctor = useCallback(async (doctorId, updatedData) => {
    try {
      await updateDoc(doc(db, "doctores", doctorId), updatedData);
      return { success: true };
    } catch (err) {
      console.error("Error actualizando doctor:", err);
      setError(err);
      return { success: false, error: err };
    }
  }, []);

  // Función para eliminar un doctor
  const deleteDoctor = useCallback(async (doctorId) => {
    try {
      await deleteDoc(doc(db, "doctores", doctorId));
      return { success: true };
    } catch (err) {
      console.error("Error eliminando doctor:", err);
      setError(err);
      return { success: false, error: err };
    }
  }, []);

  // Al montar el proveedor, obtenemos la lista de doctores
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const value = {
    doctors,
    loading,
    error,
    fetchDoctors,
    createDoctor,
    updateDoctor,
    deleteDoctor,
  };

  return (
    <DoctorsContext.Provider value={value}>
      {children}
    </DoctorsContext.Provider>
  );
}

// Hook para consumir el contexto en cualquier componente
export function useDoctors() {
  const context = useContext(DoctorsContext);
  if (!context) {
    throw new Error("useDoctors debe usarse dentro de un DoctorsProvider");
  }
  return context;
}

export default DoctorsContext;
