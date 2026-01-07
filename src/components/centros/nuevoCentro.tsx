"use client";
import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_CENTRO_COSTO } from "@/graphql/mutations";
import Alert from "@/components/Alert";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}
const NuevoCentro: React.FC<ModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [codigo, setCodigo] = useState<string>("");
  const [nombre, setNombre] = useState<string>("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");

  const [createCentroCosto, { loading, error }] =
    useMutation(CREATE_CENTRO_COSTO);

  const handleCrarCentro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (codigo === "" || nombre === "") {
      setAlertType("advertencia");
      setAlertMessage("Por favor, completa todos los campos obligatorios.");
      setShowAlert(true);
      return;
    }
    try {
      const { data } = await createCentroCosto({
        variables: {
          createCentroCostoInput: {
            codigo,
            nombre,
          },
        },
      });
      if (data) {
        setAlertType("exitoso");
        setAlertMessage("Centro de Costo creado exitosamente.");
        setShowAlert(true);
        setCodigo("");
        setNombre("");
        setTimeout(() => {
          onClose();
          onSuccess?.();
        }, 1500);
      }
    } catch (err) {
      setAlertType("error");
      setAlertMessage(error?.message || "Error al crear el Centro de Costo.");
      setShowAlert(true);
    }
  };
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 px-12 sm:px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h1 className="text-xl font-semibold text-center mb-4">
              Crear Nuevo Centro
            </h1>
            <button
              onClick={onClose}
              className="absolute top-3 right-8 text-gray-300 hover:text-red-500 text-4xl font-bold"
            >
              ×
            </button>
            {showAlert && (
              <Alert
                type={alertType}
                message={alertMessage}
                onClose={() => setShowAlert(false)}
                modal={true}
              />
            )}
            <form onSubmit={handleCrarCentro}>
              <p className="font-semibold mt-4">Código del Centro de Costo</p>
              <div className="flex items-center border border-gray-300 rounded mt-2">
                <input
                  type="text"
                  placeholder="Código del Centro de Costo"
                  className="w-full px-3 py-2 rounded-l focus:outline-none"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  required
                />
              </div>
              <p className="font-semibold mt-2">Nombre del Centro de Costo</p>
              <div className="flex items-center border border-gray-300 rounded mt-2">
                <input
                  type="text"
                  placeholder="Nombre del Centro de Costo"
                  className="w-full px-3 py-2 rounded-l focus:outline-none"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-orange-400 text-white font-semibold px-4 py-2 rounded mt-4 hover:bg-orange-500 transition duration-300 w-full"
                disabled={loading}
              >
                {loading ? "Creando..." : "Crear Centro"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
export default NuevoCentro;
