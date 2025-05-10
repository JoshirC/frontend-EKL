"use client";

import React, { use, useState } from "react";
import { useQuery } from "@apollo/client";
import { useSalidaStore } from "@/store/salidaStore";
import { GET_ORDENES_ACOPIO_DOS_ESTADOS } from "@/graphql/query";
import Alert from "@/components/Alert";

type OrdenAcopio = {
  id: number;
  centroCosto: string;
  fecha: string;
  estado: string;
};

export default function CentroCostoNamePage({
  params,
}: {
  params: Promise<{ centro_costo: string }>;
}) {
  const { centro_costo } = use(params);
  const sanitizedCentroCosto = decodeURIComponent(centro_costo).replace(
    /[^a-zA-Z0-9 ]/g,
    ""
  );
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  const { setCentroCosto, setFecha, setEstado } = useSalidaStore();

  const { loading, error, data } = useQuery(GET_ORDENES_ACOPIO_DOS_ESTADOS, {
    variables: {
      centroCosto: sanitizedCentroCosto,
      estado1: "Pendiente",
      estado2: "Proceso",
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

  const ordenes: OrdenAcopio[] = data.ordenAcopioByCentroCostoYEstados;

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
        <div className="text-xl sm:text-2xl font-semibold mb-4">
          Lista de Acopio {sanitizedCentroCosto}
        </div>
        <div className="overflow-x-auto">
          <table className="table-auto text-center w-full border-collapse border border-gray-200 mt-2 text-sm sm:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">ID</th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Fecha Ingreso
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
              {ordenes.map((orden) => (
                <tr key={orden.id}>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {orden.id}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {orden.fecha}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {orden.estado}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {orden.estado === "Pendiente" ? (
                      <button
                        className="bg-orange-400 text-white w-full font-semibold p-3 sm:p-4 rounded hover:bg-orange-500 transition duration-300"
                        onClick={() => {
                          window.location.href = `/salida/${orden.id}`;
                          setCentroCosto(orden.centroCosto);
                          setFecha(orden.fecha);
                          setEstado(orden.estado);
                        }}
                      >
                        Comenzar Acopio
                      </button>
                    ) : (
                      <button
                        className="bg-blue-400 text-white w-full font-semibold p-3 sm:p-4 rounded hover:bg-blue-500 transition duration-300"
                        onClick={() => {
                          window.location.href = `/salida/${orden.id}`;
                          setCentroCosto(orden.centroCosto);
                          setFecha(orden.fecha);
                          setEstado(orden.estado);
                        }}
                      >
                        Continuar Acopio
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
