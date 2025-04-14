"use client";
import React, { useState, useEffect } from "react";
type Usuario = {
  Rut: string;
  Nombre: string;
  Correo: string;
  Rol: string;
  Eliminado: boolean;
};
const EliminadosPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        // Aquí se debe preguntar por los usuarios que estan eliminados.
        const response = await fetch("/api/usuario.json");
        const data = await response.json();
        const usuariosEliminados = data.filter(
          (usuario: Usuario) => usuario.Eliminado === true
        );
        setUsuarios(usuariosEliminados);
      } catch (error) {
        console.error("Error al cargar el JSON:", error);
      }
    };
    fetchUsuarios();
  }, []);
  return (
    <div className="p-10">
      <div className="bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <div className="text-2xl font-semibold">
            Lista de Usuarios Eliminados
          </div>
          <div className="flex space-x-4">
            <button
              className="bg-amber-400 text-white font-semibold p-4 rounded hover:bg-amber-500 transition duration-300"
              onClick={() => {
                window.location.href = "/usuarios";
              }}
            >
              Usuarios Activos
            </button>
          </div>
        </div>
        <table className="table-fixed w-full border-collapse border border-gray-200 mt-2">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Rut</th>
              <th className="border border-gray-300 px-4 py-2">Nombre</th>
              <th className="border border-gray-300 px-4 py-2">Correo</th>
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
                  <button className="bg-red-500 text-white w-full font-semibold p-2 rounded hover:bg-red-600 transition duration-300">
                    Restaurar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EliminadosPage;
