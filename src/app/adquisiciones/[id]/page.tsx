"use client";

import React, { useState } from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import { useAdquisicionStore } from "@/store/adquisicionStore";
import Alert from "@/components/Alert";
type DetalleOrdenAcopio = {
  id: number;
  familia_producto: string;
  nombre_producto: string;
  codigo_producto: string;
  cantidad: number;
  unidad: string;
};

const GET_ORDEN_ACOPIO = gql`
  query ordenAcopio($id: Float!) {
    ordenAcopio(id: $id) {
      id
      centroCosto
      fecha
      estado
      detalles {
        id
        familia_producto
        nombre_producto
        codigo_producto
        cantidad
        unidad
      }
    }
  }
`;
const UPDATE_ESTADO_ORDEN_ACOPIO = gql`
  mutation ($id: Float!, $estado: String!) {
    updateEstadoOrdenAcopio(id: $id, estado: $estado) {
      id
    }
  }
`;
export default function AcopioIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: id_acopio } = React.use(params);
  const id_acopio_num = parseInt(id_acopio);
  const { estadoOrdenAcopio } = useAdquisicionStore();
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");

  const { loading, error, data } = useQuery(GET_ORDEN_ACOPIO, {
    variables: { id: id_acopio_num },
  });
  const [updateEstadoOrdenAcopio] = useMutation(UPDATE_ESTADO_ORDEN_ACOPIO, {
    onCompleted: () => {
      // Redirigir a la página de adquisiciones/acopio después de la mutación
      window.location.href = "/adquisiciones/acopio/";
    },
    onError: (mutationError) => {
      setAlertType("error");
      setAlertMessage(mutationError.message);
      setShowAlert(true);
    },
  });
  const handleConfirmarAcopio = () => {
    updateEstadoOrdenAcopio({
      variables: {
        id: id_acopio_num,
        estado: "Pendiente",
      },
    });
  };

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
    setAlertType("error");
    setAlertMessage(error.message);
    setShowAlert(true);
  }

  const { detalles } = data.ordenAcopio;

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="text-xl sm:text-2xl font-semibold">
            Detalles de Acopio N°{id_acopio}
          </div>
          {estadoOrdenAcopio && ["Revision"].includes(estadoOrdenAcopio) && (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                className="bg-orange-400 text-white font-semibold p-3 sm:p-4 rounded hover:bg-orange-500 transition duration-300 w-full sm:w-auto"
                onClick={handleConfirmarAcopio}
              >
                Confirmar Acopio
              </button>
              <button className="bg-red-500 text-white font-semibold p-3 sm:p-4 rounded hover:bg-red-600 transition duration-300 w-full sm:w-auto">
                Cancelar Acopio
              </button>
            </div>
          )}
        </div>
        {detalles.length === 0 ? (
          <p className="mt-4">No se encontraron detalles para este acopio</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-auto text-center w-full border-collapse border border-gray-200 mt-2 text-sm sm:text-base">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Familia Producto
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Nombre Producto
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Código Producto
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Unidad
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Cantidad
                  </th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((detalle: DetalleOrdenAcopio) => (
                  <tr key={detalle.id}>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.familia_producto}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.nombre_producto}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.codigo_producto}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.unidad}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.cantidad}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
