"use client";
import React from "react";
import { useQuery } from "@apollo/client";
import { GET_OC_EN_SEMANA } from "@/graphql/query";
import { ListadoOCDto } from "@/types/graphql";

const OrdenEntrantesPage = () => {
  const { loading, error, data } = useQuery(GET_OC_EN_SEMANA);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const ordenes: ListadoOCDto[] = (data?.obtenerOCenSemana || [])
    .slice()
    .sort(
      (
        a: { FecFinalOC: string | number | Date },
        b: { FecFinalOC: string | number | Date }
      ) => new Date(a.FecFinalOC).getTime() - new Date(b.FecFinalOC).getTime()
    );
  return (
    <div className="p-4 sm:p-10">
      <div className="bg-white p-6 rounded shadow">
        {/* Cabecera */}
        <h1 className="text-2xl font-semibold">Ordenes de Compra</h1>
        <h2 className="text-lg text-gray-600 mt-2">
          Se muestran las ordenes de compra entrantes en los proximos 7 días.
        </h2>
        {/* Tabla de Ordenes */}
        <div className="overflow-x-auto">
          <table className="table-auto text-center w-full border-collapse border border-gray-200 mt-4 text-sm sm:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
                  N° Orden de Compra
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
                  Proveedor
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
                  Fecha de Entrega
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((orden) => (
                <tr key={orden.NumInterOC} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
                    {orden.NumOC}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
                    {orden.NomAux}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
                    {new Date(
                      new Date(orden.FecFinalOC).getTime() + 24 * 60 * 60 * 1000
                    ).toLocaleDateString("es-ES")}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
                    <button
                      className="font-semibold p-2 sm:p-3 rounded transition duration-300 w-full  whitespace-nowrap bg-orange-400 text-white hover:bg-orange-500"
                      onClick={() => {
                        window.location.href = `/producto/orden_compra/${orden.NumInterOC}/${orden.NumOC}`;
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

export default OrdenEntrantesPage;
