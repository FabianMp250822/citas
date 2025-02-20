"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { Checkbox } from "@/components/ui/checkbox";

// Importa la imagen del logo
import logo from "@/public/images/auth/logo.png";
import { useMediaQuery } from "@/hooks/use-media-query";

// Importa el store de autenticación
import useAuthenticationStore from "@/store/autenticationStore";

const schema = z.object({
  email: z.string().email({ message: "El correo no es válido." }),
  password: z.string().min(4, { message: "La contraseña debe tener al menos 4 caracteres." }),
});

const LogInForm = () => {
  const [isPending, startTransition] = React.useTransition();
  const isDesktop2xl = useMediaQuery("(max-width: 1530px)");

  // Extrae funciones y estados del store, incluyendo initializeAuth
  const { login, error, loading, initializeAuth } = useAuthenticationStore();

  // Inicializa Firebase Auth para actualizar el estado y habilitar los inputs
  useEffect(() => {
    if (initializeAuth) {
      initializeAuth();
    }
  }, [initializeAuth]);

  // Control para alternar la visibilidad de la contraseña
  const [passwordType, setPasswordType] = useState("password");
  const togglePasswordType = () => {
    setPasswordType(passwordType === "password" ? "text" : "password");
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    mode: "all",
    defaultValues: {
      email: "ejemplo@correo.com",
      password: "contraseña",
    },
  });

  // Saludo motivador
  const [saludo, setSaludo] = useState("");
  const getSaludo = () => {
    const hora = new Date().getHours();
    let frases = [];
    if (hora < 12) {
      frases = [
        "¡Buenos días! Empieza el día con energía.",
        "¡Despierta y brilla! Hoy es un gran día.",
        "¡Mañana espléndida, llena de oportunidades!",
      ];
    } else if (hora < 18) {
      frases = [
        "¡Buenas tardes! Sigue brillando.",
        "¡Tardes llenas de inspiración, sigue adelante!",
        "¡Que tu tarde esté llena de logros!",
      ];
    } else {
      frases = [
        "¡Buenas noches! El descanso es vital.",
        "¡Noche de paz, sueña en grande!",
        "¡Que tengas una noche reparadora y llena de inspiración!",
      ];
    }
    const indiceAleatorio = Math.floor(Math.random() * frases.length);
    return frases[indiceAleatorio];
  };

  useEffect(() => {
    setSaludo(getSaludo());
  }, []);

  const onSubmit = (data) => {
    startTransition(async () => {
      // Llama a la función de login y guarda el resultado
      const result = await login(data.email, data.password);
      if (result) {
        toast.success("Inicio de sesión exitoso");
        reset();
        window.location.assign("/dashboard");
      } else {
        toast.error(error || "Error al iniciar sesión");
      }
    });
  };

  const isLoading = isPending || loading;

  return (
    <div className="w-full py-5 lg:py-10">
      <Link href="/dashboard" className="inline-block">
        <Image
          src={logo}
          alt="Logo"
          
        />
      </Link>
      <div className="2xl:mt-8 mt-6 2xl:text-3xl text-2xl font-bold text-default-900">
        {saludo}
      </div>
      <div className="2xl:text-lg text-base text-default-600 mt-2 leading-6">
        Ingresa la información que utilizaste al registrarte.
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 xl:mt-7">
        <div className="relative">
          <Label htmlFor="email" className="mb-2 font-medium text-default-600">
            Correo electrónico
          </Label>
          <Input
            disabled={isLoading}
            {...register("email")}
            type="email"
            id="email"
            className={cn("peer", { "border-destructive": errors.email })}
            size={!isDesktop2xl ? "xl" : "lg"}
            placeholder="Ingrese su correo"
          />
        </div>
        {errors.email && (
          <div className="text-destructive mt-2">{errors.email.message}</div>
        )}
        <div className="mt-3.5">
          <Label htmlFor="password" className="mb-2 font-medium text-default-600">
            Contraseña
          </Label>
          <div className="relative">
            <Input
              disabled={isLoading}
              {...register("password")}
              type={passwordType}
              id="password"
              className="peer"
              size={!isDesktop2xl ? "xl" : "lg"}
              placeholder="Ingrese su contraseña"
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 ltr:right-4 rtl:left-4 cursor-pointer"
              onClick={togglePasswordType}
            >
              {passwordType === "password" ? (
                <Icon icon="heroicons:eye" className="w-5 h-5 text-default-400" />
              ) : (
                <Icon icon="heroicons:eye-slash" className="w-5 h-5 text-default-400" />
              )}
            </div>
          </div>
        </div>
        {errors.password && (
          <div className="text-destructive mt-2">{errors.password.message}</div>
        )}
        <div className="mt-5 mb-8 flex flex-wrap gap-2">
          <div className="flex-1 flex items-center gap-1.5">
            <Checkbox size="sm" className="border-default-300 mt-[1px]" id="isRemebered" />
            <Label
              htmlFor="isRemebered"
              className="text-sm text-default-600 cursor-pointer whitespace-nowrap"
            >
              Recuérdame
            </Label>
          </div>
          <Link href="/auth/forgot3" className="flex-none text-sm text-primary">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <Button className="w-full" disabled={isLoading} size={!isDesktop2xl ? "lg" : "md"}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Cargando..." : "Iniciar sesión"}
        </Button>
      </form>
    </div>
  );
};

export default LogInForm;
