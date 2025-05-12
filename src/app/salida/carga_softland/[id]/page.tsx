"use client";
import React, { useState, use } from "react";
import Barcode from "react-barcode";
import { GET_GUIA_DE_SALIDA } from "@/graphql/query";
import { ELIMINAR_GUIA_SALIDA } from "@/graphql/mutations";
import { useQuery, useMutation } from "@apollo/client";
import Alert from "@/components/Alert";
import Confirmacion from "@/components/confirmacion";

type Envio = {
  id: number;
  codigo_producto_enviado: string;
  cantidad_enviada: number;
};
type GuiaSalida = {
  id: number;
  codigo: string;
  envios: Envio[];
};

export default function CargaSoftlandDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: id_salida } = use(params);
  const id_salida_num = parseFloat(id_salida);

  // Componente para mostrar la alerta
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  const [cerrarModal, setCerrarModal] = useState(false);

  // Estado de la confirmacion
  const [showConfirmacion, setShowConfirmacion] = useState(false);

  const { loading, error, data } = useQuery(GET_GUIA_DE_SALIDA, {
    variables: { id: id_salida_num },
  });
  const [EliminarGuiaSalida] = useMutation(ELIMINAR_GUIA_SALIDA, {
    variables: { id: id_salida_num },
    onCompleted: () => {
      setAlertType("exitoso");
      setAlertMessage("La guía de salida se ha eliminado correctamente");
      setShowAlert(true);
      setCerrarModal(true);

      setTimeout(() => {
        window.location.href = "/salida/carga_softland";
      }, 2000);
    },
  });
  const handleEliminarGuiaSalida = async () => {
    try {
      await EliminarGuiaSalida();
    } catch (error) {
      setAlertType("error");
      setAlertMessage(
        "Error al eliminar la guía de salida, descripción: " + error
      );
      setShowAlert(true);
    }
  };
  const handleConfirmacion = (confirmado: boolean) => {
    if (confirmado) {
      handleEliminarGuiaSalida();
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
          <p className="text-red-500">
            Error al cargar detalles del acopio, descripción del error:{" "}
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  const guiaSalida: GuiaSalida = data?.guiaDeSalida || null;
  return (
    <div className="p-4 sm:p-10">
      {showAlert && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
          cerrar={cerrarModal}
        />
      )}
      {showConfirmacion && (
        <Confirmacion
          isOpen={showConfirmacion}
          titulo="Termino de Guia de Salida"
          mensaje={`¿Estás seguro de que terminaste de subir la Guia a Softland?\nRecuerda que la guia se eliminara de este sistema una vez subida.`}
          onClose={() => setShowConfirmacion(false)}
          onConfirm={handleConfirmacion}
        />
      )}
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="text-xl sm:text-2xl font-semibold">
            Detalle de Guia de Salida N°{id_salida}
          </div>
          <button
            className="bg-orange-400 hover:bg-orange-500 font-semibold text-white p-3 sm:px-4 sm:py-2 rounded w-full sm:w-auto"
            onClick={() => {
              setShowConfirmacion(true);
            }}
          >
            Finalizar
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="table-auto text-center w-full border-collapse border border-gray-200 text-sm sm:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Código Producto
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Código de Barras Producto
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Descripción Producto
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Cantidad
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Código de Barras Cantidad
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Unidad de Medida
                </th>
              </tr>
            </thead>
            <tbody>
              {guiaSalida.envios.map((envio) => (
                <tr key={envio.id}>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {envio.codigo_producto_enviado}
                  </td>
                  <td className="border border-gray-200 px-2 sm:px-4 py-2 flex justify-center">
                    <Barcode
                      value={envio.codigo_producto_enviado}
                      height={75}
                    />
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {/* Replace with actual product description if available */}
                    Descripción no disponible
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {envio.cantidad_enviada}
                  </td>
                  <td className="border border-gray-200 px-2 sm:px-4 py-2 flex justify-center">
                    <Barcode
                      value={envio.cantidad_enviada.toString()}
                      height={75}
                    />
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    Unidad no disponible
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
