"use client";
import React, { useState } from "react";
import { UPDATE_CANTIDAD_ENVIO_DETALLE } from "@/graphql/mutations";
import { useMutation } from "@apollo/client";

interface Envio {
  id: number;
  cantidad_enviada: number;
  codigo_producto_enviado: string;
}
interface DetalleOrdenAcopio {
  familia_producto: string;
  nombre_producto: string;
  codigo_producto: string;
}

interface DropdownEnviosDetalleOrdenAcopioProps {
  envios: Envio[];
  detalleOrdenAcopio: DetalleOrdenAcopio;
  isOpen: boolean;
  onClose: () => void;
}

const DropdownEnviosDetalleOrdenAcopio: React.FC<
  DropdownEnviosDetalleOrdenAcopioProps
> = ({ envios, isOpen, detalleOrdenAcopio, onClose }) => {
  if (!isOpen) return null;

  const [activarEditar, setActivarEditar] = useState(false);

  // Estado para manejar los valores de edición por cada envío
  const [editValues, setEditValues] = useState<Record<number, string>>({});
  const [editLoading, setEditLoading] = useState<number | null>(null);

  const [updateCantidadEnvioDetalle] = useMutation(
    UPDATE_CANTIDAD_ENVIO_DETALLE,
    {
      onCompleted: () => {
        setEditLoading(null);
      },
      onError: (mutationError) => {
        console.error(
          "Error al actualizar la cantidad:",
          mutationError.message
        );
        alert(
          "Ocurrió un error al actualizar la cantidad. Intente nuevamente."
        );
        setEditLoading(null);
      },
    }
  );

  const handleEditChange = (envioId: number, value: string) => {
    setEditValues((prev) => ({
      ...prev,
      [envioId]: value,
    }));
  };

  const handleSaveEdit = async (envioId: number) => {
    const value = editValues[envioId];

    if (!value || isNaN(Number(value))) {
      alert("Por favor ingrese una cantidad válida");
      return;
    }

    const cantidad = Number(value);
    if (cantidad <= 0) {
      alert("La cantidad debe ser mayor a 0");
      return;
    }

    setEditLoading(envioId);

    try {
      await updateCantidadEnvioDetalle({
        variables: {
          id: envioId,
          cantidad: cantidad,
        },
      });
      // Limpiar el valor de edición solo para este envío
      setEditValues((prev) => {
        const newValues = { ...prev };
        delete newValues[envioId];
        return newValues;
      });
    } catch (error) {
      console.error("Error al actualizar la cantidad:", error);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded shadow-lg p-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-3">
        <h2 className="text-base font-semibold sm:text-lg">
          Listado de Envíos
        </h2>
        <div className="flex gap-2 sm:gap-4">
          <button
            className="bg-orange-400 text-white font-semibold p-2 sm:px-4 sm:py-2 rounded hover:bg-orange-500 transition duration-200"
            onClick={() => {
              setActivarEditar(!activarEditar);
              // Limpiar todos los valores de edición al cancelar
              if (activarEditar) {
                setEditValues({});
              }
            }}
          >
            {activarEditar ? "Cancelar" : "Editar Cantidades"}
          </button>
          <button
            className="bg-gray-500 text-white font-semibold p-2 sm:px-4 sm:py-2 rounded hover:bg-gray-600 transition duration-200"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-around items-center my-3 gap-4 sm:gap-6 font-bold">
        <div className="bg-gray-200 p-3 sm:p-2 text-black rounded w-full text-center">
          Producto - {detalleOrdenAcopio.nombre_producto}
        </div>
        <div className="bg-gray-200 p-3 sm:p-2 text-black rounded w-full text-center">
          Codigo Producto - {detalleOrdenAcopio.codigo_producto}
        </div>
        <div className="bg-gray-200 p-3 sm:p-2 text-black rounded w-full text-center">
          Familia Producto - {detalleOrdenAcopio.familia_producto}
        </div>
      </div>

      {envios.map((envio) => (
        <div
          key={envio.id}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 mt-2 gap-2 sm:gap-4"
        >
          <div className="flex flex-col gap-1 sm:gap-2">
            <h2 className="text-sm sm:text-base">
              Código producto Enviado: {envio.codigo_producto_enviado}
            </h2>
          </div>
          <div className="flex flex-col justify-end sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-1/3">
            {activarEditar ? (
              <div className="flex justify-between items-center space-x-4 w-full">
                <input
                  type="number"
                  placeholder={`Cantidad enviada: ${String(
                    envio.cantidad_enviada
                  )}`}
                  value={editValues[envio.id] ?? ""}
                  onChange={(e) => handleEditChange(envio.id, e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm sm:text-base"
                />
                <button
                  onClick={() => handleSaveEdit(envio.id)}
                  disabled={editLoading === envio.id}
                  className="bg-blue-400 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded transition duration-200 w-full"
                >
                  {editLoading === envio.id ? (
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    "Guardar"
                  )}
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-sm sm:text-base w-full text-center">
                  Cantidad enviada: {String(envio.cantidad_enviada)}
                </h2>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DropdownEnviosDetalleOrdenAcopio;
