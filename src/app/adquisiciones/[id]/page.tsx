"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useAdquisicionStore } from "@/store/adquisicionStore";
import Alert from "@/components/Alert";
import { GET_ORDEN_ACOPIO } from "@/graphql/query";
import {
  UPDATE_ESTADO_ORDEN_ACOPIO,
  ELIMINAR_ORDEN_ACOPIO,
} from "@/graphql/mutations";
import Confirmacion from "@/components/confirmacion";
type Producto = {
  codigo: string;
  nombre_producto: string;
  unidad_medida: string;
  familia: string;
};
type DetalleOrdenAcopio = {
  id: number;
  codigo_producto: string;
  cantidad: number;
  producto: Producto;
};

export default function AcopioIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: id_acopio } = React.use(params);
  const id_acopio_num = parseInt(id_acopio);

  // Estado de la alerta
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");

  // Estado de la confirmacion
  const [showConfirmacion, setShowConfirmacion] = useState(false);

  const { loading, error, data } = useQuery(GET_ORDEN_ACOPIO, {
    variables: { id: id_acopio_num },
  });
  const [eliminarOrdenAcopio] = useMutation(ELIMINAR_ORDEN_ACOPIO, {
    onCompleted: () => {
      setAlertType("exitoso");
      setAlertMessage("La orden de acopio se ha eliminado correctamente");
      setShowAlert(true);
      setTimeout(() => {
        window.location.href = "/adquisiciones/acopio/";
      }, 2000);
    },
    onError: (mutationError) => {
      setAlertType("error");
      setAlertMessage(mutationError.message);
      setShowAlert(true);
    },
  });
  const [updateEstadoOrdenAcopio] = useMutation(UPDATE_ESTADO_ORDEN_ACOPIO, {
    onCompleted: () => {
      setAlertType("exitoso");
      setAlertMessage("La orden de acopio se ha confirmado correctamente");
      setShowAlert(true);
      setTimeout(() => {
        window.location.href = "/adquisiciones/acopio/";
      }, 2000);
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
  const handleEliminarOrdenAcopio = () => {
    try {
      eliminarOrdenAcopio({
        variables: {
          id: id_acopio_num,
        },
      });
    } catch (error) {
      setAlertType("error");
      setAlertMessage("Error al eliminar la orden de acopio");
      setShowAlert(true);
    }
  };
  const handleConfirmacion = (confirmado: boolean) => {
    if (confirmado) {
      handleEliminarOrdenAcopio();
    }
    setShowConfirmacion(false);
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
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>Error al cargar los detalles del acopio: {error.message}</p>
        </div>
      </div>
    );
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
      {showConfirmacion && (
        <Confirmacion
          isOpen={showConfirmacion}
          titulo="Eliminar Orden de Acopio"
          mensaje={`¿Estás seguro de que deseas eliminar la orden de Acopio?`}
          onClose={() => setShowConfirmacion(false)}
          onConfirm={handleConfirmacion}
        />
      )}
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="text-xl sm:text-2xl font-semibold">
            Detalles de Acopio N°{id_acopio}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              className="bg-orange-400 text-white font-semibold p-3 sm:p-4 rounded hover:bg-orange-500 transition duration-300 w-full sm:w-auto"
              onClick={handleConfirmarAcopio}
            >
              Confirmar Acopio
            </button>
            <button
              className="bg-red-500 text-white font-semibold p-3 sm:p-4 rounded hover:bg-red-600 transition duration-300 w-full sm:w-auto"
              onClick={() => {
                setShowConfirmacion(true);
              }}
            >
              Cancelar Acopio
            </button>
          </div>
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
                      {detalle.producto.familia}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.producto.nombre_producto}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.codigo_producto}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.producto.unidad_medida}
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
