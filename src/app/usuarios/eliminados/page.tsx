"use client";
import { gql, useQuery, useMutation } from "@apollo/client";
import React, { useState } from "react";
import Alert from "@/components/Alert";
import { GET_USUARIOS_ELIMINADOS } from "@/graphql/query";
import { EDITAR_ESTADO_ELIMINADO_USER } from "@/graphql/mutations";
import ListaVacia from "@/components/listaVacia";
import Confirmacion from "@/components/confirmacion";
type Usuario = {
  id: number;
  rut: string;
  nombre: string;
  correo: string;
  rol: string;
};

const EliminadosPage: React.FC = () => {
  const { data, loading, error, refetch } = useQuery(GET_USUARIOS_ELIMINADOS);

  // Estado de la alerta
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");

  // Estado de la confirmacion
  const [showConfirmacion, setShowConfirmacion] = useState(false);

  const [usuarioSeleccionado, setUsuarioSeleccionado] =
    useState<Usuario | null>(null);

  const [editStatusUser] = useMutation(EDITAR_ESTADO_ELIMINADO_USER, {
    onCompleted: () => {
      refetch();
      setAlertType("exitoso");
      setAlertMessage("Usuario restaurado correctamente");
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    },
    onError: () => {
      setAlertType("error");
      setAlertMessage("Error al restaurar usuario");
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 2000);
    },
  });

  const handleRestaurarUsuario = async (id: number) => {
    try {
      await editStatusUser({
        variables: {
          id,
        },
      });
    } catch (error) {
      setAlertType("error");
      setAlertMessage("Error al restaurar usuario");
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 2000);
    }
  };
  const handleConfirmacion = (confirmado: boolean) => {
    if (confirmado && usuarioSeleccionado) {
      handleRestaurarUsuario(usuarioSeleccionado.id);
    }
    setUsuarioSeleccionado(null);
    setShowConfirmacion(false);
  };

  const usuarios: Usuario[] = data?.usersEliminados || [];

  return (
    <div className="p-4 sm:p-6 md:p-10">
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
          mensaje={`¿Estás seguro de que deseas eliminar al usuario ${usuarioSeleccionado?.nombre}?`}
          onClose={() => setShowConfirmacion(false)}
          onConfirm={handleConfirmacion}
        />
      )}
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="text-xl sm:text-2xl font-semibold">
            Lista de Usuarios Eliminados
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              className="bg-orange-400 text-white font-semibold p-2 sm:p-4 rounded hover:bg-orange-500 transition duration-300 w-full sm:w-auto"
              onClick={() => {
                window.location.href = "/usuarios";
              }}
            >
              Usuarios Activos
            </button>
          </div>
        </div>
        {loading ? (
          <p>Cargando usuarios...</p>
        ) : error ? (
          <p className="text-red-500">Error al cargar los usuarios</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-center border-collapse border border-gray-200 mt-2 min-w-[600px]">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-sm sm:text-base">
                    Rut
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-sm sm:text-base">
                    Nombre
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-sm sm:text-base">
                    Correo
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-sm sm:text-base">
                    Rol
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-sm sm:text-base">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center">
                      <ListaVacia mensaje="No hay usuarios eliminados" />
                    </td>
                  </tr>
                )}
                {usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-sm sm:text-base">
                      {usuario.rut}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-sm sm:text-base">
                      {usuario.nombre}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-sm sm:text-base">
                      {usuario.correo}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-sm sm:text-base">
                      {usuario.rol}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      <button
                        className="bg-blue-400 text-white font-semibold p-2 rounded hover:bg-blue-500 transition duration-300 text-sm sm:text-base w-full"
                        onClick={() => {
                          setShowConfirmacion(true);
                          setUsuarioSeleccionado(usuario);
                        }}
                      >
                        Restaurar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EliminadosPage;
