"use client";
import React, { useState, useEffect } from "react";
import { useModalStore } from "@/store/modalStore";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    id: number,
    rut: string,
    nombre: string,
    correo: string,
    rol: string
  ) => void;
  usuarioId?: number;
}

const EditarUsuario: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSave,
  usuarioId,
}) => {
  const [nombre, setNombre] = useState<string>("");
  const [correo, setCorreo] = useState<string>("");
  const [rol, setRol] = useState<string>("");
  const [rut, setRut] = useState<string>("");
  const { nombreUsuario, correoUsuario, rolUsuario, rutUsuario } =
    useModalStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Inicializar los valores cuando se abre el modal
      setNombre(nombreUsuario || "");
      setCorreo(correoUsuario || "");
      setRol(rolUsuario || "");
      setRut(rutUsuario || "");
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, nombreUsuario, correoUsuario, rolUsuario, rutUsuario]);

  const handleClose = () => {
    setNombre("");
    setCorreo("");
    setRol("");
    setRut("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usuarioId) {
      onSave(usuarioId, rut, nombre, correo, rol);
      handleClose();
    }
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
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={rut}
                onChange={(e) => setRut(e.target.value.toLocaleUpperCase())}
                className="block w-full p-2 border border-gray-300 rounded"
                placeholder="RUT"
              />
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="block w-full mt-4 p-2 border border-gray-300 rounded"
                placeholder="Nombre"
              />
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="block w-full mt-4 p-2 border border-gray-300 rounded"
                placeholder="Correo"
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
                <option>Jefe Bodega</option>
                <option>Bodeguero</option>
              </select>
              <button
                type="submit"
                className="bg-orange-400 text-white font-bold py-2 px-4 rounded hover:bg-orange-500 transition duration-300 w-full mt-6"
              >
                Guardar Cambios
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 transition duration-300 w-full mt-4"
              >
                Cerrar
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EditarUsuario;
