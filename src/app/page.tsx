"use client";
import React from "react";
import Confirmacion from "../components/confirmacion";
export default function Home() {
  const [isOpen, setIsOpen] = React.useState(false);
  const handleConfirmacion = (confirmed: boolean) => {
    if (confirmed) {
      console.log("Confirmed");
    } else {
      console.log("Cancelled");
    }
  };

  return (
    <div className="grid gap-8 bg-gray-100 font-[family-name:var(--font-geist-sans)]">
      {/* Info Home */}
      <Confirmacion
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        titulo="Confirmación"
        mensaje="¿Está seguro de que desea continuar?"
        onConfirm={handleConfirmacion}
      />
      <div className="flex justify-center items-center py-12">
        <h1 className="text-2xl font-bold">Welcome to the EKLIPSE HOME!</h1>
      </div>
    </div>
  );
}
