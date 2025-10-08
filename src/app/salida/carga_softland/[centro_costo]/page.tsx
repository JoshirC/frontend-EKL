"use client";

import React, { use, useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_ORDENES_ACOPIO_DOS_ESTADOS } from "@/graphql/query";
import Alert from "@/components/Alert";
import ListaVacia from "@/components/listaVacia";
import { OrdenAcopio } from "@/types/graphql";

export default function CentroCostoNamePage({
  params,
}: {
  params: Promise<{ centro_costo: string }>;
}) {
  const { centro_costo } = use(params);
  const sanitizedCentroCosto = decodeURIComponent(centro_costo).replace(
    /[^a-zA-Z0-9 .ñÑ]/g,
    ""
  );
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");

  const { loading, error, data } = useQuery(GET_ORDENES_ACOPIO_DOS_ESTADOS, {
    variables: {
      centroCosto: sanitizedCentroCosto,
      estados: ["Parcial", "Subir"],
    },
  });

  if (loading) {
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>Cargando órdenes de acopio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    setAlertType("error");
    setAlertMessage(error.message);
    setShowAlert(true);
  }

  const ordenes: OrdenAcopio[] =
    data?.ordenAcopioByCentroCostoYMultiplesEstados || [];

  return (
    <div className="p-4 sm:p-10">
      {showAlert && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <div className="text-xl sm:text-2xl font-bold mb-4">
          Generar Guías de Salida "{sanitizedCentroCosto}"
        </div>
        <div className="overflow-x-auto">
          <table className="table-auto text-center w-full border-collapse border border-gray-200 mt-2 text-sm sm:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">ID</th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Fecha Despacho
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Estado
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {ordenes.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center">
                    <ListaVacia mensaje="El centro de Costo no tiene listas de Acopio" />
                  </td>
                </tr>
              )}
              {ordenes.map((orden) => (
                <tr key={orden.id}>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {orden.id}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {orden.fecha_despacho}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {orden.estado}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {orden.estado === "Parcial" ? (
                      <button
                        className="bg-blue-400 text-white w-full font-semibold p-3 sm:p-4 rounded hover:bg-blue-500 transition duration-300"
                        onClick={() => {
                          window.location.href = `/salida/carga_softland/centro_costo/${orden.id}`;
                        }}
                      >
                        Generar Guías Parcial
                      </button>
                    ) : (
                      <button
                        className="bg-orange-400 text-white w-full font-semibold p-3 sm:p-4 rounded hover:bg-orange-500 transition duration-300"
                        onClick={() => {
                          window.location.href = `/salida/carga_softland/centro_costo/${orden.id}`;
                        }}
                      >
                        Generar Guías
                      </button>
                    )}
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
