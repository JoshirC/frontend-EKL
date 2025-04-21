"use client";

import React, { useState, useEffect } from "react";
import { gql, useMutation } from "@apollo/client";

const EDIT_PASSWORD_USER = gql`
  mutation EditPasswordUser(
    $rut: String!
    $editPasswordUserInput: EditPasswordUserInput!
  ) {
    editPasswordUser(rut: $rut, editPasswordUserInput: $editPasswordUserInput) {
      id
      rut
      nombre
      correo
      rol
    }
  }
`;

interface CambiarContraseñaProps {
  rutUsuario: string;
  isOpen: boolean;
  onClose: () => void;
}

const CambiarContraseña: React.FC<CambiarContraseñaProps> = ({
  rutUsuario,
  isOpen,
  onClose,
}) => {
  const [nuevaContraseña, setNuevaContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [editPasswordUser, { loading }] = useMutation(EDIT_PASSWORD_USER, {
    onCompleted: () => {
      onClose();
      setNuevaContraseña("");
      setConfirmarContraseña("");
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = async () => {
    if (!rutUsuario) {
      setError("No se ha seleccionado un usuario");
      return;
    }

    if (nuevaContraseña !== confirmarContraseña) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (nuevaContraseña.length < 8) {
      setError("La contraseña debe tener al menos 6 caracteres");
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
      console.error("Error al cambiar la contraseña:", error);
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
              Genera una nueva contraseña para el usuario {rutUsuario}.
            </h2>
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
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
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
