"use client";
import { maxHeaderSize } from "http";
import React, { useState, useEffect, use } from "react";
import Barcode from "react-barcode";

type DetalleSalida = {
  idOrdenAcopio: number;
  idSalida: number;
  codProducto: string;
  nombreProducto: string;
  cantidadEnviada: number;
};

export default function CargaSoftlandDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: id_salida } = use(params);
  const [detalleSalida, setDetalleSalida] = useState<DetalleSalida[]>([]);

  useEffect(() => {
    const fetchDetalleSalida = async () => {
      try {
        const response = await fetch("/api/detalleSalidaAcopio.json");
        const data = await response.json();
        const detallesFiltrados = data.filter(
          (detalle: DetalleSalida) => detalle.idSalida === Number(id_salida)
        );
        setDetalleSalida(detallesFiltrados);
      } catch (error) {
        console.error("Error al cargar los detalles:", error);
      }
    };

    fetchDetalleSalida();
  }, [detalleSalida]);

  return (
    <div className="p-4 sm:p-10">
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="text-xl sm:text-2xl font-semibold">
            Detalle de Guia de Salida N°{id_salida}
          </div>
          <button className="bg-orange-400 hover:bg-orange-500 font-semibold text-white p-3 sm:px-4 sm:py-2 rounded w-full sm:w-auto">
            Completar
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
                  Descrpción Producto
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
              {detalleSalida.map((detalle, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {detalle.codProducto}
                  </td>
                  <td className="border border-gray-200 px-2 sm:px-4 py-2 flex justify-center">
                    <Barcode value={detalle.codProducto} height={75} />
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {detalle.nombreProducto}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {detalle.cantidadEnviada}
                  </td>
                  <td className="border border-gray-200 px-2 sm:px-4 py-2 flex justify-center">
                    <Barcode
                      value={detalle.cantidadEnviada.toString()}
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
