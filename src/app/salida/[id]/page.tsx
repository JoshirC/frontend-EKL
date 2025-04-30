"use client";

import React, { useEffect, useState, use } from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import CambiarProducto from "@/components/salida_acopio/cambiarProducto";
import DropdownAcciones from "@/components/salida_acopio/DropdownAcciones";
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
        enviado
        envios {
          id
          cantidad_enviada
          codigo_producto_enviado
        }
      }
    }
  }
`;
const UPDATE_ESTADO_DETALLE_ACOPIO = gql`
  mutation updateEstadoEnviado($id: Float!) {
    updateEstadoEnviado(id: $id) {
      enviado
    }
  }
`;
const CREATE_ENVIO_DETALLE_ORDEN_ACOPIO = gql`
  mutation createEnvioDetalleOrdenAcopio(
    $id_detalle_orden_acopio: Float!
    $cantidad_enviada: Float!
    $codigo_producto_enviado: String!
  ) {
    createEnvioDetalleOrdenAcopio(
      createEnvioDetalleOrdenAcopioInput: {
        id_detalle_orden_acopio: $id_detalle_orden_acopio
        cantidad_enviada: $cantidad_enviada
        codigo_producto_enviado: $codigo_producto_enviado
      }
    ) {
      id
      cantidad_enviada
      codigo_producto_enviado
    }
  }
`;

export default function AcopioSalidaIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: id_acopio } = use(params);
  const id_acopio_num = parseFloat(id_acopio);

  const [cantidadesTemporales, setCantidadesTemporales] = useState<
    Record<number, number>
  >({});

  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

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

    try {
      await createEnvioDetalleOrdenAcopio({
        variables: {
          id_detalle_orden_acopio: id_detalle_orden_acopio,
          cantidad_enviada: cantidad_enviada,
          codigo_producto_enviado: codigo_producto_enviado,
        },
      });
      await updateEstadoEnviado({ variables: { id: id_detalle_orden_acopio } });

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

  return (
    <div className="p-4 sm:p-10">
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        {data.ordenAcopio.estado === "Confirmacion" ? (
          <div className="text-xl sm:text-2xl font-semibold">
            Confirmación de Acopio N°{id_acopio}
          </div>
        ) : (
          <div className="text-xl sm:text-2xl font-semibold">
            Detalle de Acopio N°{id_acopio}
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
                {/* Agregar aca la ventana de trazabilidad */}
              </tr>
            </thead>
            <tbody>
              {detalles.map((detalle) => (
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
                  <td className="border border-gray-300 sm:px-4 py-2 space-x-3">
                    {detalle.enviado ? (
                      detalle.envios.length > 1 ? (
                        <button
                          onClick={() => {
                            alert("Hay múltiples envíos para este detalle.");
                          }}
                          className="bg-green-400 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded transition duration-200 w-full"
                        >
                          Ver Envíos
                        </button>
                      ) : (
                        <span>
                          {detalle.envios[0]?.cantidad_enviada || "N/A"}
                        </span>
                      )
                    ) : (
                      <input
                        type="number"
                        value={cantidadesTemporales[detalle.id] || ""}
                        onChange={(e) =>
                          handleCambioCantidad(
                            detalle.id,
                            Number(e.target.value)
                          )
                        }
                        className="w-20 border border-gray-300 rounded p-1"
                      />
                    )}
                    {!detalle.enviado && (
                      <button
                        onClick={() => {
                          handleCrearEnvioDetalle(
                            detalle.id,
                            cantidadesTemporales[detalle.id] || 0,
                            detalle.codigo_producto
                          );
                          //handleCambiarEstadoEnviado(detalle.id);
                        }}
                        className="bg-blue-400 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded transition duration-200"
                      >
                        Guardar
                      </button>
                    )}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {detalle.enviado === true ? (
                      <button
                        className="bg-blue-400 hover:bg-blue-500 w-full text-white font-semibold py-2 px-4 rounded transition duration-200"
                        onClick={() => {
                          handleCambiarEstadoEnviado(detalle.id);
                        }}
                      >
                        Editar Cantidad
                      </button>
                    ) : detalle.enviado ? (
                      <div></div>
                    ) : (
                      <div>
                        <button
                          onClick={() => {
                            //handleDropdownClick(detalle.idDetalleOrdenAcopio);
                          }}
                          className="bg-orange-400 hover:bg-orange-500 w-full text-white font-semibold py-2 px-2 rounded transition duration-200"
                        >
                          Cambiar Producto
                        </button>
                      </div>
                    )}
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
