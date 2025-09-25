"use client";

import React, { useEffect, use, useState } from "react";
import { CONSOLIDADO_POR_TIPO_ORDEN } from "@/graphql/query";
import { useQuery } from "@apollo/client";
import { Consolidado } from "@/types/graphql";
export default function ConsoliadoPorTipoPage({
  params,
}: {
  params: Promise<{ tipo: string }>;
}) {
  const { tipo } = use(params);
  // Extrae letras y las agrupa en pares, luego las une con espacio
  const tipoNormalizado: string =
    tipo
      .replace(/[^A-Z]/gi, "") // Solo letras
      .match(/.{1,2}/g) // Agrupa en pares
      ?.join(" ") || ""; // Une con espacio
  const { loading, error, data } = useQuery(CONSOLIDADO_POR_TIPO_ORDEN, {
    variables: { tipoOrden: tipoNormalizado },
  });

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;
  const consolidado: Consolidado[] = data?.consolidadoPorTipoOrden || [];
  return (
    <div className="p-4 sm:p-10">
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="text-xl sm:text-2xl font-semibold">
            Consolidado de {tipoNormalizado}
          </div>
        </div>
        {/* Tabla de consolidado */}
        <div className="overflow-x-auto">
          <table className="table-auto text-center w-full border-collapse border border-gray-200 mt-2 text-sm sm:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">ID</th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Fecha Inicio
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Fecha Termino
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Estado
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Cantidad de Solicitudes
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {consolidado.map((item) => (
                <tr key={item.id}>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {item.id}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {new Date(item.fecha_inicio).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {new Date(item.fecha_termino).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {item.estado}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {item.ordenesAcopio?.length || 0}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    <button
                      className="bg-orange-400 text-white font-semibold w-full px-3 py-1 rounded hover:bg-orange-500 transition duration-300"
                      onClick={() => {
                        const tipoUrl =
                          tipoNormalizado === "SR ES" ? "SS" : tipoNormalizado;
                        window.location.href = `/adquisiciones/consolidado/${tipoUrl}/${item.id}`;
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
}
