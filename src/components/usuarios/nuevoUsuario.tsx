"use client";
import React, { useState, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const NuevoUsuario: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [nombre, setNombre] = useState<string>("");
  const [rut, setRut] = useState<string>("");
  const [correo, setCorreo] = useState<string>("");
  const [rol, setRol] = useState<string>("");
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white opacity-100 w-full max-w-md rounded-lg shadow-lg p-8 max-h-[90vh] overflow-y-auto">
            <h1 className="text-2xl font-bold mb-4 text-center">
              Nuevo Usuario
            </h1>
            <h2 className="text-sm mb-4 text-center">
              Ingresa los datos del nuevo usuario.
            </h2>
            {/* Campos de texto para crear el nuevo usuario */}
            <input
              type="text"
              value={rut}
              placeholder="Rut"
              className="block w-full mt-4 p-2 border border-gray-300 rounded"
              onChange={(e) => setRut(e.target.value)}
            />
            <input
              type="text"
              value={nombre}
              placeholder="Nombre"
              className="block w-full mt-4 p-2 border border-gray-300 rounded"
              onChange={(e) => setNombre(e.target.value)}
            />
            <input
              type="email"
              value={correo}
              placeholder="Correo"
              className="block w-full mt-4 p-2 border border-gray-300 rounded"
              onChange={(e) => setCorreo(e.target.value)}
            />
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="block w-full mt-4 p-2 border border-gray-300 rounded"
            >
              <option value="" disabled>
                Selecciona un rol
              </option>
              <option>Administrador</option>
              <option>Adquisiciones</option>
              <option>Jede Bodega</option>
              <option>Bodeguero</option>
            </select>
            {/* Botón para crear el nuevo usuario */}
            <button className="bg-amber-400 text-white font-bold py-2 px-4 rounded hover:bg-amber-500 transition duration-300 w-full mt-4">
              Crear Usuario
            </button>
            {/* Botón para cerrar el modal */}
            <button
              onClick={onClose}
              className="bg-amber-600 text-white font-bold py-2 px-4 rounded hover:bg-amber-800 transition duration-300 w-full mt-4"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
export default NuevoUsuario;
