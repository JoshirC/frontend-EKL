"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ORDEN_ACOPIO_BY_ID_AND_ESTADO_PALLET } from "@/graphql/query";
import { CAMBIO_ESTADO_PALLET } from "@/graphql/mutations";
import Alert from "@/components/Alert";

type Producto = {
  codigo: string;
  nombre_producto: string;
  familia: string;
  unidad_medida: string;
  precio_unitario: number;
  cantidad: number;
};

type Pallet = {
  id: number;
  estado: string;
  numero_pallet: number;
};

type Envio = {
  id: number;
  cantidad_enviada: number;
  producto: Producto;
  pallet: Pallet;
};

type DetalleOrdenAcopio = {
  id: number;
  cantidad: number;
  producto: Producto;
  envios: Envio[];
};

type OrdenAcopio = {
  id: number;
  centroCosto: string;
  fecha: string;
  estado: string;
  detalles: DetalleOrdenAcopio[];
};

type EnvioConProducto = Envio & {
  producto: Producto;
  detalle: DetalleOrdenAcopio;
};

interface ModalSelectorPalletsProps {
  isOpen: boolean;
  onClose: () => void;
  id_orden_acopio: number;
  title?: string;
}

const ModalSelectorPallets: React.FC<ModalSelectorPalletsProps> = ({
  isOpen,
  onClose,
  id_orden_acopio,
  title = "Selector de Pallets",
}) => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  const [palletsSeleccionados, setPalletsSeleccionados] = useState<number[]>(
    []
  );

  const { loading, error, data } = useQuery(
    GET_ORDEN_ACOPIO_BY_ID_AND_ESTADO_PALLET,
    {
      variables: { id: id_orden_acopio, estado: null },
      skip: !isOpen || !id_orden_acopio,
    }
  );

  // Procesar datos para obtener lista de todos los envíos
  const todosLosEnvios = useMemo((): EnvioConProducto[] => {
    if (!data?.ordenAcopioByIdAndEstadoPallet) return [];

    const orden: OrdenAcopio = data.ordenAcopioByIdAndEstadoPallet;
    const envios: EnvioConProducto[] = [];

    // Recorrer todos los detalles y sus envíos
    orden.detalles.forEach((detalle) => {
      detalle.envios.forEach((envio) => {
        if (envio.pallet) {
          envios.push({
            ...envio,
            producto: detalle.producto,
            detalle: detalle,
          });
        }
      });
    });

    // Ordenar por número de pallet y luego por nombre de producto
    return envios.sort((a, b) => {
      const palletCompare = a.pallet.numero_pallet - b.pallet.numero_pallet;
      if (palletCompare !== 0) return palletCompare;
      return a.producto.nombre_producto.localeCompare(
        b.producto.nombre_producto
      );
    });
  }, [data]);

  // Obtener lista única de pallets para el filtro
  const palletsDisponibles = useMemo(() => {
    const pallets = todosLosEnvios.map((envio) => envio.pallet.numero_pallet);
    return [...new Set(pallets)].sort((a, b) => a - b);
  }, [todosLosEnvios]);

  const [editarEstadoPallets] = useMutation(CAMBIO_ESTADO_PALLET, {
    onCompleted: () => {
      setAlertType("exitoso");
      setAlertMessage("Pallets seleccionados exitosamente");
      setShowAlert(true);
      setTimeout(() => {
        onClose();
        setAlertMessage("");
        setShowAlert(false);
        setPalletsSeleccionados([]);
        window.location.href = `/salida/carga_softland/centro_costo/${id_orden_acopio}`;
      }, 3000);
    },
    onError: (error) => {
      setAlertMessage(error.message);
      setAlertType("error");
      setShowAlert(true);
    },
  });
  const handleEditPallets = () => {
    if (palletsSeleccionados.length === 0) {
      setAlertType("advertencia");
      setAlertMessage("Debe seleccionar al menos un pallet.");
      setShowAlert(true);
      return;
    }

    editarEstadoPallets({
      variables: {
        ids: todosLosEnvios
          .filter((envio) =>
            palletsSeleccionados.includes(envio.pallet.numero_pallet)
          )
          .map((envio) => envio.pallet.id),
        estado: "Subir",
      },
    });
  };
  // Seleccionar todos los pallets por defecto cuando estén disponibles
  useEffect(() => {
    if (palletsDisponibles.length > 0 && palletsSeleccionados.length === 0) {
      setPalletsSeleccionados(palletsDisponibles);
    }
  }, [palletsDisponibles]);

  // Limpiar selección al cerrar el modal
  useEffect(() => {
    if (!isOpen) {
      setPalletsSeleccionados([]);
    }
  }, [isOpen]);

  // Función para manejar la selección/deselección de pallets
  const togglePallet = (numeroPallet: number) => {
    setPalletsSeleccionados((prev) => {
      if (prev.includes(numeroPallet)) {
        // Si ya está seleccionado, lo removemos
        return prev.filter((p) => p !== numeroPallet);
      } else {
        // Si no está seleccionado, lo agregamos
        return [...prev, numeroPallet];
      }
    });
  };

  // Función para seleccionar todos los pallets
  const seleccionarTodos = () => {
    setPalletsSeleccionados(palletsDisponibles);
  };

  // Función para deseleccionar todos los pallets
  const deseleccionarTodos = () => {
    setPalletsSeleccionados([]);
  };

  // Función para verificar si un pallet está seleccionado
  const isPalletSeleccionado = (numeroPallet: number) => {
    return palletsSeleccionados.includes(numeroPallet);
  };

  // Función para confirmar la selección
  const confirmarSeleccion = () => {
    if (palletsSeleccionados.length === 0) {
      setAlertType("advertencia");
      setAlertMessage("Debe seleccionar al menos un pallet.");
      setShowAlert(true);
      return;
    }
    onClose();
  };
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 px-4">
      <div className="bg-white rounded shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {showAlert && (
          <Alert
            type={alertType}
            message={alertMessage}
            onClose={() => setShowAlert(false)}
          />
        )}

        {/* Header del modal */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Seleccione los pallets necesarios, los cuales se convertirán en guía
            de salida.
          </p>
        </div>

        {/* Contenido del modal */}
        <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-600">Cargando pallets disponibles...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">
                Error al cargar los pallets: {error.message}
              </p>
            </div>
          )}

          {!loading && !error && palletsDisponibles.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">
                No hay pallets disponibles para esta orden de acopio.
              </p>
            </div>
          )}

          {!loading && !error && palletsDisponibles.length > 0 && (
            <>
              {/* Información de selección */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  {/* Botones de control */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={seleccionarTodos}
                      className="px-3 py-2 bg-blue-400 font-semibold text-white rounded hover:bg-blue-500 transition-colors"
                    >
                      Seleccionar Todos
                    </button>
                    <button
                      onClick={deseleccionarTodos}
                      className="px-3 py-2 bg-red-500 font-semibold text-white rounded hover:bg-red-600 transition-colors"
                    >
                      Deseleccionar Todos
                    </button>
                  </div>
                  <h4 className="font-semibold text-gray-800">
                    Pallets Disponibles ({palletsDisponibles.length})
                  </h4>
                </div>
              </div>

              {/* Selector de Pallets */}
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                {palletsDisponibles.map((numeroPallet) => (
                  <button
                    key={numeroPallet}
                    onClick={() => togglePallet(numeroPallet)}
                    className={`px-4 py-2 rounded font-medium transition-all duration-200 ${
                      isPalletSeleccionado(numeroPallet)
                        ? "bg-orange-400 text-white shadow-md"
                        : "bg-gray-300 text-gray-500 hover:bg-orange-400 hover:text-white"
                    }`}
                  >
                    {numeroPallet}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer del modal */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={() => handleEditPallets()}
              className="px-4 py-2 font-semibold text-white bg-orange-400 rounded hover:bg-orange-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={loading || palletsSeleccionados.length === 0}
            >
              Confirmar Selección ({palletsSeleccionados.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalSelectorPallets;
