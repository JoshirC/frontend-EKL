"use client";
import React, { useState, useEffect, use } from "react";
import Barcode from "react-barcode";
import { GET_GUIA_DE_SALIDA } from "@/graphql/query";
import { ELIMINAR_GUIA_SALIDA } from "@/graphql/mutations";
import { useQuery, useMutation } from "@apollo/client";
type Envio = {
  id: number;
  codigo_producto_enviado: string;
  cantidad_enviada: number;
};
type GuiaSalida = {
  id: number;
  codigo: string;
  envios: Envio[];
};

export default function CargaSoftlandDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: id_salida } = use(params);
  const id_salida_num = parseFloat(id_salida);
  console.log("ID de Salida:", id_salida);
  const { loading, error, data } = useQuery(GET_GUIA_DE_SALIDA, {
    variables: { id: id_salida_num },
  });
  const [EliminarGuiaSalida] = useMutation(ELIMINAR_GUIA_SALIDA, {
    variables: { id: id_salida_num },
    onCompleted: () => {
      window.location.href = "/salida/carga_softland";
    },
  });
  const handleEliminarGuiaSalida = async () => {
    try {
      await EliminarGuiaSalida();
    } catch (error) {
      console.error("Error al eliminar la guía de salida:", error);
      alert("Error al eliminar la guía de salida");
    }
  };
  if (loading) {
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>Cargando detalles del acopio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p className="text-red-500">
            Error al cargar los datos: {error.message}
          </p>
        </div>
      </div>
    );
  }

  const guiaSalida: GuiaSalida = data?.guiaDeSalida || null;
  return (
    <div className="p-4 sm:p-10">
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="text-xl sm:text-2xl font-semibold">
            Detalle de Guia de Salida N°{id_salida}
          </div>
          <button
            className="bg-orange-400 hover:bg-orange-500 font-semibold text-white p-3 sm:px-4 sm:py-2 rounded w-full sm:w-auto"
            onClick={handleEliminarGuiaSalida}
          >
            Finalizar
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="table-auto text-center w-full border-collapse border border-gray-200 text-sm sm:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Código Producto
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Código de Barras Producto
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Descripción Producto
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Cantidad
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Código de Barras Cantidad
                </th>
              </tr>
            </thead>
            <tbody>
              {guiaSalida.envios.map((envio) => (
                <tr key={envio.id}>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {envio.codigo_producto_enviado}
                  </td>
                  <td className="border border-gray-200 px-2 sm:px-4 py-2 flex justify-center">
                    <Barcode
                      value={envio.codigo_producto_enviado}
                      height={75}
                    />
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {/* Replace with actual product description if available */}
                    Descripción no disponible
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {envio.cantidad_enviada}
                  </td>
                  <td className="border border-gray-200 px-2 sm:px-4 py-2 flex justify-center">
                    <Barcode
                      value={envio.cantidad_enviada.toString()}
                      height={75}
                    />
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
