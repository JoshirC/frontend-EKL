"use client";
import React, { useState } from "react";
import {
  UPDATE_CANTIDAD_ENVIO_DETALLE,
  REMOVE_ENVIO_DETALLE_ORDEN_ACOPIO,
} from "@/graphql/mutations";
import { GET_DETALLE_ORDEN_ACOPIO_BY_ID } from "@/graphql/query";
import { useMutation, useQuery } from "@apollo/client";
import Alert from "../Alert";
import Confirmacion from "../confirmacion";

type Producto = {
  id?: number;
  codigo: string;
  nombre_producto: string;
  unidad_medida: string;
  familia: string;
  trazabilidad?: boolean;
};

interface Envio {
  id: number;
  cantidad_enviada: number;
  codigo_producto_enviado: string;
  producto?: Producto;
}

interface DetalleOrdenAcopio {
  codigo_producto: string;
  cantidad: number;
  producto: Producto;
  envios: Envio[];
}

interface DropdownEnviosDetalleOrdenAcopioProps {
  isOpen: boolean;
  id_detalle_orden_acopio: number;
  onClose: () => void;
  onProcesoCompleto?: () => void;
}

const DropdownEnviosDetalleOrdenAcopio: React.FC<
  DropdownEnviosDetalleOrdenAcopioProps
