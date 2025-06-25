"use client";

import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import Alert from "@/components/Alert";
import { EDIT_PASSWORD_USER } from "@/graphql/mutations";

interface CambiarContraseñaProps {
  nombreUsuario: string;
  rutUsuario: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: () => void;
}

const CambiarContraseña: React.FC<CambiarContraseñaProps> = ({
  nombreUsuario,
  rutUsuario,
  isOpen,
  onClose,
  onSuccess,
  onError,
}) => {
  const [nuevaContraseña, setNuevaContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");

  const [editPasswordUser, { loading }] = useMutation(EDIT_PASSWORD_USER, {
    onCompleted: () => {
      onClose();
      setNuevaContraseña("");
      setConfirmarContraseña("");
      setError(null);
      onSuccess?.();
    },
    onError: (error) => {
      setAlertType("error");
      setAlertMessage(error.message);
      setShowAlert(true);
    },
  });

  const handleSubmit = async () => {
    if (!rutUsuario) {
      setAlertType("error");
      setAlertMessage("No se ha seleccionado un usuario");
      setShowAlert(true);
      return;
    }

    if (nuevaContraseña !== confirmarContraseña) {
      setAlertType("error");
      setAlertMessage("Las contraseñas no coinciden");
      setShowAlert(true);
      return;
    }

    if (nuevaContraseña.length < 8) {
      setAlertType("error");
      setAlertMessage("La contraseña debe tener al menos 8 caracteres");
      setShowAlert(true);
      return;
    }

    try {
      await editPasswordUser({
        variables: {
          rut: rutUsuario,
          editPasswordUserInput: {
            contrasena: nuevaContraseña,
          },
        },
      });
    } catch (error) {
      setAlertType("error");
      setAlertMessage("Error: " + error);
      setShowAlert(true);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 sm:px-4 px-12">
          <div className="bg-white opacity-100 w-full max-w-md rounded-lg shadow-lg p-8 max-h-[90vh] overflow-y-auto">
            <h1 className="text-2xl font-bold mb-4 text-center">
              Cambiar Contraseña
            </h1>
            <h2 className="text-sm mb-4 text-center">
              Genera una nueva contraseña para {nombreUsuario} de RUT{" "}
              {rutUsuario}
            </h2>
            {showAlert && (
              <Alert
                type={alertType}
                message={alertMessage}
                onClose={() => setShowAlert(false)}
                modal={true}
              />
            )}
            <input
              type="password"
              placeholder="Nueva contraseña"
              className="block w-full mt-4 p-2 border border-gray-300 rounded"
              value={nuevaContraseña}
              onChange={(e) => setNuevaContraseña(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              className="block w-full mt-4 p-2 border border-gray-300 rounded"
              value={confirmarContraseña}
              onChange={(e) => setConfirmarContraseña(e.target.value)}
            />
            <div className="flex flex-col space-y-4">
              <button
                className="bg-orange-400 hover:bg-orange-500 font-semibold text-white px-4 py-2 rounded mt-4 w-full disabled:opacity-50"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Cambiando contraseña..." : "Cambiar contraseña"}
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
