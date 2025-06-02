"use client";
import React from "react";
import { GET_LISTA_TRAZABILIDAD } from "@/graphql/query";
import { useQuery } from "@apollo/client";

type Trazabilidad = {
  id: number;
  numero_lote: string;
  fecha_elaboracion: string;
  fecha_vencimiento: string;
  temperatura: string;
  condicion_envasado: string;
  observaciones: string;
  producto: Producto;
};
type Producto = {
  id: number;
  codigo: string;
  nombre_producto: string;
  familia: string;
  unidad_medida: string;
  cantidad: number;
  cantidad_softland: number;
  trazabilidad: boolean;
};
const TrazabilidadPage: React.FC = () => {
  const { loading, error, data } = useQuery(GET_LISTA_TRAZABILIDAD);
  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data || !data.listaTrazabilidad) return <p>No hay datos disponibles.</p>;
  const trazabilidadList: Trazabilidad[] = data.listaTrazabilidad;
  return (
    <div className="p-4 sm:p-10">
      <div className="bg-white p-6 rounded shadow">
        {/* Titulo */}
        <h1 className="text-2xl font-bold mb-4">Trazabilidad</h1>
        {/* Tabla Contenidos */}
        <div className="overflow-x-auto">
          <table className="table-auto text-center w-full border-collapse border border-gray-200 mt-2 text-sm sm:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">ID</th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Producto
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Lote
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Fecha Elaboración
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Fecha Vencimiento
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Temperatura
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Condición Envasado
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Observaciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trazabilidadList.map((item) => {
                // Convertir fechas a objetos Date
                const fechaVencimiento = new Date(item.fecha_vencimiento);
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);

                // Calcular fecha dentro de 3 meses
                const tresMesesDespues = new Date(hoy);
                tresMesesDespues.setMonth(tresMesesDespues.getMonth() + 3);

                // Determinar clase de color
                let rowClass = "";
                if (fechaVencimiento < hoy) {
                  rowClass = "bg-red-200";
                } else if (fechaVencimiento < tresMesesDespues) {
                  rowClass = "bg-green-200";
                }

                return (
                  <tr key={item.id} className={rowClass}>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {item.id}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {item.producto.nombre_producto}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {item.numero_lote}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {item.fecha_elaboracion}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {item.fecha_vencimiento}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {item.temperatura}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {item.condicion_envasado}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {item.observaciones}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrazabilidadPage;
