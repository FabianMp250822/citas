"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { useDoctors } from "@/store/doctorContex"; 

// Definición del esquema con Zod
const doctorSchema = z.object({
  doctorName: z
    .string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres." })
    .max(50, { message: "El nombre no debe exceder 50 caracteres." }),
  specialty: z
    .string()
    .min(3, { message: "La especialidad debe tener al menos 3 caracteres." }),
  consultingRoom: z.string().min(1, { message: "El consultorio es requerido." }),
  scheduleType: z.enum(["cyclic", "variable"], {
    errorMap: () => ({ message: "Seleccione un tipo de horario." }),
  }),
  // Para horario cíclico se espera un arreglo de fechas (días seleccionados)
  cyclicSchedule: z.array(z.date()).optional(),
  // Para horario variable se espera un arreglo de fechas específicas
  variableSchedule: z.array(z.date()).optional(),
  maxPatients: z
    .number({ invalid_type_error: "El número máximo debe ser un valor numérico." })
    .min(1, { message: "Debe aceptar al menos 1 paciente por día." }),
});

const CreateDoctorForm = () => {
  // Extraemos la función createDoctor del contexto
  const { createDoctor } = useDoctors();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      doctorName: "",
      specialty: "",
      consultingRoom: "",
      scheduleType: "cyclic", // valor por defecto
      cyclicSchedule: [],
      variableSchedule: [],
      maxPatients: 1,
    },
  });

  // Observamos el tipo de horario
  const scheduleType = watch("scheduleType");

  // Para el horario variable, usamos un estado local para la fecha a agregar
  const [variableDate, setVariableDate] = useState("");

  // Manejo de fechas agregadas para el horario variable
  const variableSchedule = watch("variableSchedule") || [];

  const addVariableDate = () => {
    if (!variableDate) return;
    // Convertir el string de input a Date
    const dateToAdd = new Date(variableDate);
    // Actualizamos el arreglo en el form
    setValue("variableSchedule", [...variableSchedule, dateToAdd]);
    setVariableDate("");
  };

  const onSubmit = async (data) => {
    // Validar que según el tipo se haya seleccionado al menos una fecha
    if (data.scheduleType === "cyclic" && (!data.cyclicSchedule || data.cyclicSchedule.length === 0)) {
      return toast({
        title: "Error",
        description: "Seleccione al menos un día para el horario cíclico.",
        variant: "destructive",
      });
    }
    if (data.scheduleType === "variable" && (!data.variableSchedule || data.variableSchedule.length === 0)) {
      return toast({
        title: "Error",
        description: "Agregue al menos una fecha para el horario variable.",
        variant: "destructive",
      });
    }

    // Llamamos a la función del contexto para crear el doctor
    const result = await createDoctor(data);

    if (result.success) {
      toast({
        title: "Doctor creado",
        description: `El doctor se creó correctamente. ID: ${result.id}`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Nombre del Doctor */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="doctorName">Nombre del Doctor</Label>
        <Input
          id="doctorName"
          placeholder="Ingrese el nombre del doctor"
          {...register("doctorName")}
          className={errors.doctorName ? "border-destructive" : ""}
        />
        {errors.doctorName && (
          <p className="text-xs text-destructive">{errors.doctorName.message}</p>
        )}
      </div>

      {/* Especialidad */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="specialty">Especialidad</Label>
        <Input
          id="specialty"
          placeholder="Ingrese la especialidad"
          {...register("specialty")}
          className={errors.specialty ? "border-destructive" : ""}
        />
        {errors.specialty && (
          <p className="text-xs text-destructive">{errors.specialty.message}</p>
        )}
      </div>

      {/* Consultorio */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="consultingRoom">Consultorio</Label>
        <Input
          id="consultingRoom"
          placeholder="Ingrese el consultorio"
          {...register("consultingRoom")}
          className={errors.consultingRoom ? "border-destructive" : ""}
        />
        {errors.consultingRoom && (
          <p className="text-xs text-destructive">{errors.consultingRoom.message}</p>
        )}
      </div>

      {/* Tipo de Horario */}
      <div className="flex flex-col gap-2">
        <Label>Tipo de Horario</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-1">
            <Input type="radio" value="cyclic" {...register("scheduleType")} defaultChecked />
            Cíclico
          </label>
          <label className="flex items-center gap-1">
            <Input type="radio" value="variable" {...register("scheduleType")} />
            Variable
          </label>
        </div>
        {errors.scheduleType && (
          <p className="text-xs text-destructive">{errors.scheduleType.message}</p>
        )}
      </div>

      {/* Horario Cíclico */}
      {scheduleType === "cyclic" && (
        <div className="flex flex-col gap-2">
          <Label>Selecciona los días de atención (horario cíclico)</Label>
          <Controller
            control={control}
            name="cyclicSchedule"
            render={({ field: { onChange, value } }) => (
              <Calendar
                mode="multiple"
                selected={value}
                onSelect={(selected) => onChange(selected)}
                className="rounded-md border"
              />
            )}
          />
          {errors.cyclicSchedule && (
            <p className="text-xs text-destructive">{errors.cyclicSchedule.message}</p>
          )}
        </div>
      )}

      {/* Horario Variable */}
      {scheduleType === "variable" && (
        <div className="flex flex-col gap-2">
          <Label>Agrega las fechas de atención (horario variable)</Label>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={variableDate}
              onChange={(e) => setVariableDate(e.target.value)}
              className="max-w-xs"
            />
            <Button type="button" onClick={addVariableDate}>
              Agregar Fecha
            </Button>
          </div>
          {variableSchedule.length > 0 && (
            <ul className="mt-2 space-y-1">
              {variableSchedule.map((date, index) => (
                <li key={index} className="text-sm">
                  {new Date(date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          )}
          {errors.variableSchedule && (
            <p className="text-xs text-destructive">{errors.variableSchedule.message}</p>
          )}
        </div>
      )}

      {/* Número máximo de pacientes por día */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="maxPatients">Máximo de pacientes por día</Label>
        <Input
          id="maxPatients"
          type="number"
          {...register("maxPatients", { valueAsNumber: true })}
          className={errors.maxPatients ? "border-destructive" : ""}
        />
        {errors.maxPatients && (
          <p className="text-xs text-destructive">{errors.maxPatients.message}</p>
        )}
      </div>

      <Button type="submit">Crear Doctor</Button>
    </form>
  );
};

export default CreateDoctorForm;
