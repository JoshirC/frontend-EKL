"use client";

import React, { useState, use } from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import CambiarProducto from "@/components/salida_acopio/cambiarProducto";
import DropdownAcciones from "@/components/salida_acopio/DropdownAcciones";
import DropdownEnviosDetalleOrdenAcopio from "@/components/salida_acopio/dropdownEnviosDetalleOrdenAcopio";
import {
  CREATE_ENVIO_DETALLE_ORDEN_ACOPIO,
  UPDATE_ESTADO_DETALLE_ACOPIO,
  UPDATE_ESTADO_ORDEN_ACOPIO,
  UPDATE_CANTIDAD_ENVIO_DETALLE,
} from "@/graphql/mutations";
import { GET_ORDEN_ACOPIO } from "@/graphql/query";
import { useJwtStore } from "@/store/jwtStore";
type Envio = {
  id: number;
  id_detalle_orden_acopio: number;
  cantidad_enviada: number;
  codigo_producto_enviado: string;
};

type DetalleOrdenAcopio = {
  id: number;
  id_orden_acopio: number;
  familia_producto: string;
  nombre_producto: string;
  codigo_producto: string;
  cantidad: number;
  unidad: string;
  enviado: boolean;
  envios: Envio[];
};

export default function AcopioSalidaIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: id_acopio } = use(params);
  const id_acopio_num = parseFloat(id_acopio);
  const { rutUsuario } = useJwtStore();
  const [cantidadesTemporales, setCantidadesTemporales] = useState<
    Record<number, number>
  >({});
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [dropdownEnviosOpen, setDropdownEnviosOpen] = useState<number | null>(
    null
  );
  // Estado para el dropdown de cambiar producto
  const [dropdownCambiarProductoOpen, setDropdownCambiarProductoOpen] =
    useState<number | null>(null);

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  // Nuevos estados para la edición
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [editLoading, setEditLoading] = useState<number | null>(null);

  const { loading, error, data, refetch } = useQuery(GET_ORDEN_ACOPIO, {
    variables: { id: id_acopio_num },
  });

  const [createEnvioDetalleOrdenAcopio] = useMutation(
    CREATE_ENVIO_DETALLE_ORDEN_ACOPIO,
    {
      onCompleted: () => {
        refetch();
      },
      onError: (mutationError) => {
        console.error(
          "Error al crear el envío del detalle de orden de acopio:",
          mutationError.message
        );
      },
    }
  );

  const [updateEstadoEnviado] = useMutation(UPDATE_ESTADO_DETALLE_ACOPIO, {
    onCompleted: () => {
      refetch();
    },
    onError: (mutationError) => {
      console.error(
        "Error al actualizar el estado de enviado:",
        mutationError.message
      );
    },
  });
  const [updateCantidadEnvioDetalle] = useMutation(
    UPDATE_CANTIDAD_ENVIO_DETALLE,
    {
      onCompleted: () => {
        refetch(); // Refrescar los datos después de la mutación
        setEditingId(null); // Salir del modo de edición
        setEditValue(""); // Limpiar el valor de edición
      },
      onError: (mutationError) => {
        console.error(
          "Error al actualizar la cantidad:",
          mutationError.message
        );
        alert(
          "Ocurrió un error al actualizar la cantidad. Intente nuevamente."
        );
      },
    }
  );
  const [updateEstadoOrdenAcopio] = useMutation(UPDATE_ESTADO_ORDEN_ACOPIO, {
    onCompleted: () => {
      window.history.back();
    },
    onError: (mutationError) => {
      console.error(
        "Error al actualizar el estado de la orden de acopio:",
        mutationError.message
      );
      alert("Ocurrió un error al actualizar el estado. Intente nuevamente.");
    },
  });

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
            Error al cargar los datos: {error.message}
          </p>
        </div>
      </div>
    );
  }

  const detalles: DetalleOrdenAcopio[] = data.ordenAcopio.detalles;

  // Lógica de paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = detalles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(detalles.length / itemsPerPage);

  const handleCambioCantidad = (id: number, valor: number) => {
    setCantidadesTemporales((prev) => ({
      ...prev,
      [id]: valor,
    }));
  };

  const handleCrearEnvioDetalle = async (
    id_detalle_orden_acopio: number,
    cantidad_enviada: number,
    codigo_producto_enviado: string
  ) => {
    if (cantidad_enviada <= 0) {
      alert("La cantidad enviada debe ser mayor a 0");
      return;
    }

    if (!rutUsuario) {
      alert("El RUT del usuario no está definido. Intente nuevamente.");
      return;
    }

    try {
      await createEnvioDetalleOrdenAcopio({
        variables: {
          id_detalle_orden_acopio: Number(id_detalle_orden_acopio),
          cantidad_enviada: Number(cantidad_enviada),
          codigo_producto_enviado: String(codigo_producto_enviado),
          usuario_rut: String(rutUsuario),
        },
      });

      try {
        await updateEstadoEnviado({
          variables: { id: id_detalle_orden_acopio },
        });
      } catch (err) {
        console.error("Error al actualizar el estado de enviado:", err);
        alert("Ocurrió un error al actualizar el estado de enviado.");
      }

      setCantidadesTemporales((prev) => ({
        ...prev,
        [id_detalle_orden_acopio]: 0,
      }));
    } catch (err) {
      console.error("Error al guardar el envío y cambiar estado:", err);
      alert("Ocurrió un error al guardar. Intente nuevamente.");
    }
  };

  const handleCambiarEstadoEnviado = (id: number) => {
    updateEstadoEnviado({ variables: { id } });
  };

  // Función para manejar el clic en Editar
  const handleEditClick = (detalle: DetalleOrdenAcopio) => {
    setEditingId(detalle.id);
    setEditValue(detalle.envios[0]?.cantidad_enviada?.toString() || "");
  };
  // Función para guardar los cambios editados
  const handleSaveEdit = async (detalleId: number, envioId: number) => {
    if (!editValue || isNaN(Number(editValue))) {
      alert("Por favor ingrese una cantidad válida");
      return;
    }

    const cantidad = Number(editValue);
    if (cantidad <= 0) {
      alert("La cantidad debe ser mayor a 0");
      return;
    }

    setEditLoading(detalleId);

    try {
      await updateCantidadEnvioDetalle({
        variables: {
          id: envioId,
          cantidad: cantidad,
        },
      });
    } catch (error) {
      console.error("Error al actualizar la cantidad:", error);
      alert("Ocurrió un error al actualizar la cantidad");
    } finally {
      setEditLoading(null);
    }
  };

  // Función para cancelar la edición
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  // Función para manejar el clic en el botón de Ver Envíos
  const handleDropdownEnviosClick = (id: number) => {
    setDropdownEnviosOpen(dropdownOpen === id ? null : id);
  };
  // Función para manejar el clic en el botón de Cambiar Producto
  const handleDropdownCambiarProductoClick = (id: number) => {
    setDropdownCambiarProductoOpen(
      dropdownCambiarProductoOpen === id ? null : id
    );
  };
  const handleCambioEstadoAcopio = (estado: string) => {
    updateEstadoOrdenAcopio({
      variables: {
        id: id_acopio_num,
        estado: estado,
      },
    });
  };

  return (
    <div className="p-4 sm:p-10">
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        {data.ordenAcopio.estado === "Confirmacion" ? (
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <div className="text-xl sm:text-2xl font-semibold">
              Confirmación de Acopio N°{id_acopio}
            </div>
            <button
              className="bg-orange-400 text-white font-semibold px-4 py-2 rounded hover:bg-orange-500 transition duration-200"
              onClick={handleCambioEstadoAcopio.bind(null, "Subir")}
            >
              Confirmar Acopio
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <div className="text-xl sm:text-2xl font-semibold">
              Detalle de Acopio N°{id_acopio}
            </div>
            <div className="flex space-x-2">
              <button
                className="bg-orange-400 text-white font-semibold px-4 py-2 rounded hover:bg-orange-500 transition duration-200"
                onClick={handleCambioEstadoAcopio.bind(null, "Confirmacion")}
              >
                Terminar Acopio
              </button>
              <button
                className="bg-gray-300 text-white font-semibold px-4 py-2 rounded hover:bg-gray-400 transition duration-200"
                onClick={handleCambioEstadoAcopio.bind(null, "Proceso")}
              >
                Continuar Luego...
              </button>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-around items-center my-4 gap-4 sm:gap-6 font-bold">
          <div className="bg-gray-200 p-3 sm:p-4 text-black rounded w-full text-center">
            Centro de Costo - {data.ordenAcopio.centroCosto}
          </div>
          <div className="bg-gray-200 p-3 sm:p-4 text-black rounded w-full text-center">
            Fecha - {data.ordenAcopio.fecha}
          </div>
          <div className="bg-gray-200 p-3 sm:p-4 text-black rounded w-full text-center">
            Estado - {data.ordenAcopio.estado}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-200 mt-2 text-sm sm:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Familia
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Código
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Descripción
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Unidad
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Cantidad Solicitada
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Cantidad Enviada
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((detalle) => (
                <React.Fragment key={detalle.id}>
                  <tr key={detalle.id}>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.familia_producto}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.codigo_producto}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.nombre_producto}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.unidad}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.cantidad}
                    </td>
                    {/* VERIFICACIÓN SI EXISTE DETALLES EN ENVIADO */}
                    {detalle.envios.length == 0 ? (
                      //Aqui no existe un envio relacionado al detalle
                      <>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                          {/* Columna cantidad enviada */}
                          <div className="flex items-center justify-between space-x-2">
                            <input
                              type="number"
                              value={cantidadesTemporales[detalle.id] || ""}
                              onChange={(e) =>
                                handleCambioCantidad(
                                  detalle.id,
                                  Number(e.target.value)
                                )
                              }
                              className="w-full border border-gray-300 rounded p-1"
                            />
                            <button
                              onClick={() => {
                                handleCrearEnvioDetalle(
                                  detalle.id,
                                  cantidadesTemporales[detalle.id] || 0,
                                  detalle.codigo_producto
                                );
                              }}
                              className="bg-blue-400 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded transition duration-200"
                            >
                              Guardar
                            </button>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                          {/* Columna acciones */}
                          <button
                            onClick={() => {
                              handleDropdownCambiarProductoClick(detalle.id);
                            }}
                            className="bg-orange-400 hover:bg-orange-500 w-full text-white font-semibold py-2 px-2 rounded transition duration-200"
                          >
                            Cambiar Producto
                          </button>
                        </td>
                      </>
                    ) : //Aqui existe un envio o mas relacionado al detalle

                    detalle.envios.length > 1 ? (
                      // Aca existen varios envios relacionados al detalle
                      <>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                          <button
                            onClick={() => {
                              handleDropdownEnviosClick(detalle.id);
                            }}
                            className="bg-orange-400 hover:bg-orange-500 text-white font-semibold py-2 px-4 rounded transition duration-200 w-full"
                          >
                            Ver Envíos
                          </button>
                        </td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2"></td>
                      </>
                    ) : (
                      // Aca existe un solo envio relacionado al detalle
                      <>
                        {/* Verifico si el producto enviado es diferente al producto del detalle */}
                        {detalle.codigo_producto !==
                        detalle.envios[0].codigo_producto_enviado ? (
                          <>
                            <td className="border border-gray-300 px-2 sm:px-4 py-2 text-gray-400 font-semibold">
                              {detalle.envios[0]?.cantidad_enviada || "N/A"}
                            </td>
                            <td className="border border-gray-300 px-2 sm:px-4 py-2">
                              <button
                                className="bg-blue-400 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded transition duration-200 w-full"
                                onClick={() => {
                                  handleDropdownEnviosClick(detalle.id);
                                }}
                              >
                                Ver Producto
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            {/* El producto concuerda en el envio */}
                            <td className="border border-gray-300 px-2 sm:px-4 py-2">
                              {/* Verifico si se esta editando el ID detalle */}
                              {editingId === detalle.id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={editValue}
                                    onChange={(e) =>
                                      setEditValue(e.target.value)
                                    }
                                    className="w-20 border border-gray-300 rounded p-1"
                                  />
                                  <button
                                    onClick={() =>
                                      handleSaveEdit(
                                        detalle.id,
                                        detalle.envios[0].id
                                      )
                                    }
                                    disabled={editLoading === detalle.id}
                                    className="bg-blue-400 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded transition duration-200 w-full"
                                  >
                                    {editLoading === detalle.id
                                      ? "..."
                                      : "Guardar"}
                                  </button>
                                </div>
                              ) : (
                                detalle.envios[0]?.cantidad_enviada || "N/A"
                              )}
                            </td>
                            <td className="border border-gray-300 px-2 sm:px-4 py-2">
                              {/* Si se esta editando, cambio la accion a cancelar */}
                              {editingId === detalle.id ? (
                                <button
                                  onClick={handleCancelEdit}
                                  className="bg-red-500 hover:bg-red-600  text-white font-semibold py-2 px-4 rounded transition duration-200 w-full"
                                >
                                  Cancelar
                                </button>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEditClick(detalle)}
                                    className="bg-blue-400 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded transition duration-200 w-full"
                                  >
                                    Editar
                                  </button>
                                  <button className="bg-red-400 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded transition duration-200 w-full">
                                    Eliminar
                                  </button>
                                </div>
                              )}
                            </td>
                          </>
                        )}
                      </>
                    )}
                  </tr>
                  {/* Fila expandida condicional de envios*/}
                  {dropdownEnviosOpen === detalle.id && (
                    <tr>
                      <td colSpan={7} className="border-0 p-2 sm:p-4">
                        <DropdownEnviosDetalleOrdenAcopio
                          detalleOrdenAcopio={detalle}
                          envios={detalle.envios}
                          isOpen={true}
                          onClose={() => setDropdownEnviosOpen(null)}
                        />
                      </td>
                    </tr>
                  )}
                  {/* Fila expandida condicional de cambiar producto*/}
                  {dropdownCambiarProductoOpen === detalle.id && (
                    <tr>
                      <td colSpan={7} className="border-0 p-2 sm:p-4">
                        <DropdownAcciones
                          id_detalle_orden_acopio={detalle.id}
                          codigoProducto={detalle.codigo_producto}
                          descripcion={detalle.nombre_producto}
                          cantidad={detalle.cantidad}
                          isOpen={true}
                          onClose={() => setDropdownCambiarProductoOpen(null)}
                          onProductoEnviado={refetch}
                        />
                      </td>
                    </tr>
                  )}
                  {/* Fila expandida condicional de acciones*/}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {/* Controles de paginación */}
          <div className="flex justify-between items-center mt-4">
            <div>
              <span className="text-sm text-gray-700">
                Mostrando {(currentPage - 1) * itemsPerPage + 1} a{" "}
                {Math.min(currentPage * itemsPerPage, detalles.length)} de{" "}
                {detalles.length} registros
              </span>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded font-semibold ${
                  currentPage === 1
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                }`}
              >
                Anterior
              </button>

              {Array.from({ length: Math.min(5, totalPages) }).map(
                (_, index) => {
                  // Mostrar máximo 5 páginas
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = index + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = index + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + index;
                  } else {
                    pageNumber = currentPage - 2 + index;
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-4 py-2 rounded font-semibold ${
                        currentPage === pageNumber
                          ? "bg-gray-500 text-white"
                          : "bg-gray-300 hover:bg-gray-500 text-white"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                }
              )}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded font-semibold ${
                  currentPage === totalPages
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                }`}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
