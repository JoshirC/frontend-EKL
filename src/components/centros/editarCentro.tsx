"use client";

import React, { useState } from "react";
import { CentroCosto } from "@/types/graphql";
import { UPDATE_CENTRO } from "@/graphql/mutations";
import { useMutation } from "@apollo/client";
import Alert from "../Alert";
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  centro: CentroCosto;
}
const EditarCentro: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  centro,
}) => {
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");

  const [updateCentro, { loading, error }] = useMutation(UPDATE_CENTRO);

  const handleUpdateCentro = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await updateCentro({
        variables: {
          updateCentroCostoId: centro.id,
          codigo: codigo,
          nombre: nombre,
        },
      });
      if (data) {
        setAlertType("exitoso");
        setAlertMessage("Centro de Costo actualizado exitosamente.");
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
      setAlertMessage(
        error?.message || "Error al actualizar el Centro de Costo."
      );
      setShowAlert(true);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 px-12">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h1 className="text-xl font-semibold text-center">Editar Centro</h1>
            <p className="text-orange-500 text-center text-xl font-semibold">
              {centro.nombre}
            </p>
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
            <form onSubmit={handleUpdateCentro}>
              <p className="font-semibold mt-4">Código del Centro de Costo</p>
              <div className="flex items-center border border-gray-300 rounded mt-2">
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-l focus:outline-none"
                  placeholder={centro.codigo}
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                />
              </div>
              <p className="font-semibold mt-2">Nombre del Centro de Costo</p>
              <div className="flex items-center border border-gray-300 rounded mt-2">
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-l focus:outline-none"
                  placeholder={centro.nombre}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="bg-orange-400 text-white font-semibold px-4 py-2 rounded mt-4 hover:bg-orange-500 transition duration-300 w-full"
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar Centro"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
export default EditarCentro;
