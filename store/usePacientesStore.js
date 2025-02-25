import { create } from 'zustand';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig'; 

const usePacientesStore = create((set, get) => ({
  pacientes: [],
  loading: false,
  error: null,

  // Función para obtener todos los pacientes de la colección "pacientes"
  fetchPacientes: async () => {
    set({ loading: true, error: null });
    try {
      const querySnapshot = await getDocs(collection(db, 'pacientes'));
      const pacientesList = [];
      querySnapshot.forEach((docSnap) => {
        pacientesList.push({ id: docSnap.id, ...docSnap.data() });
      });
      set({ pacientes: pacientesList, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Función para actualizar un paciente (por ejemplo, editar campos)
  updatePaciente: async (pacienteId, data) => {
    set({ loading: true, error: null });
    try {
      await updateDoc(doc(db, 'pacientes', pacienteId), data);
      // Refrescamos la lista de pacientes
      await get().fetchPacientes();
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Función para eliminar un paciente
  deletePaciente: async (pacienteId) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'pacientes', pacienteId));
      // Refrescamos la lista de pacientes
      await get().fetchPacientes();
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));

export default usePacientesStore;
