"use client";
import EditarUsuario from "@/components/usuarios/editarUsuario";
import NuevoUsuario from "@/components/usuarios/nuevoUsuario";
import CambiarContraseña from "@/components/usuarios/cambiarContraseña";
import { useModalStore } from "@/store/modalStore";
import React from "react";
import { gql, useQuery } from "@apollo/client";

type Usuario = {
  id: number;
  rut: string;
  nombre: string;
  correo: string;
  rol: string;
};

const GET_USUARIOS_NO_ELIMINADOS = gql`
  query GetUsuariosNoEliminados {
    usersNoEliminados {
      rut
      nombre
      correo
      rol
    }
  }
`;

const UsuariosPage: React.FC = () => {
  const {
    rutUsuario,
    setRutUsuario,
    setNombreUsuario,
    setCorreoUsuario,
    setRolUsuario,
  } = useModalStore();

  const [modalEditarUsuario, setModalEditarUsuario] = React.useState(false);
  const [modalNuevoUsuario, setModalNuevoUsuario] = React.useState(false);
  const [modalCambiarContraseña, setModalCambiarContraseña] =
    React.useState(false);

  const { data, loading, error, refetch } = useQuery(
    GET_USUARIOS_NO_ELIMINADOS
  );

  const abrirModalEditarUsuario = () => setModalEditarUsuario(true);
  const cerrarModalEditarUsuario = () => setModalEditarUsuario(false);
  const abrirModalNuevoUsuario = () => setModalNuevoUsuario(true);
  const cerrarModalNuevoUsuario = () => {
    setModalNuevoUsuario(false);
    refetch();
  };
  const abrirModalCambiarContraseña = () => setModalCambiarContraseña(true);
  const cerrarModalCambiarContraseña = () => setModalCambiarContraseña(false);

  const usuarios: Usuario[] = data?.usersNoEliminados || [];

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <EditarUsuario
        isOpen={modalEditarUsuario}
        onClose={cerrarModalEditarUsuario}
      />
      <NuevoUsuario
        isOpen={modalNuevoUsuario}
        onClose={cerrarModalNuevoUsuario}
      />
      <CambiarContraseña
        isOpen={modalCambiarContraseña}
        onClose={cerrarModalCambiarContraseña}
        rutUsuario={rutUsuario ?? ""}
      />

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
                  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-sm sm:text-base">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
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
                      <div className="flex flex-col sm:flex-row lg:space-x-2 lg:w-full gap-2">
                        <button
                          className="bg-amber-400 text-white font-semibold p-2 rounded hover:bg-amber-500 transition duration-300 text-sm sm:text-base w-full"
                          onClick={() => {
                            abrirModalEditarUsuario();
                            setRutUsuario(usuario.rut);
                            setNombreUsuario(usuario.nombre);
                            setCorreoUsuario(usuario.correo);
                            setRolUsuario(usuario.rol);
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="bg-orange-400 text-white font-semibold p-2 rounded hover:bg-orange-500 transition duration-300 text-sm sm:text-base w-full"
                          onClick={() => {
                            abrirModalCambiarContraseña();
                            setRutUsuario(usuario.rut);
                          }}
                        >
                          Cambiar Contraseña
                        </button>
                        <button className="bg-red-500 text-white font-semibold p-2 rounded hover:bg-red-600 transition duration-300 text-sm sm:text-base w-full">
                          Eliminar
                        </button>
                      </div>
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

export default UsuariosPage;
