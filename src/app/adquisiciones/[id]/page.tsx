"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import Alert from "@/components/Alert";
import FamilyPagination from "@/components/FamilyPagination";
import { GET_ORDEN_ACOPIO } from "@/graphql/query";
import {
  UPDATE_ESTADO_ORDEN_ACOPIO,
  ELIMINAR_ORDEN_ACOPIO,
  EDITAR_CANTIDAD_DETALLE_ORDEN_ACOPIO,
  ELIMINAR_PRODUCTO_DETALLE_ORDEN_ACOPIO,
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
  const [confirmacionMensaje, setConfirmacionMensaje] = useState("");
  const [confirmacionTitulo, setConfirmacionTitulo] = useState("");
  const [funcion, setFuncion] = useState("");

  // Estados para filtros
  const [currentFamily, setCurrentFamily] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDetalles, setFilteredDetalles] = useState<
    DetalleOrdenAcopio[]
  >([]);

  // Estados para edición en línea
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingCantidad, setEditingCantidad] = useState<number>(0);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { loading, error, data, refetch } = useQuery(GET_ORDEN_ACOPIO, {
    variables: { id: id_acopio_num },
  });

  // Efecto para filtrar los detalles
  useEffect(() => {
    if (data?.ordenAcopio?.detalles) {
      const filtered = data.ordenAcopio.detalles.filter(
        (detalle: DetalleOrdenAcopio) => {
          const matchesSearch =
            detalle.codigo_producto
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            detalle.producto.nombre_producto
              .toLowerCase()
              .includes(searchTerm.toLowerCase());

          const matchesFamily =
            !currentFamily || detalle.producto.familia === currentFamily;

          return matchesSearch && matchesFamily;
        }
      );

      setFilteredDetalles(filtered);
    }
  }, [data, searchTerm, currentFamily]);
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
  const [editarCantidadDetalleOrdenAcopio] = useMutation(
    EDITAR_CANTIDAD_DETALLE_ORDEN_ACOPIO,
    {
      onCompleted: () => {
        setAlertType("exitoso");
        setAlertMessage("La cantidad se ha actualizado correctamente");
        setShowAlert(true);
        setEditingId(null);
        setEditingCantidad(0);
        refetch();
      },
      onError: (mutationError) => {
        setAlertType("error");
        setAlertMessage(mutationError.message);
        setShowAlert(true);
      },
    }
  );
  const [eliminarProductoDetalleOrdenAcopio] = useMutation(
    ELIMINAR_PRODUCTO_DETALLE_ORDEN_ACOPIO,
    {
      onCompleted: () => {
        setAlertType("exitoso");
        setAlertMessage("El producto se ha eliminado correctamente");
        setShowAlert(true);
        setDeleteId(null);
        refetch();
      },
      onError: (mutationError) => {
        setAlertType("error");
        setAlertMessage(mutationError.message);
        setShowAlert(true);
      },
    }
  );
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
      if (funcion === "eliminarSolicitud") {
        handleEliminarOrdenAcopio();
      }
      if (funcion === "eliminarProducto") {
        handleEliminarProducto();
      }
    }
    setShowConfirmacion(false);
  };
  const handleEditarProducto = (detalle: DetalleOrdenAcopio) => {
    setEditingId(detalle.id);
    setEditingCantidad(detalle.cantidad);
  };

  const handleGuardarCantidad = (detalle: DetalleOrdenAcopio) => {
    if (editingCantidad <= 0) {
      setShowAlert(true);
      setAlertType("advertencia");
      setAlertMessage("La cantidad debe ser mayor a cero.");
      return;
    }
    editarCantidadDetalleOrdenAcopio({
      variables: {
        id: detalle.id,
        cantidad: editingCantidad,
      },
    });
    setEditingId(null);
    setEditingCantidad(0);
  };

  const handleCancelarEdicion = () => {
    setEditingId(null);
    setEditingCantidad(0);
  };

  const handleEliminarProducto = () => {
    if (deleteId === null) return;

    eliminarProductoDetalleOrdenAcopio({
      variables: {
        id: deleteId,
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
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>Error al cargar los detalles del acopio: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!data?.ordenAcopio?.detalles) {
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>No se encontraron datos del acopio</p>
        </div>
      </div>
    );
  }

  const { detalles } = data.ordenAcopio;

  // Extraer familias únicas de los detalles
  const familyGroups: string[] =
    detalles.length > 0
      ? (
          Array.from(
            new Set(
              detalles
                .map((detalle: DetalleOrdenAcopio) => detalle.producto?.familia)
                .filter(Boolean)
            )
          ) as string[]
        ).sort()
      : [];

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
          titulo={confirmacionTitulo}
          mensaje={confirmacionMensaje}
          onClose={() => setShowConfirmacion(false)}
          onConfirm={handleConfirmacion}
        />
      )}
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="text-xl sm:text-2xl font-semibold">
            Detalles de Solicitud Abastecimiento N°{id_acopio}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              className="bg-orange-400 text-white font-semibold p-3 sm:p-4 rounded hover:bg-orange-500 transition duration-300 w-full sm:w-auto"
              onClick={handleConfirmarAcopio}
            >
              Confirmar Solicitud
            </button>
            <button
              className="bg-red-500 text-white font-semibold p-3 sm:p-4 rounded hover:bg-red-600 transition duration-300 w-full sm:w-auto"
              onClick={() => {
                setShowConfirmacion(true);
                setConfirmacionTitulo("Eliminar Solicitud");
                setConfirmacionMensaje(
                  "¿Estás seguro de que deseas eliminar esta solicitud?"
                );
                setFuncion("eliminarSolicitud");
              }}
            >
              Cancelar Solicitud
            </button>
          </div>
        </div>

        {/* Controles de filtro */}
        {detalles.length > 0 && (
          <>
            <div className="flex flex-col sm:flex-row justify-start items-center mt-4 pb-4 gap-4">
              <FamilyPagination
                familyGroups={familyGroups}
                currentFamily={currentFamily}
                onFamilyChange={setCurrentFamily}
                disabled={loading}
                showAllOption={true}
                allOptionText="Todas las familias"
              />
              {/* Barra de Busqueda */}
              <input
                type="text"
                placeholder="Buscar por código o nombre del producto..."
                className="w-full p-4 my-4 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </>
        )}

        {filteredDetalles.length === 0 && detalles.length > 0 ? (
          <p className="mt-4 text-center text-gray-500">
            No se encontraron productos que coincidan con los filtros aplicados
          </p>
        ) : detalles.length === 0 ? (
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
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDetalles.map((detalle: DetalleOrdenAcopio) => (
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
                      {editingId === detalle.id ? (
                        <input
                          type="number"
                          value={editingCantidad}
                          onChange={(e) =>
                            setEditingCantidad(Number(e.target.value))
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="1"
                        />
                      ) : (
                        detalle.cantidad
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      <div className="flex flex-col sm:flex-row gap-2">
                        {editingId === detalle.id ? (
                          <>
                            <button
                              className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition duration-200 w-full"
                              onClick={() => handleGuardarCantidad(detalle)}
                            >
                              Guardar
                            </button>
                            <button
                              className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition duration-200 w-full"
                              onClick={handleCancelarEdicion}
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded transition duration-200 w-full"
                              onClick={() => handleEditarProducto(detalle)}
                            >
                              Editar
                            </button>
                            <button
                              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-200 w-full"
                              onClick={() => {
                                handleEliminarProducto();
                                setDeleteId(detalle.id);
                                setShowConfirmacion(true);
                                setConfirmacionTitulo("Eliminar Producto");
                                setConfirmacionMensaje(
                                  "¿Estás seguro de que deseas eliminar este producto?"
                                );
                                setFuncion("eliminarProducto");
                              }}
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
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
