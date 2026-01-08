import React, { useState, useEffect } from "react";
import { GET_USUARIOS_NO_ELIMINADOS } from "@/graphql/query";
import { CREAR_USUARIO_CENTRO } from "@/graphql/mutations";
import { useMutation, useQuery } from "@apollo/client";
import { User } from "@/types/graphql";
import Alert from "../Alert";
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  idCentro: number;
  nombreCentro: string;
  onSuccess?: () => void;
}
const AgregarUsuarioCentro: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  idCentro,
  nombreCentro,
  onSuccess,
}) => {
  const [idUsuario, setIdUsuario] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");

  const { refetch, data } = useQuery(GET_USUARIOS_NO_ELIMINADOS);
  const [agregarUsuario, { error, loading }] =
    useMutation(CREAR_USUARIO_CENTRO);

  const handleAgregarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await agregarUsuario({
        variables: {
          usuarioCentroInput: {
            id_centro_costo: idCentro,
            id_usuario: idUsuario,
          },
        },
      });
      if (data) {
        setAlertType("exitoso");
        setAlertMessage("Centro de Costo actualizado exitosamente.");
        setShowAlert(true);
        setTimeout(() => {
          onClose();
          onSuccess?.();
        }, 1500);
      }
    } catch (err) {
      setAlertType("error");
      setAlertMessage(error?.message || "Error al ingresar el usuario.");
      setShowAlert(true);
    }
  };
  const usuarios: User[] = data?.usersNoEliminados ?? [];
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 px-12">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h1 className="text-xl font-semibold text-center">
              Agregar Usuarios al Centro
            </h1>
            <p className="text-orange-500 text-center text-xl font-semibold">
              {nombreCentro}
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
            <form onSubmit={handleAgregarUsuario}>
              <p className="font-semibold mt-4 text-start mb-3">
                Usuarios Disponibles
              </p>
              <label>
                <select
                  id="usuario"
                  className="p-3 w-full border rounded border-gray-300"
                  value={idUsuario}
                  onChange={(e) => setIdUsuario(Number(e.target.value))}
                >
                  <option value={0}>Seleccione un Usuario</option>

                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <button className="bg-orange-400 text-white font-semibold p-2 rounded hover:bg-orange-500 w-full mt-4">
                Agregar Usuario
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
export default AgregarUsuarioCentro;