> = ({ isOpen, id_detalle_orden_acopio, onClose, onProcesoCompleto }) => {
  if (!isOpen) return null;

  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [idEnvioEliminar, setIdEnvioEliminar] = useState<number | null>(null);
  const [cerrarModal, setCerrarModal] = useState(false);
  const [activarEditar, setActivarEditar] = useState(false);
  const [editValues, setEditValues] = useState<Record<number, string>>({});
  const [editLoading, setEditLoading] = useState<number | null>(null);
  const [enviosEliminados, setEnviosEliminados] = useState<number[]>([]);

  const { loading, error, data } = useQuery<{
    detalleOrdenAcopioID: DetalleOrdenAcopio;
  }>(GET_DETALLE_ORDEN_ACOPIO_BY_ID, {
    variables: { id: id_detalle_orden_acopio },
  });

  const [updateCantidadEnvioDetalle] = useMutation(
    UPDATE_CANTIDAD_ENVIO_DETALLE,
    {
      onCompleted: () => setEditLoading(null),
      onError: (mutationError) => {
        setAlertType("error");
        setAlertMessage(
          "Error al actualizar la cantidad del envío: " + mutationError.message
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
        setAlertType("error");
        setAlertMessage("Error al eliminar el envío: " + error.message);
        setShowAlert(true);
        setEditLoading(null);
      },
    }
  );

  const handleEditChange = (envioId: number, value: string) => {
    setEditValues((prev) => ({ ...prev, [envioId]: value }));
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
      setAlertMessage("La cantidad debe ser mayor a cero");
      setShowAlert(true);
      return;
    }

    setEditLoading(envioId);
    try {
      await updateCantidadEnvioDetalle({
        variables: {
          id: envioId,
          cantidad,
        },
      });
      setEditValues((prev) => {
        const newValues = { ...prev };
        delete newValues[envioId];
        return newValues;
      });
    } catch (error) {
      setAlertType("error");
      setAlertMessage("Error al actualizar: " + error);
      setShowAlert(true);
    }
  };

  const handleEliminarEnvio = async (id: number) => {
    setEnviosEliminados((prev) => [...prev, id]);
    try {
      await removeEnvioDetalleOrdenAcopio({ variables: { id } });
    } catch (error) {
      setAlertType("error");
      setAlertMessage("Error al eliminar el envío: " + error);
      setShowAlert(true);
      setEnviosEliminados((prev) => prev.filter((envioId) => envioId !== id));
    }
  };

  const handleConfirmacion = (confirmado: boolean) => {
    if (confirmado && idEnvioEliminar !== null) {
      handleEliminarEnvio(idEnvioEliminar);
    }
    setIdEnvioEliminar(null);
    setShowConfirmacion(false);
  };

  const esEnvioEliminado = (id: number) => enviosEliminados.includes(id);

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
      <div className="bg-red-100 text-red-700 p-4 rounded flex justify-between items-center">
        <span>Error: {error.message}</span>
        <button
          className="ml-4 text-red-700 font-bold text-lg hover:text-red-900"
          onClick={onClose}
          aria-label="Cerrar"
        >
          x
        </button>
      </div>
    );
  }

  const detalleOrdenAcopio = data?.detalleOrdenAcopioID;
  const envios = detalleOrdenAcopio?.envios;

  return (
    <div className="bg-white border border-gray-200 rounded shadow-lg py-3 sm:py-4 px-4 sm:px-8 m-1">
      {showConfirmacion && (
        <Confirmacion
          isOpen={showConfirmacion}
          titulo="Eliminar Envío"
          mensaje="¿Estás seguro de que deseas eliminar el envío?"
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
            className="bg-orange-400 text-white font-semibold px-4 py-2 rounded hover:bg-orange-500"
            onClick={() => {
              setActivarEditar(!activarEditar);
              if (activarEditar) setEditValues({});
            }}
          >
            {activarEditar ? "Cancelar" : "Editar Cantidades"}
          </button>
          <button
            className="bg-gray-500 text-white font-semibold px-4 py-2 rounded hover:bg-gray-600"
            onClick={() => {
              onClose();
              onProcesoCompleto?.();
            }}
          >
            Cerrar
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-around items-center my-3 gap-4 ">
        <div className="bg-gray-200 p-2 rounded text-center w-full">
          Producto: {detalleOrdenAcopio?.producto?.nombre_producto ?? "N/A"}
        </div>
        <div className="bg-gray-200 p-2 rounded text-center w-full">
          Código Producto: {detalleOrdenAcopio?.codigo_producto}
        </div>
        <div className="bg-gray-200 p-2 rounded text-center w-full">
          Familia: {detalleOrdenAcopio?.producto?.familia ?? "N/A"}
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

      {envios?.map((envio) => (
        <div
          key={envio.id}
          className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border rounded-lg mt-2 gap-2 ${
            esEnvioEliminado(envio.id)
              ? "bg-red-50 border-red-200"
              : "border-gray-200 hover:bg-gray-50"
          }`}
        >
          <div className="flex flex-col gap-1">
            <h2 className="">
              Nombre del producto: {envio.producto?.nombre_producto ?? "N/A"}
            </h2>
            <h2 className="">
              Código producto Enviado: {envio.codigo_producto_enviado}
              {esEnvioEliminado(envio.id) && (
                <span className="ml-2 text-red-500">(Eliminado)</span>
              )}
            </h2>
          </div>

          {!esEnvioEliminado(envio.id) && (
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-1/3">
              {activarEditar ? (
                <div className="flex w-full gap-2">
                  <input
                    type="number"
                    placeholder={`Cantidad: ${envio.cantidad_enviada}`}
                    value={editValues[envio.id] ?? ""}
                    onChange={(e) => handleEditChange(envio.id, e.target.value)}
                    className="w-full border p-2 rounded"
                  />
                  <button
                    onClick={() => handleSaveEdit(envio.id)}
                    disabled={editLoading === envio.id}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
                  >
                    {editLoading === envio.id ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              ) : (
                <div className="flex justify-end items-center gap-4 w-full">
                  <h2 className="">
                    Cantidad enviada: {envio.cantidad_enviada}
                  </h2>
                  <button
                    className="bg-red-500 text-white font-semibold px-4 py-2 rounded hover:bg-red-600"
                    onClick={() => {
                      setShowConfirmacion(true);
                      setIdEnvioEliminar(envio.id);
                    }}
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
