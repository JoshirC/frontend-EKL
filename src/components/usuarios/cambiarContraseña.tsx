"use client";

import React, { useState, useEffect } from "react";

interface CambiarContraseñaProps {
  rutUsuario: string;
  isOpen: boolean;
  onClose: () => void;
}

const CambiarContraseña: React.FC<CambiarContraseñaProps> = ({
  rutUsuario,
  isOpen,
  onClose,
}) => {
  const [nuevaContraseña, setNuevaContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white opacity-100 w-full max-w-md rounded-lg shadow-lg p-8 max-h-[90vh] overflow-y-auto">
            <h1 className="text-2xl font-bold mb-4 text-center">
              Cambiar Contraseña
            </h1>
            <h2 className="text-sm mb-4 text-center">
              Genera una nueva contraseña para el usuario {rutUsuario}.
            </h2>
            <input
              type="password"
              placeholder="Nueva contraseña"
              className="block w-full mt-4 p-2 border border-gray-300 rounded"
              onChange={(e) => setNuevaContraseña(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              className="block w-full mt-4 p-2 border border-gray-300 rounded"
              onChange={(e) => setConfirmarContraseña(e.target.value)}
            />
            <div className="flex flex-col space-y-4">
              <button
                className="bg-orange-400 hover:bg-orange-500 font-semibold text-white px-4 py-2 rounded mt-4 w-full"
                onClick={() => {
                  if (nuevaContraseña === confirmarContraseña) {
                    console.log("Contraseña cambiada");
                    //fecth a cambiar contraseña
                  }
                }}
              >
                Cambiar contraseña
              </button>
              <button
                className="bg-gray-400 hover:bg-gray-500 font-semibold text-white px-4 py-2 rounded w-full"
                onClick={onClose}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CambiarContraseña;
