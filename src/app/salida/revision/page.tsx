"use client";
import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_ORDENES_ACOPIO } from "@/graphql/query";
import Alert from "@/components/Alert";
import ListaVacia from "@/components/listaVacia";
import { OrdenAcopio } from "@/types/graphql";

const RevisionPage: React.FC = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  const { loading, error, data } = useQuery(GET_ORDENES_ACOPIO, {
    variables: { estado: "Confirmacion" },
  });
  if (loading) {
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>Cargando ordenes de acopio...</p>
        </div>
      </div>
    );
  }
  if (error) {
    setAlertType("error");
    setAlertMessage(error.message);
    setShowAlert(true);
  }
  const ordenesAcopio: OrdenAcopio[] = data.ordenAcopiosByEstado;
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
        <div className="text-xl sm:text-2xl font-semibold">
          Revision de Acopio de Productos
        </div>
        <div className="overflow-x-auto">
          <table className="table-auto text-center w-full border-collapse border border-gray-200 mt-2 text-sm sm:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">ID</th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Centro de Costo
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Fecha
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
              {ordenesAcopio.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center">
                    <ListaVacia mensaje="No hay ordenes de Acopio listas para Revisión." />
                  </td>
                </tr>
              )}
              {ordenesAcopio.map((orden) => (
                <tr key={orden.id}>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {orden.id}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {orden.centro_costo}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {orden.fecha_despacho || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {orden.estado}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    <button
                      className="bg-orange-400 text-white font-semibold px-3 sm:px-4 py-2 w-full rounded hover:bg-orange-500 transition duration-300"
                      onClick={() => {
                        window.location.href = `/salida/${orden.id}`;
                      }}
                    >
                      Detalles
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

export default RevisionPage;
