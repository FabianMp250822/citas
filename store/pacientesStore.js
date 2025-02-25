import { create } from 'zustand';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

const usePatientsStore = create((set, get) => ({
  patients: [],
  loading: false,
  error: null,

  // Función para obtener todos los pacientes de la colección "pacientes"
  fetchPatients: async () => {
    set({ loading: true, error: null });
    try {
      const querySnapshot = await getDocs(collection(db, 'pacientes'));
      const patientsList = [];
      querySnapshot.forEach((docSnap) => {
        patientsList.push({ id: docSnap.id, ...docSnap.data() });
      });
      set({ patients: patientsList, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Función para actualizar un paciente (por ejemplo, editar campos)
  updatePatient: async (patientId, data) => {
    set({ loading: true, error: null });
    try {
      await updateDoc(doc(db, 'pacientes', patientId), data);
      // Refrescamos la lista de pacientes
      await get().fetchPatients();
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Función para eliminar un paciente
  deletePatient: async (patientId) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'pacientes', patientId));
      // Refrescamos la lista de pacientes
      await get().fetchPatients();
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));

export default usePatientsStore;
