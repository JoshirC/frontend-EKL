"use client";
import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_USER } from "@/graphql/mutations";
import Alert from "@/components/Alert";
import { validarRut } from "@/utils/validarRut";

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
    if (contrasena.length < 8) {
      setAlertType("advertencia");
      setAlertMessage("La contraseña debe tener al menos 8 caracteres.");
      setShowAlert(true);
      return;
    }
    if (!rut || !nombre || !contrasena || !rol) {
      setAlertType("advertencia");
      setAlertMessage("Por favor, completa todos los campos obligatorios.");
      setShowAlert(true);
      return;
    }
    if (!validarRut(rut)) {
      setAlertType("advertencia");
      setAlertMessage("El RUT debe ser sin puntos y con guión.");
      setShowAlert(true);
      return;
    }
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
      if (data?.createUser) {
        setRut("");
        setNombre("");
        setCorreo("");
        setContrasena("");
        setRol("");
        onClose();
        onSuccess?.();
      }
    } catch (err) {
      setAlertType("error");
      setAlertMessage(error?.message || "Error al crear el usuario.");
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
                onChange={(e) => setRut(e.target.value.toLocaleUpperCase())}
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
                <option>Soporte</option>
              </select>
              <button
                type="submit"
                disabled={loading}
                className={`font-bold py-2 px-4 rounded transition duration-300 w-full mt-4 ${
                  loading
                    ? "bg-gray-300 text-white cursor-not-allowed"
                    : "bg-orange-400 text-white hover:bg-orange-500"
                }`}
              >
                {loading ? "Cargando..." : "Crear Usuario"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className={`font-bold py-2 px-4 rounded transition duration-300 w-full mt-4 ${
                  loading
                    ? "bg-gray-300 text-white cursor-not-allowed"
                    : "bg-gray-500 text-white hover:bg-gray-600"
                }`}
                disabled={loading}
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
