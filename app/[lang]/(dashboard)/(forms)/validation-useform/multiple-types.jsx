"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  agentName: z
    .string()
    .min(3, { message: "El nombre del agente debe tener al menos 3 caracteres." })
    .max(50, { message: "El nombre del agente no debe exceder 50 caracteres." }),
  // El campo phone ahora es opcional y sin validación de longitud
  phone: z.string().optional(),
  email: z.string().email({ message: "Ingrese una dirección de correo válida." }),
  // Nuevo campo: Contraseña para la creación del usuario en Firebase
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres." })
    .max(20, { message: "La contraseña no debe exceder 20 caracteres." })
    .refine(
      (value) =>
        /[a-z]/.test(value) && // al menos una letra minúscula
        /[A-Z]/.test(value) && // al menos una letra mayúscula
        /\d/.test(value) && // al menos un dígito
        /[!@#$%^&*(),.?":{}|<>]/.test(value), // al menos un caracter especial
      {
        message:
          "La contraseña debe incluir mayúsculas, minúsculas, números y caracteres especiales.",
      }
    ),
  city: z.string().min(3, { message: "Ingrese al menos 3 caracteres para la ciudad." }),
  sucursal: z.string().min(3, { message: "Ingrese al menos 3 caracteres para la sucursal." }),
  inputMessage: z
    .string()
    .max(30, { message: "El mensaje no debe exceder 30 caracteres." }),
  agentCode: z.string(),
  department: z.string().optional(),
});

const MultipleTypes = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  // Función para generar un código de agente único (ejemplo: "AG" seguido de 5 dígitos aleatorios)
  const generateAgentCode = () => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `AG${randomNum}`;
  };

  // Al montar el componente, se genera el código de agente y se establece en el formulario
  useEffect(() => {
    const code = generateAgentCode();
    setValue("agentCode", code);
  }, [setValue]);

  const onSubmit = async (data) => {
    try {
      // Realizamos la llamada al endpoint de la función de Firebase
      const response = await fetch(
        "https://us-central1-imedic-a44f2.cloudfunctions.net/createAgent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear agente");
      }

      const result = await response.json();

      toast({
        title: "Agente creado correctamente",
        description: `UID: ${result.uid}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Nombre del Agente */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="agentName"
            className={cn("", { "text-destructive": errors.agentName })}
          >
            Nombre del Agente
          </Label>
          <Input
            type="text"
            {...register("agentName")}
            placeholder="Ingrese el nombre del agente"
            className={cn("", {
              "border-destructive focus:border-destructive": errors.agentName,
            })}
          />
          {errors.agentName && (
            <p className="text-xs text-destructive">
              {errors.agentName.message}
            </p>
          )}
        </div>

        {/* Número de Teléfono */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="phone"
            className={cn("", { "text-destructive": errors.phone })}
          >
            Número de Teléfono
          </Label>
          <Input
            type="number"
            placeholder="11 dígitos (opcional)"
            {...register("phone")}
            className={cn("", {
              "border-destructive focus:border-destructive": errors.phone,
            })}
          />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>

        {/* Correo Electrónico */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="email"
            className={cn("", { "text-destructive": errors.email })}
          >
            Correo Electrónico
          </Label>
          <Input
            type="email"
            placeholder="correo@ejemplo.com"
            {...register("email")}
            className={cn("", {
              "border-destructive focus:border-destructive": errors.email,
            })}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Campo de Contraseña para Firebase */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="password"
            className={cn("", { "text-destructive": errors.password })}
          >
            Contraseña
          </Label>
          <Input
            type="password"
            placeholder="Ingrese su contraseña"
            {...register("password")}
            className={cn("", {
              "border-destructive focus:border-destructive": errors.password,
            })}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        {/* Ciudad */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="city"
            className={cn("", { "text-destructive": errors.city })}
          >
            Ciudad
          </Label>
          <Input
            type="text"
            placeholder="Ingrese la ciudad"
            {...register("city")}
            className={cn("", { "border-destructive": errors.city })}
          />
          {errors.city && (
            <p className="text-xs text-destructive">{errors.city.message}</p>
          )}
        </div>

        {/* Sucursal */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="sucursal"
            className={cn("", { "text-destructive": errors.sucursal })}
          >
            Sucursal
          </Label>
          <Input
            type="text"
            {...register("sucursal")}
            placeholder="Ingrese la sucursal"
            className={cn("", {
              "border-destructive focus:border-destructive": errors.sucursal,
            })}
          />
          {errors.sucursal && (
            <p className="text-xs text-destructive">{errors.sucursal.message}</p>
          )}
        </div>

        {/* Mensaje */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="inputMessage"
            className={cn("", { "text-destructive": errors.inputMessage })}
          >
            Mensaje
          </Label>
          <Textarea
            {...register("inputMessage")}
            placeholder="Máximo 30 caracteres"
            id="inputMessage"
            className={cn("", {
              "border-destructive focus:border-destructive": errors.inputMessage,
            })}
          />
          {errors.inputMessage && (
            <p className="text-xs text-destructive">
              {errors.inputMessage.message}
            </p>
          )}
        </div>

        {/* Código de Agente (Generado Automáticamente) */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="agentCode">Código de Agente</Label>
          <Input
            type="text"
            {...register("agentCode")}
            disabled
            placeholder="Se generará automáticamente"
          />
        </div>

        {/* Departamento (Opcional) */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="department">Departamento</Label>
          <Input
            type="text"
            {...register("department")}
            placeholder="Ingrese el departamento (opcional)"
          />
        </div>
      </div>
      <div className="mt-2">
        <Button type="submit">Enviar</Button>
      </div>
    </form>
  );
};

export default MultipleTypes;
