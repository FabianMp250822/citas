"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { cn, formatDate } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CalendarIcon } from "lucide-react";
import toast from "react-hot-toast";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
// Importamos el hook del contexto de citas
import { useAppointments } from "@/store/citaStore";

const schema = z.object({
  patientName: z.string().optional(),
  patientId: z.string().optional(),
  phone: z.string().optional(),
  reason: z.string().optional(),
  appointmentType: z.string().optional(),
  doctorId: z.string().optional(),
});

const EventSheet = ({ open, onClose, event, selectedDate }) => {
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [appointmentTime, setAppointmentTime] = useState("12:00");
  const [birthDate, setBirthDate] = useState(new Date());
  const [isPending, startTransition] = React.useTransition();

  // Estados para el filtrado de especialidades y médicos
  const [specialtyQuery, setSpecialtyQuery] = useState("");
  const [doctorQuery, setDoctorQuery] = useState("");

  // Hook del contexto
  const {
    specialties = [],
    doctors = [],
    createAppointment,
    updateAppointment,
    deleteAppointment,
  } = useAppointments();

  // Filtrado de especialidades
  const filteredSpecialties = specialties.filter((type) => {
    const label = type.label || type;
    return label.toLowerCase().includes(specialtyQuery.toLowerCase());
  });

  // Filtrado de médicos
  const filteredDoctors = doctors.filter((doc) =>
    doc.name.toLowerCase().includes(doctorQuery.toLowerCase())
  );

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventIdToDelete, setEventIdToDelete] = useState(null);

  const {
    register,
    control,
    reset,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: zodResolver(schema),
    mode: "all",
  });

  const onSubmit = (data) => {
    startTransition(async () => {
      const combinedDate = new Date(appointmentDate);
      if (appointmentTime) {
        const [hours, minutes] = appointmentTime.split(":");
        combinedDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      }
      const appointmentData = {
        patientName: data.patientName,
        patientId: data.patientId,
        phone: data.phone,
        reason: data.reason,
        appointmentType: data.appointmentType,
        doctorId: data.doctorId,
        appointmentDate: combinedDate,
        birthDate,
      };

      if (!event) {
        const response = await createAppointment(appointmentData);
        if (response?.success) {
          toast.success("Cita creada exitosamente");
          reset();
          onClose();
        } else {
          toast.error("Error al crear la cita");
        }
      } else {
        const response = await updateAppointment(event?.event?.id, appointmentData);
        if (response?.success) {
          toast.success("Cita actualizada exitosamente");
          reset();
          onClose();
        } else {
          toast.error("Error al actualizar la cita");
        }
      }
    });
  };

  useEffect(() => {
    if (selectedDate) {
      setAppointmentDate(selectedDate.date);
    }
    if (event) {
      const start = new Date(event?.event?.start);
      setAppointmentDate(start);
      setAppointmentTime(start.toTimeString().slice(0, 5));
      const evtType = event?.event?.extendedProps?.calendar;
      if (evtType) {
        setValue("appointmentType", evtType);
        setSpecialtyQuery(evtType);
      }
      setValue("patientName", event?.event?.patientName || "");
      setValue("patientId", event?.event?.patientId || "");
      setValue("phone", event?.event?.phone || "");
      setValue("reason", event?.event?.reason || "");
      if (event?.event?.doctorId) {
        setValue("doctorId", event?.event?.doctorId);
        const found = doctors.find((d) => d.id === event?.event?.doctorId);
        if (found) {
          setDoctorQuery(found.name);
        }
      }
      if (event?.event?.birthDate) {
        setBirthDate(new Date(event?.event?.birthDate));
      }
    }
  }, [event, selectedDate, open, setValue, doctors]);

  const onDeleteEventAction = async () => {
    try {
      if (!eventIdToDelete) {
        toast.error("ID de cita no encontrado");
        return;
      }
      const response = await deleteAppointment(eventIdToDelete);
      if (response?.success) {
        toast.success("Cita eliminada exitosamente");
        reset();
        onClose();
      } else {
        toast.error("Error al eliminar la cita");
        reset();
        onClose();
      }
    } catch (error) {
      toast.error("Ocurrió un error");
    }
  };

  const handleOpenDeleteModal = (eventId) => {
    setEventIdToDelete(eventId);
    setDeleteModalOpen(true);
    onClose();
  };

  return (
    <>
      <DeleteConfirmationDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={onDeleteEventAction}
        defaultToast={false}
      />
      <Sheet open={open}>
        <SheetContent onPointerDownOutside={onClose} onClose={onClose} className="px-0">
          <SheetHeader className="px-6">
            <SheetTitle>{event ? "Editar Cita" : "Agendar Cita"}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 h-full">
            <form className="h-full" onSubmit={handleSubmit(onSubmit)}>
              <div className="h-[calc(100vh-130px)]">
                <ScrollArea className="h-full">
                  <div className="space-y-4 pb-5 px-6">
                    {/* Nombre del Paciente */}
                    <div className="space-y-1.5">
                      <Label htmlFor="patientName">Nombre del Paciente</Label>
                      <Input
                        id="patientName"
                        type="text"
                        placeholder="Ingrese el nombre completo"
                        {...register("patientName")}
                      />
                    </div>
                    {/* Número de Identificación */}
                    <div className="space-y-1.5">
                      <Label htmlFor="patientId">Número de Identificación</Label>
                      <Input
                        id="patientId"
                        type="text"
                        placeholder="Ingrese la cédula o historia clínica"
                        {...register("patientId")}
                      />
                    </div>
                    {/* Teléfono */}
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Teléfono de Contacto</Label>
                      <Input
                        id="phone"
                        type="text"
                        placeholder="Ingrese el teléfono"
                        {...register("phone")}
                      />
                    </div>
                    {/* Fecha de Nacimiento */}
                    <div>
                      <Label htmlFor="birthDate" className="mb-1.5">Fecha de Nacimiento</Label>
                      <Popover modal={false}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn("w-full justify-between text-left font-normal border-default-200 text-default-600", !birthDate && "text-muted-foreground")}
                          >
                            {birthDate ? formatDate(birthDate, "PPP") : "Seleccione una fecha"}
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Controller
                            name="birthDate"
                            control={control}
                            render={() => (
                              <Calendar mode="single" selected={birthDate} onSelect={setBirthDate} initialFocus />
                            )}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    {/* Motivo de la Consulta */}
                    <div className="space-y-1.5">
                      <Label htmlFor="reason">Motivo de la Consulta</Label>
                      <Input
                        id="reason"
                        type="text"
                        placeholder="Describa el motivo"
                        {...register("reason")}
                      />
                    </div>
                    {/* Fecha y Hora de la Cita */}
                    <div className="flex flex-col md:flex-row md:space-x-4">
                      {/* Fecha */}
                      <div className="flex-1">
                        <Label htmlFor="appointmentDate" className="mb-1.5">Fecha de la Cita</Label>
                        <Popover modal={false}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn("w-full justify-between text-left font-normal border-default-200 text-default-600", !appointmentDate && "text-muted-foreground")}
                            >
                              {appointmentDate ? formatDate(appointmentDate, "PPP") : "Seleccione la fecha"}
                              <CalendarIcon className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Controller
                              name="appointmentDate"
                              control={control}
                              render={() => (
                                <Calendar mode="single" selected={appointmentDate} onSelect={setAppointmentDate} initialFocus />
                              )}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      {/* Hora */}
                      <div className="flex-1">
                        <Label htmlFor="appointmentTime" className="mb-1.5">Hora de la Cita</Label>
                        <Input
                          id="appointmentTime"
                          type="time"
                          value={appointmentTime}
                          onChange={(e) => setAppointmentTime(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>
                    {/* Tipo de Consulta (Especialidad) */}
                    <div className="space-y-1.5">
                      <Label>Especialidad</Label>
                      {/* Usamos un Input simple con un popover de sugerencias */}
                      <Controller
                        name="appointmentType"
                        control={control}
                        render={({ field }) => (
                          <div className="relative">
                            <Input
                              placeholder="Escriba para filtrar especialidades..."
                              value={specialtyQuery}
                              onChange={(e) => {
                                const val = e.target.value;
                                console.log("Especialidad input:", val);
                                setSpecialtyQuery(val);
                              }}
                            />
                            {specialtyQuery && filteredSpecialties.length > 0 && (
                              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded">
                                {filteredSpecialties.map((type) => {
                                  const value = type.value || type;
                                  const label = type.label || type;
                                  return (
                                    <div
                                      key={value}
                                      className="cursor-pointer px-2 py-1 hover:bg-gray-100"
                                      onClick={() => {
                                      
                                        field.onChange(value);
                                        setSpecialtyQuery(label);
                                      }}
                                    >
                                      {label}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      />
                    </div>
                    {/* Seleccionar Médico */}
                    <div className="space-y-1.5">
                      <Label>Médico</Label>
                      <Controller
                        name="doctorId"
                        control={control}
                        render={({ field }) => (
                          <div className="relative">
                            <Input
                              placeholder="Escriba para filtrar médicos..."
                              value={doctorQuery}
                              onChange={(e) => {
                                const val = e.target.value;
                              
                                setDoctorQuery(val);
                              }}
                            />
                            {doctorQuery && filteredDoctors.length > 0 && (
                              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded">
                                {filteredDoctors.map((doc) => (
                                  <div
                                    key={doc.id}
                                    className="cursor-pointer px-2 py-1 hover:bg-gray-100"
                                    onClick={() => {
                                      console.log("Seleccionado médico:", doc.id);
                                      field.onChange(doc.id);
                                      setDoctorQuery(doc.name);
                                    }}
                                  >
                                    {doc.name}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </ScrollArea>
              </div>
              <div className="pb-12 flex flex-wrap gap-2 px-6">
                <Button type="submit" disabled={isPending} className="flex-1">
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {event ? "Actualizando..." : "Agendando..."}
                    </>
                  ) : event ? (
                    "Actualizar Cita"
                  ) : (
                    "Agendar Cita"
                  )}
                </Button>
                {event && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleOpenDeleteModal(event?.event?.id)}
                    className="flex-1"
                  >
                    Eliminar
                  </Button>
                )}
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default EventSheet;
