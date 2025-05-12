"use client";
import React, { useState } from "react";
import {
  UPDATE_CANTIDAD_ENVIO_DETALLE,
  REMOVE_ENVIO_DETALLE_ORDEN_ACOPIO,
} from "@/graphql/mutations";
import { useMutation } from "@apollo/client";
import Alert from "../Alert";
import Confirmacion from "../confirmacion";
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
  onProcesoCompleto?: () => void;
}

const DropdownEnviosDetalleOrdenAcopio: React.FC<
  DropdownEnviosDetalleOrdenAcopioProps
> = ({ envios, isOpen, detalleOrdenAcopio, onClose, onProcesoCompleto }) => {
  if (!isOpen) return null;
  // Estado para manejar la alerta
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");

  // Estado para manejar la confirmación de eliminación
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [idEnvioEliminar, setIdEnvioEliminar] = useState<number | null>(null);

  const [cerrarModal, setCerrarModal] = useState(false);
  const [activarEditar, setActivarEditar] = useState(false);

  // Estado para manejar los valores de edición y eliminacion por cada envío
  const [editValues, setEditValues] = useState<Record<number, string>>({});
  const [editLoading, setEditLoading] = useState<number | null>(null);
  const [enviosEliminados, setEnviosEliminados] = useState<number[]>([]);

  const [updateCantidadEnvioDetalle] = useMutation(
    UPDATE_CANTIDAD_ENVIO_DETALLE,
    {
      onCompleted: () => {
        setEditLoading(null);
      },
      onError: (mutationError) => {
        setAlertType("error");
        setAlertMessage(
          "Error al actualizar la cantidad del envío, descripción: " +
            mutationError.message
        );
        setShowAlert(true);
        setEditLoading(null);
      },
    }
  );
  const [removeEnvioDetalleOrdenAcopio] = useMutation(
    REMOVE_ENVIO_DETALLE_ORDEN_ACOPIO,
    {
      onCompleted: () => {
        setAlertType("exitoso");
        setAlertMessage("El envío se ha eliminado correctamente");
        setShowAlert(true);
        setCerrarModal(true);
        setEditLoading(null);
      },
      onError: (error) => {
        setAlertType("error"),
          setAlertMessage(
            "Error al eliminar el envío, descripción: " + error.message
          );
        setShowAlert(true);
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
      setAlertType("advertencia");
      setAlertMessage("La cantidad debe ser un número válido");
      setShowAlert(true);
      return;
    }

    const cantidad = Number(value);
    if (cantidad <= 0) {
      setAlertType("advertencia");
      setAlertMessage("La cantidad debe ser mayor o igual a cero");
      setShowAlert(true);
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
      setAlertType("error");
      setAlertMessage(
        "Error al actualizar la cantidad del envío, descripción: " + error
      );
      setShowAlert(true);
    }
  };
  const handleEliminarEnvio = async (id: number) => {
    setEnviosEliminados((prev) => [...prev, id]);

    try {
      await removeEnvioDetalleOrdenAcopio({ variables: { id } });
    } catch (error) {
      setAlertType("error");
      setAlertMessage("Error al eliminar el envío, descripción: " + error);
      setShowAlert(true);
      setEnviosEliminados((prev) => prev.filter((envioId) => envioId !== id));
    }
  };
  const handleConfirmacion = (confirmado: boolean) => {
    if (confirmado && idEnvioEliminar) {
      handleEliminarEnvio(idEnvioEliminar);
    }
    setIdEnvioEliminar(null);
    setShowConfirmacion(false);
  };
  const esEnvioEliminado = (id: number) => enviosEliminados.includes(id);

  return (
    <div className="bg-white border border-gray-200 rounded shadow-lg p-6 w-full">
      {showConfirmacion && (
        <Confirmacion
          isOpen={showConfirmacion}
          titulo="Eliminar Envío"
          mensaje={`¿Estás seguro de que deseas eliminar el envio?`}
          onClose={() => setShowConfirmacion(false)}
          onConfirm={handleConfirmacion}
        />
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-3">
        <h2 className="text-base font-semibold sm:text-lg">
          Detalle de Envíos
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
            onClick={() => {
              onClose();
              onProcesoCompleto && onProcesoCompleto();
            }}
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
      {showAlert && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
          cerrar={cerrarModal}
          modal={true}
        />
      )}
      {envios.map((envio) => (
        <div
          key={envio.id}
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg mt-2 gap-2 sm:gap-4 ${
            esEnvioEliminado(envio.id)
              ? "bg-red-50 border-red-200" // Estilo para eliminados
              : "border-gray-200 hover:bg-gray-50" // Estilo normal
          }`}
        >
          <div className="flex flex-col gap-1 sm:gap-2">
            <h2 className="text-sm sm:text-base">
              Código producto Enviado: {envio.codigo_producto_enviado}
              {esEnvioEliminado(envio.id) && (
                <span className="ml-2 text-red-500">(Eliminado)</span>
              )}
            </h2>
          </div>

          {!esEnvioEliminado(envio.id) && (
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
                <div className="flex justify-between items-center space-x-4">
                  <h2 className="text-sm sm:text-base w-full text-center">
                    Cantidad enviada: {String(envio.cantidad_enviada)}
                  </h2>
                  <button
                    className="bg-red-400 text-white font-semibold p-2 sm:px-4 sm:py-2 rounded hover:bg-red-500 transition duration-200 w-full sm:w-auto"
                    onClick={() => {
                      setShowConfirmacion(true);
                      setIdEnvioEliminar(envio.id);
                    }}
                    disabled={editLoading === envio.id}
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DropdownEnviosDetalleOrdenAcopio;
