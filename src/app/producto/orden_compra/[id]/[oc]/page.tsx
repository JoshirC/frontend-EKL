"use client";

import React, { use } from "react";
import { useQuery } from "@apollo/client";
import { GET_DETALLE_OC_BY_ID } from "@/graphql/query";
import { OCDetalleDto } from "@/types/graphql";

export default function detalleOrdenCompraPage({
  params,
}: {
  params: Promise<{ id: number; oc: number }>;
}) {
  const { id: NumInterOC, oc: NumOC } = use(params);
  const idNumInterOC = Number(NumInterOC);
  const { loading, error, data } = useQuery(GET_DETALLE_OC_BY_ID, {
    variables: { numInterOC: idNumInterOC },
  });

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const listado: OCDetalleDto[] = data?.detalleOC || [];

  if (!listado.length) return <p>Orden no encontrada</p>;

  return (
    <div className="p-4 sm:p-10">
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h1 className="text-xl sm:text-2xl font-semibold">
            Detalles de Orden de Compra N°{NumOC}
          </h1>
          <button
            className="font-semibold p-2 sm:p-3 rounded transition duration-300 bg-orange-400 text-white hover:bg-orange-500"
            onClick={() => {
              window.location.href = `/producto/orden_compra`;
            }}
          >
            Volver a Ordenes de Compra
          </button>
        </div>
        {/* Tabla de Detalles */}
        <div className="overflow-x-auto mt-4">
          <table className="table-auto text-center w-full border-collapse border border-gray-200 text-sm sm:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
                  Código Producto
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
                  Descripción
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
                  Cantidad
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
                  Precio Unitario
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {listado.map((item) => (
                <tr key={item.CodProd} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
                    {item.CodProd}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
                    {item.DetProd}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
                    {item.Cantidad}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
                    {item.PrecioUnit.toLocaleString("es-CL", {
                      style: "currency",
                      currency: "CLP",
                    })}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
                    {(item.Cantidad * item.PrecioUnit).toLocaleString("es-CL", {
                      style: "currency",
                      currency: "CLP",
                    })}
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
