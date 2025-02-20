"use client";
import React from "react";
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
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@/hooks/use-media-query";
import Image from "next/image";

// Importa las funciones de Firebase para restablecer contraseña
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebaseConfig";

// Importa el logo
import logo from "@/public/images/auth/logo.png";

const schema = z.object({
  email: z.string().email({ message: "El correo no es válido." }),
});

const ForgotForm = () => {
  const [isPending, startTransition] = React.useTransition();
  const isDesktop2xl = useMediaQuery("(max-width: 1530px)");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "all",
  });

  const onSubmit = (data) => {
    startTransition(async () => {
      try {
        await sendPasswordResetEmail(auth, data.email);
        toast.success("Se ha enviado el correo para restablecer la contraseña.");
        reset();
        router.push("/auth/create-password3");
      } catch (error) {
        toast.error("Error al enviar el correo: " + error.message);
      }
    });
  };

  return (
    <div className="w-full">
      <Link href="/dashboard" className="inline-block">
        <Image
          src={logo}
          alt="Logo"
       
        />
      </Link>
      <div className="2xl:mt-8 mt-6 2xl:text-3xl text-2xl font-bold text-default-900">
        ¿Olvidaste tu contraseña?
      </div>
      <div className="2xl:text-lg text-base text-default-600 mt-2 leading-6">
        Ingresa tu correo y se enviarán instrucciones para restablecerla.
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 xl:mt-7">
        <div className="relative">
          <Input
            removeWrapper
            type="email"
            id="email"
            size={!isDesktop2xl ? "xl" : "lg"}
            placeholder=" "
            disabled={isPending}
            {...register("email")}
            className={cn("peer", {
              "border-destructive": errors.email,
            })}
          />
          <Label
            htmlFor="email"
            className="absolute text-base text-default-600 duration-300 transform -translate-y-5 scale-75 top-2 z-10 origin-[0] bg-background px-2 peer-focus:px-2
              peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 
              peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
          >
            Correo electrónico
          </Label>
        </div>
        {errors.email && (
          <div className="text-destructive mt-2">{errors.email.message}</div>
        )}

        <Button className="w-full mt-6" size={!isDesktop2xl ? "lg" : "md"}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Enviando..." : "Enviar correo de recuperación"}
        </Button>
      </form>
      <div className="mt-5 2xl:mt-8 text-center text-base text-default-600">
        Olvídalo. Regresa a{" "}
        <Link href="/auth/login5" className="text-primary">
          Iniciar sesión
        </Link>
      </div>
    </div>
  );
};

export default ForgotForm;
