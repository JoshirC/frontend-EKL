"use client";
import React, { useEffect } from "react";

interface CargandoProps {
  isOpen: boolean;
  mensaje: string;
  onClose?: () => void;
}

const Cargando: React.FC<CargandoProps> = ({ isOpen, mensaje, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) {
    if (onClose) onClose();
    return null;
  }

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/60 z-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="p-6 w-full max-w-md mx-4">
        <div className="flex flex-col items-center">
          {/* Spinner de carga */}
          <div className="w-12 h-12 border-4 border-orange-300 border-t-orange-500 rounded-full animate-spin mb-4"></div>
          {/* Título  */}
          <h2 className="text-xl text-center font-bold text-white mb-4">
            {mensaje}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default Cargando;
