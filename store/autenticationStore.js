import { create } from 'zustand';
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from '@/firebaseConfig'; // Asegúrate de que la ruta sea la correcta

const useAuthenticationStore = create((set, get) => ({
  user: null,
  // Inicializa auth solo en el cliente, en SSR lo dejamos como null
  auth: typeof window !== 'undefined' ? getAuth() : null,
  loading: true,
  role: null,
  error: null,

  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Inicializa la autenticación y actualiza el contexto con datos adicionales
  initializeAuth: () => {
    if (typeof window !== 'undefined') {
      if (!get().auth) {
        set({ auth: getAuth() });
      }
      const auth = get().auth;
      onAuthStateChanged(auth, async (user) => {
        set({ loading: true });
        if (user) {
          set({ user });
          try {
            const roleDocRef = doc(db, "roles", user.uid);
            const roleSnap = await getDoc(roleDocRef);
            if (roleSnap.exists()) {
              const roleData = roleSnap.data();
              set({ role: roleData.nivel });
            } else {
              set({ role: null, error: "Rol no encontrado" });
            }
          } catch (error) {
            console.error("Error al obtener el rol:", error);
            set({ role: null, error: error.message });
          }
          try {
            const agentesDocRef = doc(db, "agentes", user.uid);
            const agentesSnap = await getDoc(agentesDocRef);
            if (agentesSnap.exists()) {
              const agentesData = agentesSnap.data();
              set({ user: { ...user, ...agentesData } });
            }
          } catch (error) {
            console.error("Error al obtener datos de agentes:", error);
            set({ error: error.message });
          } finally {
            set({ loading: false });
          }
        } else {
          set({ user: null, role: null, loading: false });
        }
      });
    }
  },

  // Función para el login con email y contraseña que retorna el resultado
  login: async (email, password) => {
    if (typeof window !== 'undefined' && get().auth) {
      const auth = get().auth;
      set({ loading: true, error: null });
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // La actualización del usuario se realizará en onAuthStateChanged
        set({ loading: false });
        return userCredential;
      } catch (error) {
        set({ error: error.message, loading: false });
        return null;
      }
    } else {
      console.warn("Firebase Auth no está disponible en este entorno.");
      set({ error: "Firebase Auth no está disponible.", loading: false });
      return null;
    }
  },

  // Función para el logout
  logout: async () => {
    if (typeof window !== 'undefined' && get().auth) {
      const auth = get().auth;
      set({ loading: true, error: null });
      try {
        await signOut(auth);
        set({ user: null, role: null, loading: false });
      } catch (error) {
        set({ error: error.message, loading: false });
      }
    } else {
      console.warn("Firebase Auth no está disponible en este entorno.");
      set({ error: "Firebase Auth no está disponible.", loading: false });
    }
  },
}));

export default useAuthenticationStore;
