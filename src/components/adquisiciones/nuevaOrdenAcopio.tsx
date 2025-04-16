"use client";
import React, { useState, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NuevaOrdenAcopio: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [archivo, setArchivo] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    1;
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleClose = () => {
    setArchivo(null); // Limpiar el archivo seleccionado al cerrar el modal
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white opacity-100 w-full max-w-md rounded-lg shadow-lg p-8 max-h-[90vh] overflow-y-auto">
            <h1 className="text-2xl font-bold mb-4 text-center">
              Orden de Acopio
            </h1>
            <h2 className="text-sm mb-4 text-center">
              Ingresa un archivo de Excel con los datos del consolidado.
            </h2>
            {/* Casilla para ingreso de archivo EXCEL */}
            <input
              type="file"
              accept=".xlsx, .xls"
              className="block w-full mt-4 text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:font-semibold file:bg-amber-400 file:text-white hover:file:bg-amber-500 file:cursor-pointer  border border-gray-300 rounded"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setArchivo(e.target.files[0]);
                }
              }}
            />
            {/* Botón para subir archivo */}

            <button className="bg-orange-400 text-white font-bold py-2 px-4 rounded hover:bg-orange-500 transition duration-300 w-full mt-18">
              Subir Archivo
            </button>

            {/* Botón para cerrar el modal */}

            <button
              onClick={handleClose}
              className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 transition duration-300 w-full mt-6"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NuevaOrdenAcopio;
