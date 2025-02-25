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
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";

/**
 * AppointmentsContext:
 * Contexto para la gestión de citas médicas.
 */
const AppointmentsContext = createContext();

/**
 * AppointmentsProvider:
 * Proveedor del contexto de citas, donde se definen los estados y funciones
 * para manejar citas, pacientes, médicos y especialidades.
 */
export function AppointmentsProvider({ children }) {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]); // Especialidades
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Duración fija de la cita (20 minutos por defecto)
  const APPOINTMENT_DURATION = 20;

  // ─────────────────────────────────────────────────────────────────────
  //  1. GESTIÓN DE ESPECIALIDADES
  // ─────────────────────────────────────────────────────────────────────

  /**
   * fetchSpecialties:
   * Obtiene las especialidades desde la colección "especialidadesclinica".
   * Se asume que es una colección con un solo documento que contiene
   * un array de especialidades en la propiedad "specialties".
   */
  const fetchSpecialties = useCallback(async () => {
    try {
      const especialidadesRef = collection(db, "especialidadesclinica");
      const querySnapshot = await getDocs(especialidadesRef);

      if (!querySnapshot.empty) {
        // Se asume que sólo hay un documento con un array "specialties"
        const docData = querySnapshot.docs[0].data();
        if (docData.specialties && Array.isArray(docData.specialties)) {
          setSpecialties(docData.specialties);
        }
      }
    } catch (err) {
      console.error("Error obteniendo especialidades:", err);
      setError(err);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────
  //  2. GESTIÓN DE CITAS
  // ─────────────────────────────────────────────────────────────────────

  /**
   * subscribeToAppointments:
   * Permite suscribirse a la colección "citas" con filtros opcionales:
   * - date: Fecha para filtrar las citas de un día específico.
   * - specialty: Filtrar por especialidad.
   * - doctorId: Filtrar por médico.
   * - status: Filtrar por estado (scheduled, completed, cancelled, etc.).
   */
  const subscribeToAppointments = useCallback((filterOptions = {}) => {
    setLoading(true);
    const citasRef = collection(db, "citas");
    let conditions = [];

    // Filtrado por fecha
    if (filterOptions.date) {
      const startOfDay = new Date(filterOptions.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filterOptions.date);
      endOfDay.setHours(23, 59, 59, 999);
      conditions.push(where("appointmentDate", ">=", startOfDay));
      conditions.push(where("appointmentDate", "<=", endOfDay));
    }

    // Filtrado por especialidad
    if (filterOptions.specialty) {
      conditions.push(where("specialty", "==", filterOptions.specialty));
    }

    // Filtrado por doctor
    if (filterOptions.doctorId) {
      conditions.push(where("doctorId", "==", filterOptions.doctorId));
    }

    // Filtrado por estado
    if (filterOptions.status) {
      conditions.push(where("status", "==", filterOptions.status));
    }

    let q;
    if (conditions.length > 0) {
      q = query(citasRef, ...conditions, orderBy("appointmentDate", "asc"));
    } else {
      q = query(citasRef, orderBy("appointmentDate", "asc"));
    }

    // Suscripción en tiempo real a las citas
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const apps = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setAppointments(apps);
        setLoading(false);
      },
      (err) => {
        console.error("Error en la suscripción a citas:", err);
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  /**
   * createAppointment:
   * Crea una nueva cita en la colección "citas".
   */
  const createAppointment = useCallback(
    async (appointmentData) => {
      try {
        // Asigna duración por defecto si no se define
        if (!appointmentData.duration) {
          appointmentData.duration = APPOINTMENT_DURATION;
        }
        // Estado inicial
        if (!appointmentData.status) {
          appointmentData.status = "scheduled";
        }
        // Color asociado al estado
        if (!appointmentData.color) {
          switch (appointmentData.status) {
            case "scheduled":
              appointmentData.color = "#4caf50"; // verde
              break;
            case "completed":
              appointmentData.color = "#2196f3"; // azul
              break;
            case "cancelled":
              appointmentData.color = "#f44336"; // rojo
              break;
            default:
              appointmentData.color = "#9e9e9e"; // gris
          }
        }
        appointmentData.createdAt = serverTimestamp();

        const docRef = await addDoc(collection(db, "citas"), appointmentData);
        return { success: true, id: docRef.id };
      } catch (err) {
        console.error("Error creando cita:", err);
        setError(err);
        return { success: false, error: err };
      }
    },
    [APPOINTMENT_DURATION]
  );

  /**
   * updateAppointment:
   * Actualiza una cita existente.
   */
  const updateAppointment = useCallback(async (appointmentId, updatedData) => {
    try {
      if (updatedData.status) {
        switch (updatedData.status) {
          case "scheduled":
            updatedData.color = "#4caf50";
            break;
          case "completed":
            updatedData.color = "#2196f3";
            break;
          case "cancelled":
            updatedData.color = "#f44336";
            break;
          default:
            updatedData.color = "#9e9e9e";
        }
      }
      await updateDoc(doc(db, "citas", appointmentId), updatedData);
      return { success: true };
    } catch (err) {
      console.error("Error actualizando cita:", err);
      setError(err);
      return { success: false, error: err };
    }
  }, []);

  /**
   * deleteAppointment:
   * Elimina una cita.
   */
  const deleteAppointment = useCallback(async (appointmentId) => {
    try {
      await deleteDoc(doc(db, "citas", appointmentId));
      return { success: true };
    } catch (err) {
      console.error("Error eliminando cita:", err);
      setError(err);
      return { success: false, error: err };
    }
  }, []);

  /**
   * getAppointmentsCountBySpecialty:
   * Retorna la cantidad de citas para una especialidad en una fecha dada.
   */
  const getAppointmentsCountBySpecialty = useCallback(
    (date, specialty) => {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const count = appointments.filter((app) => {
        const appDate = app.appointmentDate?.toDate
          ? app.appointmentDate.toDate()
          : new Date(app.appointmentDate);
        return (
          appDate >= startOfDay &&
          appDate <= endOfDay &&
          app.specialty === specialty
        );
      }).length;

      return count;
    },
    [appointments]
  );

  /**
   * getAppointmentsForView:
   * Retorna las citas en un rango según la vista (diaria, semanal, mensual).
   */
  const getAppointmentsForView = useCallback(
    (viewType, referenceDate) => {
      const start = new Date(referenceDate);
      let end;

      if (viewType === "daily") {
        start.setHours(0, 0, 0, 0);
        end = new Date(referenceDate);
        end.setHours(23, 59, 59, 999);
      } else if (viewType === "weekly") {
        const day = referenceDate.getDay();
        const sunday = new Date(referenceDate);
        sunday.setDate(referenceDate.getDate() - day);
        sunday.setHours(0, 0, 0, 0);
        start.setTime(sunday.getTime());
        end = new Date(sunday);
        end.setDate(sunday.getDate() + 6);
        end.setHours(23, 59, 59, 999);
      } else if (viewType === "monthly") {
        const year = referenceDate.getFullYear();
        const month = referenceDate.getMonth();
        start.setTime(new Date(year, month, 1).getTime());
        end = new Date(year, month + 1, 0);
        end.setHours(23, 59, 59, 999);
      } else {
        // Por defecto, vista diaria
        start.setHours(0, 0, 0, 0);
        end = new Date(referenceDate);
        end.setHours(23, 59, 59, 999);
      }

      return appointments.filter((app) => {
        const appDate = app.appointmentDate?.toDate
          ? app.appointmentDate.toDate()
          : new Date(app.appointmentDate);
        return appDate >= start && appDate <= end;
      });
    },
    [appointments]
  );

  /**
   * filterAppointments:
   * Permite filtrar las citas por especialidad, médico o estado.
   */
  const filterAppointments = useCallback(
    (filterOptions) => {
      return appointments.filter((app) => {
        let match = true;
        if (filterOptions.specialty) {
          match = match && app.specialty === filterOptions.specialty;
        }
        if (filterOptions.doctorId) {
          match = match && app.doctorId === filterOptions.doctorId;
        }
        if (filterOptions.status) {
          match = match && app.status === filterOptions.status;
        }
        return match;
      });
    },
    [appointments]
  );

  // ─────────────────────────────────────────────────────────────────────
  //  3. GESTIÓN DE PACIENTES
  // ─────────────────────────────────────────────────────────────────────

  /**
   * searchPatients:
   * Busca pacientes en la colección "pacientes" (por nombre o identificación).
   */
  const searchPatients = useCallback(
    async (queryText) => {
      try {
        const pacientesRef = collection(db, "pacientes");
        const q = query(pacientesRef, orderBy("name", "asc"));
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const pts = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...docSnap.data(),
            }));
            setPatients(pts);
          },
          (err) => {
            console.error("Error obteniendo pacientes:", err);
            setError(err);
          }
        );
        // Filtrado en memoria (solo si ya se han cargado en setPatients)
        return patients.filter(
          (patient) =>
            patient.name.toLowerCase().includes(queryText.toLowerCase()) ||
            (patient.identification &&
              patient.identification
                .toLowerCase()
                .includes(queryText.toLowerCase()))
        );
      } catch (err) {
        console.error("Error buscando pacientes:", err);
        setError(err);
        return [];
      }
    },
    [patients]
  );

  /**
   * getPatientHistory:
   * Retorna el historial de citas de un paciente específico.
   */
  const getPatientHistory = useCallback(
    (patientId) => {
      return appointments.filter((app) => app.patientId === patientId);
    },
    [appointments]
  );

  // ─────────────────────────────────────────────────────────────────────
  //  4. GESTIÓN DE MÉDICOS
  // ─────────────────────────────────────────────────────────────────────

  /**
   * fetchDoctors:
   * Obtiene la lista de médicos de la colección "doctores".
   */
  const fetchDoctors = useCallback(async () => {
    try {
      const doctorsRef = collection(db, "doctores");
      const q = query(doctorsRef, orderBy("name", "asc"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          setDoctors(docs);
        },
        (err) => {
          console.error("Error obteniendo médicos:", err);
          setError(err);
        }
      );
      return unsubscribe;
    } catch (err) {
      console.error("Error en fetchDoctors:", err);
      setError(err);
    }
  }, []);

  /**
   * assignAppointmentToDoctor:
   * Asigna una cita a un médico específico actualizando el campo doctorId.
   */
  const assignAppointmentToDoctor = useCallback(async (appointmentId, doctorId) => {
    try {
      await updateDoc(doc(db, "citas", appointmentId), { doctorId });
      return { success: true };
    } catch (err) {
      console.error("Error asignando cita a médico:", err);
      setError(err);
      return { success: false, error: err };
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────
  //  5. RECORDATORIOS Y NOTIFICACIONES
  // ─────────────────────────────────────────────────────────────────────

  /**
   * scheduleReminder:
   * Programa recordatorios para la cita (ej: integrar con un servicio de emails o SMS).
   */
  const scheduleReminder = useCallback(async (appointmentId, reminderData) => {
    console.log("Programando recordatorio para cita:", appointmentId, reminderData);
    // Aquí integrar con un servicio externo
    return { success: true };
  }, []);

  /**
   * sendNotification:
   * Envía notificaciones (push, email o SMS) a pacientes o personal.
   */
  const sendNotification = useCallback(async (notificationData) => {
    console.log("Enviando notificación:", notificationData);
    // Integrar con un servicio de notificaciones
    return { success: true };
  }, []);

  // ─────────────────────────────────────────────────────────────────────
  //  6. INFORMES Y ESTADÍSTICAS
  // ─────────────────────────────────────────────────────────────────────

  /**
   * generateReports:
   * Genera un reporte con estadísticas: total de citas, citas por especialidad,
   * por médico y por estado.
   */
  const generateReports = useCallback(() => {
    const report = {
      totalAppointments: appointments.length,
      bySpecialty: {},
      byDoctor: {},
      byStatus: {},
    };
    appointments.forEach((app) => {
      // Por especialidad
      if (app.specialty) {
        if (!report.bySpecialty[app.specialty]) {
          report.bySpecialty[app.specialty] = 0;
        }
        report.bySpecialty[app.specialty]++;
      }
      // Por médico
      if (app.doctorId) {
        if (!report.byDoctor[app.doctorId]) {
          report.byDoctor[app.doctorId] = 0;
        }
        report.byDoctor[app.doctorId]++;
      }
      // Por estado
      if (app.status) {
        if (!report.byStatus[app.status]) {
          report.byStatus[app.status] = 0;
        }
        report.byStatus[app.status]++;
      }
    });
    return report;
  }, [appointments]);

  // ─────────────────────────────────────────────────────────────────────
  //  7. INTEGRACIÓN CON OTROS SISTEMAS
  // ─────────────────────────────────────────────────────────────────────

  /**
   * integrateHCE:
   * Integra datos de la cita con un sistema de Historias Clínicas Electrónicas.
   */
  const integrateHCE = useCallback(async (appointmentId, hceData) => {
    console.log("Integrando HCE para cita:", appointmentId, hceData);
    // Implementa la integración con tu sistema de HCE
    return { success: true };
  }, []);

  /**
   * processPayment:
   * Integra la cita con el sistema de facturación y pagos.
   */
  const processPayment = useCallback(async (appointmentId, paymentData) => {
    console.log("Procesando pago para cita:", appointmentId, paymentData);
    // Implementa la integración con tu sistema de pagos/facturación
    return { success: true };
  }, []);

  // ─────────────────────────────────────────────────────────────────────
  //  8. EFECTOS SECUNDARIOS AL MONTAR
  // ─────────────────────────────────────────────────────────────────────

  // Cargar la lista de médicos y especialidades al iniciar
  useEffect(() => {
    fetchDoctors();
    fetchSpecialties();
  }, [fetchDoctors, fetchSpecialties]);

  // ─────────────────────────────────────────────────────────────────────
  //  9. VALOR DEL CONTEXTO
  // ─────────────────────────────────────────────────────────────────────

  const value = {
    // Estados
    appointments,
    patients,
    doctors,
    specialties,
    loading,
    error,
    APPOINTMENT_DURATION,

    // Métodos
    subscribeToAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsCountBySpecialty,
    getAppointmentsForView,
    filterAppointments,
    searchPatients,
    getPatientHistory,
    fetchDoctors,
    assignAppointmentToDoctor,
    scheduleReminder,
    sendNotification,
    generateReports,
    integrateHCE,
    processPayment,
  };

  return (
    <AppointmentsContext.Provider value={value}>
      {children}
    </AppointmentsContext.Provider>
  );
}

/**
 * Hook para consumir el contexto de citas en cualquier componente.
 */
export function useAppointments() {
  const context = useContext(AppointmentsContext);
  if (!context) {
    throw new Error(
      "useAppointments debe usarse dentro de un AppointmentsProvider"
    );
  }
  return context;
}

export default AppointmentsContext;
