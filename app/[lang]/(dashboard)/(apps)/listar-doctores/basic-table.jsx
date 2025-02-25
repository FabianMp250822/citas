"use client";

import { useState, useEffect } from "react";
import { useDoctors } from "@/store/doctorContex";      
import { useAppointments } from "@/store/citaStore";     
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

export default function ListDoctors() {
  const { doctors, loading, error } = useDoctors();
  const { subscribeToAppointments, appointments } = useAppointments();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointments, setSelectedAppointments] = useState([]);

  // Estados para la búsqueda
  const [searchName, setSearchName] = useState("");
  const [searchSpecialty, setSearchSpecialty] = useState("");

  // Nos suscribimos a las citas al montar el componente
  useEffect(() => {
    const unsubscribe = subscribeToAppointments();
    return () => unsubscribe && unsubscribe();
  }, [subscribeToAppointments]);

  if (loading) return <p>Cargando doctores...</p>;
  if (error) return <p>Error al cargar doctores</p>;

  // Filtramos la lista de doctores según búsqueda
  const filteredDoctors = doctors.filter((doctor) => {
    const nameMatch = doctor.doctorName
      .toLowerCase()
      .includes(searchName.toLowerCase());
    const specialtyMatch = doctor.specialty
      .toLowerCase()
      .includes(searchSpecialty.toLowerCase());
    return nameMatch && specialtyMatch;
  });

  // Limitamos la visualización a 10 doctores
  const displayedDoctors = filteredDoctors.slice(0, 10);

  // Filtrar las citas del doctor seleccionado
  const doctorAppointments = selectedDoctor
    ? appointments.filter((app) => app.doctorId === selectedDoctor.id)
    : [];

  // Extraer las fechas (como objetos Date) de las citas del doctor
  const appointmentDates = doctorAppointments.map((app) => {
    return app.appointmentDate?.toDate
      ? app.appointmentDate.toDate()
      : new Date(app.appointmentDate);
  });

  // Función para manejar la selección de una fecha en el calendario
  const handleDateSelect = (selected) => {
    if (!selected) return;
    // Si el calendario está en modo "multiple", selected puede ser un array
    const date =
      Array.isArray(selected) && selected.length
        ? selected[selected.length - 1]
        : selected;

    // Verificar si la fecha seleccionada tiene alguna cita (comparando solo la parte de la fecha)
    const dayMatch = appointmentDates.find(
      (d) => d.toDateString() === date.toDateString()
    );
    if (dayMatch) {
      // Filtrar las citas que corresponden a esa fecha
      const appsForDay = doctorAppointments.filter((app) => {
        const appDate = app.appointmentDate?.toDate
          ? app.appointmentDate.toDate()
          : new Date(app.appointmentDate);
        return appDate.toDateString() === date.toDateString();
      });
      if (appsForDay.length > 0) {
        setSelectedAppointments(appsForDay);
        setModalOpen(true);
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Lista de Doctores</h2>

      {/* Buscadores */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="border rounded p-2"
        />
        <input
          type="text"
          placeholder="Buscar por especialidad..."
          value={searchSpecialty}
          onChange={(e) => setSearchSpecialty(e.target.value)}
          className="border rounded p-2"
        />
      </div>

      {/* Tabla de doctores con scroll (solo muestra 10) */}
      <div className="max-h-[400px] overflow-y-auto border rounded">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">Nombre</th>
              <th className="py-2 text-left">Especialidad</th>
              <th className="py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {displayedDoctors.map((doctor) => (
              <tr key={doctor.id} className="border-b">
                <td className="py-2">{doctor.doctorName}</td>
                <td className="py-2">{doctor.specialty}</td>
                <td className="py-2">
                  <Button onClick={() => setSelectedDoctor(doctor)}>
                    Ver detalles
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Panel de detalles del doctor seleccionado */}
      {selectedDoctor && (
        <div className="p-4 border rounded-lg space-y-4">
          <h3 className="text-lg font-medium">Detalles del Doctor</h3>
          <p>
            <strong>Nombre:</strong> {selectedDoctor.doctorName}
          </p>
          <p>
            <strong>Especialidad:</strong> {selectedDoctor.specialty}
          </p>
          <p>
            <strong>Consultorio:</strong> {selectedDoctor.consultingRoom}
          </p>
          <p>
            <strong>Máximo de pacientes/día:</strong>{" "}
            {selectedDoctor.maxPatients}
          </p>

          <h4 className="text-base font-medium">Calendario de Citas</h4>
          <Calendar
            mode="multiple"
            selected={appointmentDates}
            onSelect={handleDateSelect}
            className="rounded-md border"
          />
        </div>
      )}

      {/* Modal para mostrar los detalles de las citas en la fecha seleccionada */}
      {modalOpen && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Citas para el día seleccionado</DialogTitle>
              <DialogDescription>
                A continuación se muestran las citas programadas para el día.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              {selectedAppointments.map((app, index) => (
                <div key={index} className="border p-2 rounded">
                  <p>
                    <strong>Paciente:</strong> {app.patientName || "N/A"}
                  </p>
                  <p>
                    <strong>Fecha:</strong>{" "}
                    {app.appointmentDate?.toDate
                      ? app.appointmentDate.toDate().toLocaleString()
                      : new Date(app.appointmentDate).toLocaleString()}
                  </p>
                  <p>
                    <strong>Estado:</strong> {app.status || "N/A"}
                  </p>
                  {/* Puedes agregar más detalles si lo requieres */}
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <DialogClose asChild>
                <Button variant="outline">Cerrar</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
