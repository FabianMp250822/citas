"use client";

import { useState, useEffect } from "react";

export default function useCrmStatistics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    numberOfPacientes: 0,
    numberOfAgentes: 0,
    numberOfCitasInProcess: 0,
    numberOfCitasCompleted: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Llamada a tu función Firebase desplegada
        const res = await fetch("https://getcrmstatistics-vskhl4vlga-uc.a.run.app");
        if (!res.ok) {
          throw new Error("Error al obtener estadísticas");
        }
        const json = await res.json();

        // Muestra en consola qué formato está recibiendo
        console.log("Respuesta de la función Cloud:", json);

        // Si tu función retorna algo como:
        // {
        //   numberOfPacientes: 0,
        //   numberOfAgentes: 0,
        //   numberOfCitasInProcess: 0,
        //   numberOfCitasCompleted: 0
        // }
        // Entonces debes usar setData(json) directamente.

        // Si en cambio retorna:
        // {
        //   data: {
        //     numberOfPacientes: 0,
        //     ...
        //   }
        // }
        // Debes usar setData(json.data).

        if (json.data) {
          // Caso 1: la función retorna { data: { ... } }
          setData(json.data);
        } else {
          // Caso 2: la función retorna las propiedades al tope
          // (o un error)
          setData(json);
        }
      } catch (error) {
        console.error("Error al obtener estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading };
}
