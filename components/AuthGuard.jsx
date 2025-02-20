// components/AuthGuard.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthenticationStore from "@/store/autenticationStore";

export default function AuthGuard({ children }) {
  const { user, loading, initializeAuth } = useAuthenticationStore();
  const router = useRouter();

  useEffect(() => {
    // Inicializa la autenticación (si no se ha hecho ya)
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    // Si ya terminó de cargar y no hay usuario, redirige al login
    if (!loading && !user) {
      router.push("/auth/login5");
    }
  }, [loading, user, router]);

  // Mientras carga o no se tiene usuario, se puede mostrar un spinner o mensaje de carga
  if (loading || !user) {
    return <div>Cargando...</div>;
  }

  return children;
}
