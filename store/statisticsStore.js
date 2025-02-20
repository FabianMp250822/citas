// statisticsStore.js
"use client";
import create from "zustand";

const useStatisticsStore = create((set, get) => ({
  data: {
    numberOfPacientes: 0,
    numberOfAgentes: 0,
    numberOfCitasInProcess: 0,
    numberOfCitasCompleted: 0,
  },
  loading: false,
  // Agregamos un flag para saber si ya se cargaron los datos
  fetched: false,
  
  fetchData: async () => {
    // Si ya se hizo la petición, no volvemos a llamar
    if (get().fetched) return;

    set({ loading: true });
    try {
      const res = await fetch("https://getcrmstatistics-vskhl4vlga-uc.a.run.app");
      if (!res.ok) {
        throw new Error("Error al obtener estadísticas");
      }
      const json = await res.json();
      const newData = json.data ? json.data : json;
      set({ data: newData, fetched: true });
      console.log("Datos obtenidos:", newData);
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
    } finally {
      set({ loading: false });
    }
  },
}));

export default useStatisticsStore;
