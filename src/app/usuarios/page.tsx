"use client";
import EditarUsuario from "@/components/usuarios/editarUsuario";
import NuevoUsuario from "@/components/usuarios/nuevoUsuario";
import CambiarContraseña from "@/components/usuarios/cambiarContraseña";
import { useModalStore } from "@/store/modalStore";
import { useJwtStore } from "@/store/jwtStore";
import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import Alert from "@/components/Alert";
import { GET_USUARIOS_NO_ELIMINADOS } from "@/graphql/query";
import { UPDATE_USER, EDITAR_ESTADO_ELIMINADO_USER } from "@/graphql/mutations";
import ListaVacia from "@/components/listaVacia";
import Confirmacion from "@/components/confirmacion";

type Usuario = {
  id: number;
  rut: string;
  nombre: string;
  correo: string;
  rol: string;
};

const UsuariosPage: React.FC = () => {
  const {
    rutUsuario,
    nombreUsuario,
    setRutUsuario,
    setNombreUsuario,
    setCorreoUsuario,
    setRolUsuario,
  } = useModalStore();

  const [modalEditarUsuario, setModalEditarUsuario] = useState(false);
  const [modalNuevoUsuario, setModalNuevoUsuario] = useState(false);
  const [modalCambiarContraseña, setModalCambiarContraseña] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] =
    useState<Usuario | null>(null);

  const { rolUsuario } = useJwtStore();

  // Estados para las alertas
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");

  // Estados para el modal de confirmación
  const [showConfirmacion, setShowConfirmacion] = useState(false);

  const { data, loading, error, refetch } = useQuery(
    GET_USUARIOS_NO_ELIMINADOS
  );

  const [updateUser] = useMutation(UPDATE_USER, {
    onCompleted: () => {
      cerrarModalEditarUsuario();
      refetch();
      mostrarAlerta("exitoso", "Usuario actualizado correctamente");
    },
    onError: (error) => {
      mostrarAlerta(
        "error",
        error?.message || "Ocurrió un error al actualizar el usuario"
      );
    },
  });

  const [editStatusUser] = useMutation(EDITAR_ESTADO_ELIMINADO_USER, {
    onCompleted: () => {
      refetch();
      mostrarAlerta("exitoso", "Usuario eliminado correctamente");
    },
    onError: (error) => {
      mostrarAlerta(
        "error",
        error?.message || "Ocurrió un error al eliminar el usuario"
      );
    },
  });

  const mostrarAlerta = (
    type: "exitoso" | "error" | "advertencia",
    message: string
  ) => {
    setAlertType(type);
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };

  const abrirModalEditarUsuario = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setRutUsuario(usuario.rut);
    setNombreUsuario(usuario.nombre);
    setCorreoUsuario(usuario.correo);
    setRolUsuario(usuario.rol);
    setModalEditarUsuario(true);
  };

  const cerrarModalEditarUsuario = () => {
    setUsuarioSeleccionado(null);
    setModalEditarUsuario(false);
  };

  const handleEditarUsuario = async (
    id: number,
    rut: string,
    nombre: string,
    correo: string,
    rol: string
  ) => {
    try {
      await updateUser({
        variables: {
          updateUserInput: {
            id,
            rut,
            nombre,
            correo,
            rol,
          },
        },
      });
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    }
  };

  const abrirModalNuevoUsuario = () => setModalNuevoUsuario(true);
  const cerrarModalNuevoUsuario = () => {
    setModalNuevoUsuario(false);
    refetch();
  };
  const abrirModalCambiarContraseña = () => setModalCambiarContraseña(true);
  const cerrarModalCambiarContraseña = () => setModalCambiarContraseña(false);

  const handleEliminarUsuario = async (id: number) => {
    try {
      await editStatusUser({
        variables: {
          id,
        },
      });
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
    }
  };
  const handleConfirmarEliminar = (confirmed: boolean) => {
    if (confirmed) {
      handleEliminarUsuario(usuarioSeleccionado?.id || 0);
    }
    setShowConfirmacion(false);
  };

  const usuarios: Usuario[] = data?.usersNoEliminados || [];

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <EditarUsuario
        isOpen={modalEditarUsuario}
        onClose={cerrarModalEditarUsuario}
        onSave={handleEditarUsuario}
        usuarioId={usuarioSeleccionado?.id}
      />
      <NuevoUsuario
        isOpen={modalNuevoUsuario}
        onClose={cerrarModalNuevoUsuario}
        onSuccess={() =>
          mostrarAlerta("exitoso", "Usuario creado correctamente")
        }
        onError={() => mostrarAlerta("error", "Error al crear el usuario")}
      />
      <CambiarContraseña
        isOpen={modalCambiarContraseña}
        onClose={cerrarModalCambiarContraseña}
        rutUsuario={rutUsuario ?? ""}
        nombreUsuario={nombreUsuario ?? ""}
        onSuccess={() =>
          mostrarAlerta("exitoso", "Contraseña cambiada correctamente")
        }
        onError={() => mostrarAlerta("error", "Error al cambiar la contraseña")}
      />
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
          onConfirm={handleConfirmarEliminar}
        />
      )}
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="text-xl sm:text-2xl font-semibold">
            Lista de Usuarios
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              className="bg-orange-400 text-white font-semibold p-2 sm:p-4 rounded hover:bg-orange-500 transition duration-300 w-full sm:w-auto"
              onClick={abrirModalNuevoUsuario}
            >
              Nuevo Usuario
            </button>
            <button
              className="bg-red-500 text-white font-semibold p-2 sm:p-4 rounded hover:bg-red-600 transition duration-300 w-full sm:w-auto"
              onClick={() => {
                window.location.href = "/usuarios/eliminados";
              }}
            >
              Usuarios Eliminados
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
                    Email
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-sm sm:text-base">
                    Rol
                  </th>
                  {rolUsuario === "Soporte" && (
                    <th className="border border-gray-300 px-2 sm:px-4 py-2 text-sm sm:text-base">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center">
                      <ListaVacia mensaje="No hay usuarios para mostrar. Revisa en el apartado de eliminados." />
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
                    {rolUsuario === "Soporte" && (
                      <td className="border border-gray-300 px-2 sm:px-4 py-2">
                        <div className="flex flex-col sm:flex-row lg:space-x-2 lg:w-full gap-2">
                          <button
                            className="bg-amber-400 text-white font-semibold p-2 rounded hover:bg-amber-500 transition duration-300 text-sm sm:text-base w-full"
                            onClick={() => abrirModalEditarUsuario(usuario)}
                          >
                            Editar
                          </button>
                          <button
                            className="bg-orange-400 text-white font-semibold p-2 rounded hover:bg-orange-500 transition duration-300 text-sm sm:text-base w-full"
                            onClick={() => {
                              abrirModalCambiarContraseña();
                              setRutUsuario(usuario.rut);
                              setNombreUsuario(usuario.nombre);
                            }}
                          >
                            Cambiar Contraseña
                          </button>
                          <button
                            className="bg-red-500 text-white font-semibold p-2 rounded hover:bg-red-600 transition duration-300 text-sm sm:text-base w-full"
                            onClick={() => {
                              setShowConfirmacion(true);
                              setUsuarioSeleccionado(usuario);
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    )}
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

export default UsuariosPage;
