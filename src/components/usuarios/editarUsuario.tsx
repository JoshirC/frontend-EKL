"use client";
import React, { useState, useEffect } from "react";
import { useModalStore } from "@/store/modalStore";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const EditarUsuario: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [nombre, setNombre] = useState<string>("");
  const [rut, setRut] = useState<string>("");
  const [correo, setCorreo] = useState<string>("");
  const [rol, setRol] = useState<string>("");
  const { rutUsuario, nombreUsuario, correoUsuario, rolUsuario } =
    useModalStore();
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleClose = () => {
    setNombre("");
    setRut("");
    setCorreo("");
    setRol("");
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 px-12 sm:px-4">
          <div className="bg-white opacity-100 w-full max-w-md rounded-lg shadow-lg p-8 max-h-[90vh] overflow-y-auto">
            <h1 className="text-2xl font-bold mb-4 text-center">
              Editar Usuario
            </h1>
            <h2 className="text-sm mb-4 text-center">
              Ingresa los nuevos datos del usuario.
            </h2>
            {/* Campos de texto para editar el usuario */}
            <input
              type="text"
              value={rutUsuario ?? rut}
              onChange={(e) => setRut(e.target.value)}
              className="block w-full mt-4 p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              value={nombreUsuario ?? nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="block w-full mt-4 p-2 border border-gray-300 rounded"
            />
            <input
              type="email"
              value={correoUsuario ?? correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="block w-full mt-4 p-2 border border-gray-300 rounded"
            />
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="block w-full mt-4 p-2 border border-gray-300 rounded"
            >
              <option value="" disabled>
                {rolUsuario ?? "Selecciona un rol"}
              </option>
              <option>Administrador</option>
              <option>Adquisiciones</option>
              <option>Jefe Bodega</option>
              <option>Bodeguero</option>
            </select>
            {/* Botón para guardar los cambios */}
            <button className="bg-orange-400 text-white font-bold py-2 px-4 rounded hover:bg-orange-500 transition duration-300 w-full mt-6">
              Guardar Cambios
            </button>
            {/* Botón para cerrar el modal */}
            <button
              onClick={handleClose}
              className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 transition duration-300 w-full mt-4"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
export default EditarUsuario;
