"use client";
import React, { useState } from "react";
import EnvioSugerencias from "@/components/envioSugerencias";
export default function Home() {
  const [openSugerencia, setOpenSugerencia] = useState(false);
  return (
    <div className="grid gap-8 bg-gray-100 font-[family-name:var(--font-geist-sans)]">
      <EnvioSugerencias
        isOpen={openSugerencia}
        onClose={() => setOpenSugerencia(false)}
      />
      <div className="flex justify-center items-center py-12">
        <h1 className="text-2xl font-bold">Welcome to the EKLIPSE HOME!</h1>
      </div>
      <button
        className="fixed bottom-8 right-8 bg-orange-400 text-white font-semibold p-3 sm:p-4 rounded hover:bg-orange-500 transition duration-300 w-full sm:w-auto whitespace-nowrap"
        onClick={() => setOpenSugerencia(true)}
      >
        Sugerencias
      </button>
    </div>
  );
}
