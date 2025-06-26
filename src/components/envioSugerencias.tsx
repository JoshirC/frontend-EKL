"use client";

import React, { useState, useEffect } from "react";
import { CORREO_DE_SUGERENCIAS } from "@/graphql/mutations";
import { useMutation } from "@apollo/client";
import Alert from "@/components/Alert";
import { useJwtStore } from "@/store/jwtStore";
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const EnvioSugerencias: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [sugerencia, setSugerencia] = useState("");
  const { nombreUsuario } = useJwtStore();

  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  const [enviarSugerencia] = useMutation(CORREO_DE_SUGERENCIAS, {
    onCompleted: () => {
      setAlertType("exitoso");
      setAlertMessage("Sugerencia enviada exitosamente.");
      setShowAlert(true);
      setSugerencia("");
      onClose();
    },
    onError: (error) => {
      setAlertType("error");
      setAlertMessage(error.message);
      setShowAlert(true);
    },
  });

  const handleEnviarSugerencia = () => {
    if (sugerencia.trim() === "") {
      setAlertType("error");
      setAlertMessage("Por favor, escribe una sugerencia antes de enviar.");
      setShowAlert(true);
      return;
    }
    enviarSugerencia({
      variables: {
        usuario: nombreUsuario,
        mensaje: sugerencia,
      },
    });
  };
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/60 z-50 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl text-center font-semibold mb-4">
          Nueva Sugerencia
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Tu opinión importa, comenta en que podemos mejorar la aplicación.
        </p>
        {showAlert && (
          <Alert
            type={alertType}
            message={alertMessage}
            onClose={() => setShowAlert(false)}
            modal={true}
          />
        )}
        <textarea
          className="w-full h-32 p-2 border border-gray-300 rounded mb-4"
          placeholder="Escribe tu sugerencia aquí..."
          value={sugerencia}
          onChange={(e) => setSugerencia(e.target.value)}
        />
        <button
          className="bg-orange-400 text-white font-bold py-2 px-4 rounded hover:bg-orange-500 transition duration-300 w-full mt-4"
          onClick={handleEnviarSugerencia}
        >
          Enviar
        </button>
        <button
          className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 transition duration-300 w-full mt-2"
          onClick={onClose}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};
export default EnvioSugerencias;
