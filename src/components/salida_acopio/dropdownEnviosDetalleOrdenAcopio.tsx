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
  cantidad: number;
  familia: string;
  trazabilidad?: boolean;
};
type Pallet = {
  id: number;
  numero_pallet: number;
  estado: string;
};
interface Envio {
  id: number;
  cantidad_enviada: number;
  codigo_producto_enviado: string;
  producto?: Producto;
  pallet: Pallet;
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
  const [editPalletValues, setEditPalletValues] = useState<
    Record<number, string>
  >({});
  const [editLoading, setEditLoading] = useState<number | null>(null);
  const [enviosEliminados, setEnviosEliminados] = useState<number[]>([]);
  const [botonCargando, setBotonCargando] = useState(false);
  const [enviosEnEdicion, setEnviosEnEdicion] = useState<number[]>([]);

  const { loading, error, data, refetch } = useQuery<{
    detalleOrdenAcopioID: DetalleOrdenAcopio;
  }>(GET_DETALLE_ORDEN_ACOPIO_BY_ID, {
    variables: { id: id_detalle_orden_acopio },
  });

  const [updateCantidadEnvioDetalle] = useMutation(
    UPDATE_CANTIDAD_ENVIO_DETALLE,
    {
      onCompleted: () => {
        refetch();
        setEditLoading(null);
        setAlertType("exitoso");
        setAlertMessage("Cantidad del envío actualizada correctamente");
        setShowAlert(true);
        setActivarEditar(false);
        setBotonCargando(false);
      },
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

  const handleEditPalletChange = (envioId: number, value: string) => {
    setEditPalletValues((prev) => ({ ...prev, [envioId]: value }));
  };

  const handleToggleEdicion = (envioId: number) => {
    setEnviosEnEdicion((prev) =>
      prev.includes(envioId)
        ? prev.filter((id) => id !== envioId)
        : [...prev, envioId]
    );

    // Limpiar valores si se cancela la edición
    if (enviosEnEdicion.includes(envioId)) {
      setEditValues((prev) => {
        const newValues = { ...prev };
        delete newValues[envioId];
        return newValues;
      });
      setEditPalletValues((prev) => {
        const newValues = { ...prev };
        delete newValues[envioId];
        return newValues;
      });
    }
  };

  const esEnvioEnEdicion = (id: number) => enviosEnEdicion.includes(id);
  const handleSaveEdit = async (
    envioId: number,
    cantidad_enviada: number,
    cantidad_sistema: number,
    numero_pallet_actual: number
  ) => {
    const cantidadValue = editValues[envioId];
    const palletValue = editPalletValues[envioId];

    // Validar cantidad
    if (!cantidadValue || isNaN(Number(cantidadValue))) {
      setAlertType("advertencia");
      setAlertMessage("La cantidad debe ser un número válido");
      setShowAlert(true);
      setBotonCargando(false);
      setEditLoading(null);
      return;
    }

    // Validar pallet
    if (
      !palletValue ||
      isNaN(Number(palletValue)) ||
      Number(palletValue) <= 0
    ) {
      setAlertType("advertencia");
      setAlertMessage(
        "El número de pallet debe ser un número válido mayor a 0"
      );
      setShowAlert(true);
      setBotonCargando(false);
      setEditLoading(null);
      return;
    }

    const cantidad = Number(cantidadValue);
    const numeroPallet = Number(palletValue);

    if (cantidad <= 0) {
      setAlertType("advertencia");
      setAlertMessage("La cantidad debe ser mayor a cero");
      setShowAlert(true);
      setBotonCargando(false);
      setEditLoading(null);
      return;
    }

    if (enviosEliminados.includes(envioId)) {
      setAlertType("advertencia");
      setAlertMessage("No se puede editar un envío eliminado");
      setShowAlert(true);
      setBotonCargando(false);
      setEditLoading(null);
      return;
    }

    if (cantidad > cantidad_sistema + cantidad_enviada) {
      setAlertType("advertencia");
      setAlertMessage(
        `La cantidad no puede ser mayor a la cantidad del sistema (${cantidad_sistema})`
      );
      setShowAlert(true);
      setBotonCargando(false);
      setEditLoading(null);
      return;
    }

    // Verificar si hay cambios
    if (
      cantidad === cantidad_enviada &&
      numeroPallet === numero_pallet_actual
    ) {
      setAlertType("advertencia");
      setAlertMessage("No se han realizado cambios");
      setShowAlert(true);
      setBotonCargando(false);
      setEditLoading(null);
      return;
    }

    setEditLoading(envioId);
    try {
      // Construir el objeto de entrada solo con los campos que han cambiado
      const updateInput: any = {
        id: envioId,
        cantidad: cantidad,
      };

      // Solo incluir numero_pallet si es diferente al actual
      if (numeroPallet !== numero_pallet_actual) {
        updateInput.numero_pallet = numeroPallet;
      }

      await updateCantidadEnvioDetalle({
        variables: {
          updateEnvioDetalleOrdenAcopioInput: updateInput,
        },
      });

      // Limpiar los valores editados y salir del modo edición
      setEditValues((prev) => {
        const newValues = { ...prev };
        delete newValues[envioId];
        return newValues;
      });
      setEditPalletValues((prev) => {
        const newValues = { ...prev };
        delete newValues[envioId];
        return newValues;
      });
      setEnviosEnEdicion((prev) => prev.filter((id) => id !== envioId));
    } catch (error) {
      setAlertType("error");
      setAlertMessage("Error al actualizar: " + error);
      setShowAlert(true);
      setBotonCargando(false);
      setEditLoading(null);
    }
    setEditLoading(null);
  };

  const handleEliminarEnvio = async (id: number) => {
    setEnviosEliminados((prev) => [...prev, id]);
    try {
      await removeEnvioDetalleOrdenAcopio({ variables: { id } });
    } catch (error) {
      setAlertType("error");
      setAlertMessage("Error al eliminar el envío: " + error);
      setShowAlert(true);
      setBotonCargando(false);
      setEditLoading(null);
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
      <div className="bg-white border border-gray-200 rounded shadow-xl py-8 px-6 m-2 max-w-6xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Cargando detalles del acopio...
        </h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded shadow-xl py-6 px-6 m-2 max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">!</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">
                Error al cargar datos
              </h3>
              <p className="text-red-600">{error.message}</p>
            </div>
          </div>
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 transition-colors duration-200"
            onClick={onClose}
            aria-label="Cerrar"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const detalleOrdenAcopio = data?.detalleOrdenAcopioID;
  const envios = detalleOrdenAcopio?.envios;

  return (
    <div className="bg-white border border-gray-200 rounded shadow-xl py-6 px-6 m-2 mx-auto">
      {showConfirmacion && (
        <Confirmacion
          isOpen={showConfirmacion}
          titulo="Anular Envío"
          mensaje="¿Estás seguro de que deseas anular el envío?"
          onClose={() => setShowConfirmacion(false)}
          onConfirm={handleConfirmacion}
        />
      )}

      {/* Header principal - Simplificado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Detalle de Envíos
            </h2>
            <p className="text-sm text-gray-600">
              Gestiona los envíos de la orden de acopio
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-6 py-2.5 rounded transition-all duration-200 flex items-center gap-2 shadow-sm"
            onClick={() => {
              onClose();
              onProcesoCompleto?.();
            }}
          >
            Cerrar
          </button>
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
          className={`bg-white border rounded-xl p-6 mt-4 relative border-gray-300 ${
            envio.pallet?.estado === "Cerrado"
              ? "bg-gray-300 opacity-75 pointer-events-none"
              : esEnvioEliminado(envio.id)
              ? "bg-red-100 opacity-75"
              : "border-gray-300"
          }`}
        >
          {/* Información del producto */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium text-gray-700">Producto Enviado</h4>
              </div>
              <p className="text-gray-800 font-semibold">
                {envio.producto?.nombre_producto ?? "N/A"}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Código:</span>{" "}
                {envio.codigo_producto_enviado}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <p className="text-sm font-medium">Cantidad</p>
                </div>
                <p className="text-xl font-bold">{envio.cantidad_enviada}</p>
                <p className="text-xs">
                  {envio.producto?.unidad_medida || "unidades"}
                </p>
              </div>

              <div className="rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <p className="text-sm font-medium">Pallet</p>
                </div>
                <p className="text-xl font-bold">
                  #{envio.pallet?.numero_pallet}
                </p>
              </div>
            </div>
          </div>

          {/* Acciones */}
          {!esEnvioEliminado(envio.id) &&
            envio.pallet?.estado !== "Cerrado" && (
              <div className="border-t border-gray-200 pt-4">
                {esEnvioEnEdicion(envio.id) ? (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nueva cantidad (Máximo:{" "}
                          {envio.producto?.cantidad ?? 0})
                        </label>
                        <input
                          type="number"
                          placeholder={`Actual: ${envio.cantidad_enviada}`}
                          value={editValues[envio.id] ?? ""}
                          onChange={(e) =>
                            handleEditChange(envio.id, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          min="1"
                          max={envio.producto?.cantidad ?? 0}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nuevo pallet
                        </label>
                        <input
                          type="number"
                          placeholder={`Actual: ${
                            envio.pallet?.numero_pallet ?? 0
                          }`}
                          value={editPalletValues[envio.id] ?? ""}
                          onChange={(e) =>
                            handleEditPalletChange(envio.id, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          min="1"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => {
                            setBotonCargando(true);
                            handleSaveEdit(
                              envio.id,
                              envio.cantidad_enviada,
                              envio.producto?.cantidad ?? 0,
                              envio.pallet?.numero_pallet ?? 0
                            );
                          }}
                          disabled={editLoading === envio.id || botonCargando}
                          className={`w-full ${
                            editLoading === envio.id || botonCargando
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-orange-400 hover:bg-orange-500"
                          } text-white rounded font-medium p-2 transition-colors duration-200 flex items-center justify-center gap-2`}
                        >
                          {editLoading === envio.id ? (
                            <>
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                              Guardando...
                            </>
                          ) : (
                            <>Guardar</>
                          )}
                        </button>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => handleToggleEdicion(envio.id)}
                          className="w-full bg-red-500 hover:bg-red-600 text-white rounded font-semibold p-2 transition-colors duration-200"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end gap-3">
                    <button
                      className={`${
                        envio.pallet?.estado === "Cerrado"
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-400 hover:bg-blue-500"
                      } text-white font-semibold px-4 py-2 rounded transition-colors duration-200 flex items-center gap-2 shadow-sm`}
                      onClick={() => handleToggleEdicion(envio.id)}
                      disabled={envio.pallet?.estado === "Cerrado"}
                    >
                      Editar
                    </button>
                    <button
                      className={`${
                        envio.pallet?.estado === "Cerrado"
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-red-500 hover:bg-red-600"
                      } text-white font-semibold px-4 py-2 rounded transition-colors duration-200 flex items-center gap-2 shadow-sm`}
                      onClick={() => {
                        setShowConfirmacion(true);
                        setIdEnvioEliminar(envio.id);
                      }}
                      disabled={envio.pallet?.estado === "Cerrado"}
                    >
                      Anular
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
