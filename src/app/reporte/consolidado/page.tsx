"use client";

import React, { useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_CONSOLIDADO_CERRADOS } from "@/graphql/query";
import { Consolidado } from "@/types/graphql";

const ConsolidadoPage: React.FC = () => {
  const { loading, error, data } = useQuery(GET_CONSOLIDADO_CERRADOS);
  const consolidados: Consolidado[] = data ? data.consolidadosCerrados : [];

  // Ordenar consolidados por fecha de inicio (descendente)
  const consolidadosOrdenados = [...consolidados].sort(
    (a, b) =>
      new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime()
  );

  if (loading) {
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>Cargando consolidados cerrados...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p className="text-red-500">
            Error al cargar los consolidados cerrados: {error.message}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="p-4 sm:p-10">
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="text-xl sm:text-2xl font-semibold">
            Reportes Consolidados Cerrados
          </div>
        </div>
        {/* Filtros de búsqueda */}

        {/* Tabla con contenido */}
        <div className="overflow-x-auto">
          <table className="table-auto text-center w-full border-collapse border border-gray-200 mt-2 text-sm sm:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">ID</th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Tipo
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Fecha Inicio
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Fecha Termino
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Cantidad de Ordenes
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {consolidadosOrdenados.map((consolidado) => (
                <tr key={consolidado.id}>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {consolidado.id}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {consolidado.ordenesAcopio?.[0]?.tipo || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {new Date(consolidado.fecha_inicio).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {new Date(consolidado.fecha_termino).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {consolidado.ordenesAcopio?.length || 0}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {consolidado.ordenesAcopio?.[0]?.tipo === "SS" ? (
                      <button
                        className="bg-orange-400 text-white font-semibold px-3 sm:px-4 py-2 w-full rounded hover:bg-orange-500 transition duration-300"
                        onClick={() => {}}
                      >
                        Informe de Cumplimiento
                      </button>
                    ) : null}
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

export default ConsolidadoPage;
