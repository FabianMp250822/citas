import { create } from 'zustand';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig'; // Asegúrate de que la ruta sea correcta

const useAgentsStore = create((set, get) => ({
  agents: [],
  loading: false,
  error: null,

  // Función para obtener todos los agentes de la colección "agentes"
  fetchAgents: async () => {
    set({ loading: true, error: null });
    try {
      const querySnapshot = await getDocs(collection(db, 'agentes'));
      const agentsList = [];
      querySnapshot.forEach((docSnap) => {
        agentsList.push({ id: docSnap.id, ...docSnap.data() });
      });
      set({ agents: agentsList, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Función para actualizar un agente (por ejemplo, editar campos)
  updateAgent: async (agentId, data) => {
    set({ loading: true, error: null });
    try {
      await updateDoc(doc(db, 'agentes', agentId), data);
      // Refrescamos la lista de agentes
      await get().fetchAgents();
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Función para eliminar un agente
  deleteAgent: async (agentId) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'agentes', agentId));
      // Refrescamos la lista de agentes
      await get().fetchAgents();
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));

export default useAgentsStore;
