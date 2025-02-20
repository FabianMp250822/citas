"use client";
import React from "react";
import { cn } from "@/lib/utils";

const AddBlock = ({
  className,
  title = "Clínica de la Costa",
  desc = "La Clínica de la Costa es un prestigioso centro de salud con años de experiencia, ofreciendo servicios médicos de alta calidad en la región.",
}) => {
  return (
    <div
      className={cn(
        "bg-primary dark:bg-default-400 text-primary-foreground pt-5 pb-4 px-4 rounded m-3 hidden xl:block",
        className
      )}
    >
      <div className="text-base font-semibold text-primary-foreground">
        {title}
      </div>
      <div className="text-sm text-primary-foreground">{desc}</div>

      <div className="text-sm font-semibold text-primary-foreground flex items-center gap-2 mt-4">
        <a
          href="https://clinicadelacosta.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:no-underline"
        >
          Visitar sitio web
        </a>
      </div>
    </div>
  );
};

export default AddBlock;
