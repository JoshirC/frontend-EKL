"use client";
import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_USER } from "@/graphql/mutations";
import Alert from "@/components/Alert";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: () => void;
}

const NuevoUsuario: React.FC<ModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [nombre, setNombre] = useState<string>("");
  const [rut, setRut] = useState<string>("");
  const [correo, setCorreo] = useState<string>("");
  const [rol, setRol] = useState<string>("");
  const [contrasena, setContrasena] = useState<string>("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");

  const [createUser, { loading, error }] = useMutation(CREATE_USER);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await createUser({
        variables: {
          userInput: {
            rut,
            nombre,
            correo,
            contrasena,
            rol,
          },
        },
      });
      if (data) {
        onClose();
        onSuccess?.();
      }
    } catch (err) {
      setAlertType("error");
      setAlertMessage(error?.message || "Ocurrió un error al crear el usuario");
      setShowAlert(true);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 px-12 sm:px-4">
          <div className="bg-white opacity-100 w-full max-w-md rounded-lg shadow-lg p-8 max-h-[90vh] overflow-y-auto">
            <h1 className="text-2xl font-bold mb-4 text-center">
              Nuevo Usuario
            </h1>

            <h2 className="text-sm mb-4 text-center">
              Ingresa los datos del nuevo usuario.
            </h2>
            {showAlert && (
              <Alert
                type={alertType}
                message={alertMessage}
                onClose={() => setShowAlert(false)}
                modal={true}
              />
            )}
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={rut}
                placeholder="Rut"
                className="block w-full mt-4 p-2 border border-gray-300 rounded"
                onChange={(e) => setRut(e.target.value)}
                required
              />
              <input
                type="text"
                value={nombre}
                placeholder="Nombre"
                className="block w-full mt-4 p-2 border border-gray-300 rounded"
                onChange={(e) => setNombre(e.target.value)}
                required
              />
              <input
                type="email"
                value={correo}
                placeholder="Correo"
                className="block w-full mt-4 p-2 border border-gray-300 rounded"
                onChange={(e) => setCorreo(e.target.value)}
              />
              <input
                type="password"
                value={contrasena}
                placeholder="Contraseña"
                className="block w-full mt-4 p-2 border border-gray-300 rounded"
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                className="block w-full mt-4 p-2 border border-gray-300 rounded"
                required
              >
                <option value="" disabled>
                  Selecciona un rol
                </option>
                <option>Administrador</option>
                <option>Adquisiciones</option>
                <option>Jede Bodega</option>
                <option>Bodeguero</option>
              </select>
              <button
                type="submit"
                disabled={loading}
                className="bg-orange-400 text-white font-bold py-2 px-4 rounded hover:bg-orange-500 transition duration-300 w-full mt-4 disabled:opacity-50"
              >
                {loading ? "Creando..." : "Crear Usuario"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 transition duration-300 w-full mt-4"
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default NuevoUsuario;
