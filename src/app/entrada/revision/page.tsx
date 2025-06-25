"use client";
import React, { useState } from "react";
import { GET_GUIA_ENTRADA_BY_ESTADO } from "@/graphql/query";
import { useQuery } from "@apollo/client";

type GuiaEntrada = {
  id: number;
  fecha_generacion: string;
  numero_orden_compra: string;
  estado: string;
};

const RevisionPage: React.FC = () => {
  const [botonCargando, setBotonCargando] = useState(false);
  // Consulta para obtener las guías de entrada pendientes de revisión
  const { loading, error, data } = useQuery(GET_GUIA_ENTRADA_BY_ESTADO, {
    variables: { estado: "Ingresado" },
  });
  if (loading)
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>Cargando productos...</p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>{error.message}</p>
        </div>
      </div>
    );
  const guiasEntrada: GuiaEntrada[] = data?.guiaEntradaByEstado || [];
  return (
    <div className="p-4 sm:p-10">
      {/* Contenedor Principal */}
      <div className="bg-white shadow rounded p-6">
        {/* Título de la Página */}
        <h1 className="text-2xl font-semibold">Revisión de Guias de Entrada</h1>
        {/* Contenido de la Página */}
        <div className="overflow-x-auto mt-6">
          {/* Tabla de Guias de Entrada */}
          <table className="table-auto text-center w-full border-collapse border border-gray-200 mt-2 text-sm sm:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Número Orden Compra
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Fecha Generación
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Estado
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {guiasEntrada.map((guia) => (
                <tr key={guia.id}>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {guia.numero_orden_compra}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {guia.fecha_generacion}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {guia.estado}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    <button
                      className={`text-white font-semibold p-3 sm:p-4 rounded w-full whitespace-nowrap ${
                        botonCargando
                          ? "bg-gray-400"
                          : "bg-orange-400 hover:bg-orange-500"
                      }`}
                      disabled={botonCargando}
                      onClick={() => {
                        setBotonCargando(true);
                        window.location.href = `/entrada/revision/${guia.id}`;
                      }}
                    >
                      Ver Detalles
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

export default RevisionPage;
