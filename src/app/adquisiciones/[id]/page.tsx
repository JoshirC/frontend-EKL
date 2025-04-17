"use client";

import React, { useEffect, useState, use } from "react";
import { useAdquisicionStore } from "@/store/adquisicionStore";

type DetalleOrdenAcopio = {
  idDetalleOrdenAcopio: number;
  idAcopio: number;
  FamiliaProducto: string;
  CodigoProducto: string;
  DescripcionProducto: string;
  UnidadMedida: string;
  Cantidad: number;
};

export default function AcopioIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Correcto: usando use() para desempaquetar la Promise
  const { id: id_acopio } = use(params);
  const { estadoOrdenAcopio } = useAdquisicionStore();
  //const estadoOrdenAcopio = "Listo"; // Cambiar según el estado de la orden de acopio con el backend o guardar el estado en una constante global.
  const [detalleOrdenAcopio, setDetalleOrdenAcopio] = useState<
    DetalleOrdenAcopio[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetalleOrden = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/detalleOrdenAcopio.json`);
        if (!response.ok) {
          throw new Error("Error al cargar los datos");
        }

        const data = await response.json();
        // El backend debe traerme ya filtrado este dato.
        const detalleOrdenAcopioId = data.filter(
          (detalle: DetalleOrdenAcopio) =>
            detalle.idAcopio === Number(id_acopio)
        );

        setDetalleOrdenAcopio(detalleOrdenAcopioId);
      } catch (error) {
        console.error("Error al cargar el JSON:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Ocurrió un error desconocido"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id_acopio) {
      fetchDetalleOrden();
    }
  }, [id_acopio]); // Asegúrate de incluir id_acopio como dependencia

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
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10">
      <div className="bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <div className="text-2xl font-semibold">
            Detalles de Acopio N°{id_acopio}
          </div>
          {estadoOrdenAcopio && ["Pendiente"].includes(estadoOrdenAcopio) && (
            <div>
              <button className="bg-orange-400 text-white font-semibold p-4 rounded hover:bg-orange-500 transition duration-300">
                Confirmar Acopio
              </button>
              <button className="bg-red-500 text-white font-semibold p-4 rounded hover:bg-red-600 transition duration-300 ml-2">
                Cancelar Acopio
              </button>
            </div>
          )}
        </div>
        {detalleOrdenAcopio.length === 0 ? (
          <p className="mt-4">No se encontraron detalles para este acopio</p>
        ) : (
          <table className="table-fixed w-full border-collapse border border-gray-200 mt-2">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-4 py-2">
                  Familia Producto
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  Codigo Producto
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  Descripcion Producto
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  Unidad Medida
                </th>
                <th className="border border-gray-300 px-4 py-2">Cantidad</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
