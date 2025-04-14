"use client";
import EditarUsuario from "@/components/usuarios/editarUsuario";
import NuevoUsuario from "@/components/usuarios/nuevoUsuario";
import React, { useEffect, useState } from "react";
import { useModalStore } from "@/store/modalStore";
type Usuario = {
  Rut: string;
  Nombre: string;
  Correo: string;
  Rol: string;
  Eliminado: boolean;
};
const UsuariosPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [modalEditarUsuario, setModalEditarUsuario] = useState(false);
  const [modalNuevoUsuario, setModalNuevoUsuario] = useState(false);
  const { setRutUsuario, setNombreUsuario, setCorreoUsuario, setRolUsuario } =
    useModalStore();
  const abrirModalEditarUsuario = () => {
    setModalEditarUsuario(true);
  };
  const cerrarModalEditarUsuario = () => {
    setModalEditarUsuario(false);
  };
  const abrirModalNuevoUsuario = () => {
    setModalNuevoUsuario(true);
  };
  const cerrarModalNuevoUsuario = () => {
    setModalNuevoUsuario(false);
  };
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        // Aquí se debe preguntar por los usuarios que no estan eliminados.
        const response = await fetch("/api/usuario.json");
        const data = await response.json();
        const usuariosActivos = data.filter(
          (usuario: Usuario) => usuario.Eliminado === false
        );
        setUsuarios(usuariosActivos);
      } catch (error) {
        console.error("Error al cargar el JSON:", error);
      }
    };

    fetchUsuarios();
  }, []);
  return (
    <div className="p-10">
      <EditarUsuario
        isOpen={modalEditarUsuario}
        onClose={cerrarModalEditarUsuario}
      />
      <NuevoUsuario
        isOpen={modalNuevoUsuario}
        onClose={cerrarModalNuevoUsuario}
      />
      <div className="bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <div className="text-2xl font-semibold">Lista de Usuarios</div>
          <div className="flex space-x-4">
            <button
              className="bg-amber-400 text-white font-semibold p-4 rounded hover:bg-amber-500 transition duration-300"
              onClick={abrirModalNuevoUsuario}
            >
              Nuevo Usuario
            </button>
            <button
              className="bg-amber-400 text-white font-semibold p-4 rounded hover:bg-amber-500 transition duration-300"
              onClick={() => {
                window.location.href = "/usuarios/eliminados";
              }}
            >
              Usuarios Eliminados
            </button>
          </div>
        </div>
        <table className="table-fixed w-full border-collapse border border-gray-200 mt-2">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Rut</th>
              <th className="border border-gray-300 px-4 py-2">Nombre</th>
              <th className="border border-gray-300 px-4 py-2">Email</th>
              <th className="border border-gray-300 px-4 py-2">Rol</th>
              <th className="border border-gray-300 px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.Rut}>
                <td className="border border-gray-300 px-4 py-2">
                  {usuario.Rut}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {usuario.Nombre}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {usuario.Correo}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {usuario.Rol}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="flex space-x-2">
                    <button
                      className="bg-amber-400 text-white w-full font-semibold p-2 rounded hover:bg-amber-600 transition duration-300"
                      onClick={() => {
                        abrirModalEditarUsuario();
                        setRutUsuario(usuario.Rut);
                        setNombreUsuario(usuario.Nombre);
                        setCorreoUsuario(usuario.Correo);
                        setRolUsuario(usuario.Rol);
                      }}
                    >
                      Editar
                    </button>
                    <button className="bg-amber-400 text-white w-full font-semibold p-2 rounded hover:bg-amber-600 transition duration-300 ml-2">
                      Cambiar Contraseña
                    </button>
                    <button className="bg-amber-700 text-white w-full font-semibold p-2 rounded hover:bg-amber-800 transition duration-300 ml-2">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsuariosPage;
