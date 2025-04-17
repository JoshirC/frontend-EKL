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
    <div className="p-4 sm:p-6 md:p-10">
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
              {usuarios.map((usuario) => (
                <tr key={usuario.Rut}>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2 text-sm sm:text-base">
                    {usuario.Rut}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2 text-sm sm:text-base">
                    {usuario.Nombre}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2 text-sm sm:text-base">
                    {usuario.Correo}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2 text-sm sm:text-base">
                    {usuario.Rol}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    <button className="bg-blue-400 text-white font-semibold p-2 rounded hover:bg-blue-500 transition duration-300 text-sm sm:text-base w-full">
                      Restaurar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EliminadosPage;
