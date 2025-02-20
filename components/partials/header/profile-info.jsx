"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import useAuthenticationStore from "@/store/autenticationStore";
import { useRouter } from "next/navigation"; // <-- Importante
import defaultAvatar from "@/public/images/auth/github.png";

const ProfileInfo = () => {
  const router = useRouter(); // <-- Hook para redirección
  const { user, role, logout, loading } = useAuthenticationStore();

  if (loading) {
    return <div>Loading user data...</div>;
  }

  if (!user) {
    return (
      <div className="flex items-center">
        <Image
          src={defaultAvatar}
          alt="Usuario Desconocido"
          width={36}
          height={36}
          className="rounded-full"
        />
        <span className="ml-2">Usuario Desconocido</span>
      </div>
    );
  }

  const fullName =
    user.nombres && user.apellidos
      ? `${user.nombres} ${user.apellidos}`
      : user.name || "Usuario Desconocido";
  const photo = user.photo || user.image || defaultAvatar;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <div className="flex items-center">
          <Image
            src={photo}
            alt={fullName}
            width={36}
            height={36}
            className="rounded-full"
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 p-0" align="end">
        <DropdownMenuLabel className="flex gap-2 items-center mb-1 p-3">
          <Image
            src={photo}
            alt={fullName}
            width={36}
            height={36}
            className="rounded-full"
          />
          <div>
            <div className="text-sm font-medium text-default-800 capitalize">
              {fullName}
            </div>
            <div className="text-xs text-default-600 hover:text-primary">
              {role || "Sin rol"}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="mb-0 dark:bg-background" />
        <DropdownMenuItem
          onSelect={async () => {
            await logout();
            router.push("/auth/login5"); // Redirige a /auth/login5
          }}
          className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize my-1 px-3 dark:hover:bg-background cursor-pointer"
        >
          <Icon icon="heroicons:power" className="w-4 h-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileInfo;
