"use client";

import React, { useEffect, useState, use } from "react";
import { useSalidaStore } from "@/store/salidaStore";

type DetalleOrdenAcopio = {
  idDetalleOrdenAcopio: number;
  idAcopio: number;
  FamiliaProducto: string;
  CodigoProducto: string;
  DescripcionProducto: string;
  UnidadMedida: string;
  Cantidad: number;
};

export default function AcopioSalidaIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: id_acopio } = use(params);
  const [detalleOrdenAcopio, setDetalleOrdenAcopio] = useState<
    DetalleOrdenAcopio[]
  >([]);
  const { centroCosto, fecha, estado } = useSalidaStore();
  useEffect(() => {
    const fetchDetalleOrden = async () => {
      try {
        const response = await fetch(`/api/detalleOrdenAcopio.json`);
        const data = await response.json();
        // El backend debe traerme ya filtrado este dato.
        const detalleOrdenAcopioId = data.filter(
          (detalle: DetalleOrdenAcopio) =>
            detalle.idAcopio === Number(id_acopio)
        );

        setDetalleOrdenAcopio(detalleOrdenAcopioId);
      } catch (error) {
        console.error("Error al cargar el JSON:", error);
      }
    };
    fetchDetalleOrden();
  }, [id_acopio]);
  return (
    <div className="p-10">
      <div className="bg-white p-6 rounded shadow">
        <div className="text-2xl font-semibold">
          Detalle de Acopio: {id_acopio}
        </div>
        <div className="flex justify-around items-center my-4 space-x-6 font-bold">
          <div className="bg-gray-200 p-4 text-black rounded w-full text-center">
            {centroCosto}
          </div>
          <div className="bg-gray-200 p-4 text-black rounded w-full text-center">
            {fecha}
          </div>
          <div className="bg-gray-200 p-4 text-black rounded w-full text-center">
            {estado}
          </div>
        </div>
        <table className="table-fixed w-full border-collapse border border-gray-200 mt-2">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Familia</th>
              <th className="border border-gray-300 px-4 py-2">Código</th>
              <th className="border border-gray-300 px-4 py-2">Descripción</th>
              <th className="border border-gray-300 px-4 py-2">Unidad</th>
              <th className="border border-gray-300 px-4 py-2">
                Cantidad Solicitada
              </th>
              <th className="border border-gray-300 px-4 py-2">
                Cantidad Enviada
              </th>
            </tr>
          </thead>
          <tbody>
            {detalleOrdenAcopio.map((detalle) => (
              <tr key={detalle.idDetalleOrdenAcopio}>
                <td className="border border-gray-300 px-4 py-2">
                  {detalle.FamiliaProducto}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {detalle.CodigoProducto}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {detalle.DescripcionProducto}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {detalle.UnidadMedida}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {detalle.Cantidad}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <input
                    type="number"
                    defaultValue={detalle.Cantidad}
                    className="w-full border border-gray-300 rounded p-2"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
