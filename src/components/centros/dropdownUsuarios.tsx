import { GET_FIND_USUARIOS_CENTRO } from "@/graphql/query";
import { DELETE_USUARIO_CENTRO } from "@/graphql/mutations";
import { useMutation, useQuery } from "@apollo/client";
import { User } from "@/types/graphql";
import React, { useState } from "react";
import Confirmacion from "../confirmacion";
import Alert from "../Alert";
import AgregarUsuarioCentro from "./agregarUsuarioCentro";
interface DropdownUsuariosProps {
  onClose: () => void;
  id: number;
  nombre: string;
}
interface UsuarioCentro {
  id: number;
  usuario: User;
}

const DropdownUsuarios: React.FC<DropdownUsuariosProps> = ({
  onClose,
  id,
  nombre,
}) => {
  const [showModalAgregarUsuario, setShowModalAgregarUsuario] = useState(false);
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [idUsuarioCentro, setIdUsuarioCentro] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");

  const { loading, error, data, refetch } = useQuery(GET_FIND_USUARIOS_CENTRO, {
    variables: { idCentroCosto: id },
  });
  const [deleteUsuarioCentro] = useMutation(DELETE_USUARIO_CENTRO);

  const handleConfirmarEliminar = (confirmar: boolean) => {
    if (confirmar) {
      handleEliminarUsuarioCentro(idUsuarioCentro);
    }
    setShowConfirmacion(false);
  };
  const handleEliminarUsuarioCentro = async (idUsuarioCentro: number) => {
    try {
      await deleteUsuarioCentro({
        variables: {
          deleteUsuarioCentroId: idUsuarioCentro,
        },
      });
      setAlertMessage("Usuario eliminado del Centro");
      setAlertType("exitoso");
      setShowAlert(true);
      refetch();
    } catch (error) {
      setAlertMessage("Error al elimianar usuario");
      setAlertType("error");
      setShowAlert(true);
    }
  };
  if (loading) {
    return (
      <div className="p-10 bg-white rounded shadow">
        <p>Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded flex justify-between items-center">
        <span>Error: {error.message}</span>
        <button
          className="ml-4 font-bold hover:text-red-900"
          onClick={onClose}
          aria-label="Cerrar"
        >
          x
        </button>
      </div>
    );
  }
  const usuarios: UsuarioCentro[] = data?.FindusuarioCentroByCentroCosto;

  return (
    <div className="bg-white border-gray-200 rounded shadow-lg p-6">
      {/* Header Principal */}
      <div className="flex flex-col sm:flex-row justify-between items-star mb-2">
        <h2 className="text-xl font-bold text-gray-800">
          Usuarios de {nombre}
        </h2>
        <div className="space-x-4">
          <button
            onClick={() => {
              setShowModalAgregarUsuario(true);
            }}
            className="bg-orange-400 hover:bg-orange-500 text-white rounded font-semibold px-4 py-2"
          >
            Agregar Usuario
          </button>
          <button
            onClick={() => {
              onClose();
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white rounded font-semibold px-4 py-2"
          >
            Cerrar
          </button>
        </div>
      </div>
      {showAlert && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
      {showConfirmacion && (
        <Confirmacion
          isOpen={showConfirmacion}
          titulo="Eliminar Usuario"
          mensaje={`¿Estás seguro de que deseas eliminar al usuario de ${nombre}?`}
          onClose={() => setShowConfirmacion(false)}
          onConfirm={handleConfirmarEliminar}
        />
      )}
      {showModalAgregarUsuario && (
        <AgregarUsuarioCentro
          isOpen={showModalAgregarUsuario}
          onClose={() => setShowModalAgregarUsuario(false)}
          onSuccess={() => refetch()}
          idCentro={id}
          nombreCentro={nombre}
        />
      )}
      {/* Contenido del Dropdwon */}
      {usuarios.map((user) => (
        <div
          key={user.id}
          className="border-t border-gray-200 py-4 flex justify-between items-center"
        >
          <div>
            <p className="text-gray-800 font-semibold">{user.usuario.nombre}</p>
            <p className="text-gray-600 text-start">{user.usuario.rol}</p>
          </div>
          <button
            className="bg-red-500 text-white font-semibold px-3 py-2 rounded hover:bg-red-600"
            onClick={() => {
              setShowConfirmacion(true);
              setIdUsuarioCentro(user.id);
            }}
          >
            Eliminar del Centro
          </button>
        </div>
      ))}
    </div>
  );
};
export default DropdownUsuarios;
