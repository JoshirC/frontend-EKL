"use client";

import React, { useState, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  titulo?: string;
  mensaje?: string;
  onClose: () => void;
  onCargaCompleta?: () => void;
}
const Confirmacion: React.FC<ModalProps> = ({
  isOpen,
  titulo,
  mensaje,
  onClose,
  onCargaCompleta,
}) => {
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/60 z-50 sm:px-4 px-12" ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl text-center font-semibold mb-4">{titulo}</h2>
        <p className="text-lg text-center">{mensaje}</p>
        <div className="">
          <button
            className="bg-orange-400 text-white font-bold py-2 px-4 rounded hover:bg-orange-500 transition duration-300 w-full mt-6"
            onClick={() => {
              onCargaCompleta && onCargaCompleta();
              onClose();
            }}
          >
            Confirmar
          </button>
          <button
            className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 transition duration-300 w-full mt-6"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
export default Confirmacion;
