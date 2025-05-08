"use client";
import React, { useState } from "react";
import { useQuery, gql } from "@apollo/client";
import NuevaOrdenAcopio from "@/components/adquisiciones/nuevaOrdenAcopio";
import { useAdquisicionStore } from "@/store/adquisicionStore";
import Alert from "@/components/Alert";
import { GET_ORDENES_ACOPIO } from "@/graphql/query";
type OrdenAcopio = {
  id: number;
  centroCosto: string;
  fecha: string;
  estado: string;
};

const AcopioPage: React.FC = () => {
  const [modalNuevaOrdenAcopio, setModalNuevaOrdenAcopio] = useState(false);
  const { estadoOrdenAcopio, setEstadoOrdenAcopio } = useAdquisicionStore();
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");

  const { loading, error, data, refetch } = useQuery(GET_ORDENES_ACOPIO, {
    variables: { estado: "Revision" },
  });

  const abrirModalNuevaOrdenAcopio = () => {
    setModalNuevaOrdenAcopio(true);
  };

  const cerrarModalNuevaOrdenAcopio = () => {
    setModalNuevaOrdenAcopio(false);
  };

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

  const ordenes: OrdenAcopio[] = data.ordenAcopiosByEstado;

  return (
    <div className="p-4 sm:p-10">
      <NuevaOrdenAcopio
        isOpen={modalNuevaOrdenAcopio}
        onClose={cerrarModalNuevaOrdenAcopio}
      />
      {showAlert && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}

      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="text-xl sm:text-2xl font-semibold">
            Lista de Acopio
          </div>
          <button
            className="bg-orange-400 text-white font-semibold p-3 sm:p-4 rounded hover:bg-orange-500 transition duration-300 w-full sm:w-auto"
            onClick={abrirModalNuevaOrdenAcopio}
          >
            Nueva Orden de Acopio
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="table-auto text-center w-full border-collapse border border-gray-200 mt-2 text-sm sm:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">ID</th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Centro Costo
                </th>
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
                    {orden.centroCosto}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {orden.fecha}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {orden.estado}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    <button
                      className="bg-orange-400 text-white font-semibold px-3 sm:px-4 py-2 w-full rounded hover:bg-orange-500 transition duration-300"
                      onClick={() => {
                        window.location.href = `/adquisiciones/${orden.id}`;
                        setEstadoOrdenAcopio(orden.estado);
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

export default AcopioPage;
