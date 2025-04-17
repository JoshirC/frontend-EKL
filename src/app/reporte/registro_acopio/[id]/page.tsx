"use client";

import React, { use, useEffect, useState } from "react";
type DetalleSalidaAcopio = {
  idDetalleSalidaAcopio: number;
  idOrdenAcopio: number;
  idSalida: number;
  codProducto: string;
  nombreProducto: string;
  cantidadEnviada: number;
  codigoProductoReemplazo: string;
  nombreProductoReemplazo: string;
  cantidadEnviadaReemplazo: number;
};
export default function RegistroAcopioIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: id_acopio } = use(params);
  const [detalleSalidaAcopio, setDetalleSalidaAcopio] = useState<
    DetalleSalidaAcopio[]
  >([]);
  useEffect(() => {
    const fetchDetalleSalidaAcopio = async () => {
      try {
        const response = await fetch(`/api/detalleSalidaAcopio.json`);
        const data = await response.json();
        const detalleSalidaAcopioFiltrado = data.filter(
          (detalle: DetalleSalidaAcopio) =>
            detalle.idOrdenAcopio === parseInt(id_acopio)
        );
        setDetalleSalidaAcopio(detalleSalidaAcopioFiltrado);
      } catch (error) {
        console.error("Error al cargar el JSON:", error);
      }
    };
    fetchDetalleSalidaAcopio();
  }, []);
  return (
    <div className="p-10">
      <div className="bg-white p-6 rounded shadow">
        <div className="text-2xl font-semibold">
          Detalles de Salida de la Orden de Acopio N°{id_acopio}
        </div>
        <table className="table-fixed w-full border-collapse border border-gray-200 mt-4">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2">
                Código Producto Solicitado
              </th>
              <th className="border border-gray-300 px-4 py-2">
                Nombre Producto Solicitado
              </th>
              <th className="border border-gray-300 px-4 py-2">
                Cantidad Solicitada
              </th>
              <th className="border border-gray-300 px-4 py-2">
                Código Producto Enviado
              </th>
              <th className="border border-gray-300 px-4 py-2">
                Nombre Producto Enviado
              </th>
              <th className="border border-gray-300 px-4 py-2">
                Cantidad Enviada
              </th>
            </tr>
          </thead>
          <tbody>
            {detalleSalidaAcopio.map((detalle) => (
              <tr
                key={detalle.idDetalleSalidaAcopio}
                className={`${
                  detalle.codProducto !== detalle.codigoProductoReemplazo
                    ? "bg-orange-100"
                    : ""
                }`}
              >
                <td className="border border-gray-300 px-4 py-2 ">
                  {detalle.codigoProductoReemplazo}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {detalle.nombreProductoReemplazo}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {detalle.cantidadEnviadaReemplazo}
                </td>
                <td
                  className={`border border-gray-300 px-4 py-2 ${
                    detalle.codProducto !== detalle.codigoProductoReemplazo
                      ? "bg-orange-100"
                      : "bg-gray-100"
                  }`}
                >
                  {detalle.codProducto}
                </td>
                <td
                  className={`border border-gray-300 px-4 py-2 ${
                    detalle.codProducto !== detalle.codigoProductoReemplazo
                      ? "bg-orange-100"
                      : "bg-gray-100"
                  }`}
                >
                  {detalle.nombreProducto}
                </td>
                <td
                  className={`border border-gray-300 px-4 py-2 ${
                    detalle.codProducto !== detalle.codigoProductoReemplazo
                      ? "bg-orange-100"
                      : "bg-gray-100"
                  }`}
                >
                  {detalle.cantidadEnviada}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
