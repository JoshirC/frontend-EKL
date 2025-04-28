/**
 * Página de Detalle de Salida/Acopio
 *
 * Esta página muestra los detalles de una orden de acopio específica, permitiendo:
 * - Ver la información general del acopio (centro de costo, fecha, estado)
 * - Ver y modificar las cantidades de productos
 * - Cambiar productos si es necesario
 * - Gestionar la trazabilidad de los productos
 *
 * Componentes principales:
 * - Encabezado con información general del acopio
 * - Tabla de productos con sus detalles
 * - Modal para cambiar productos
 * - Dropdown de acciones por producto
 */

"use client";

import React, { useEffect, useState, use } from "react";
import { useQuery, gql } from "@apollo/client";
import { useSalidaStore } from "@/store/salidaStore";
import CambiarProducto from "@/components/salida_acopio/cambiarProducto";
import DropdownAcciones from "@/components/salida_acopio/DropdownAcciones";

type DetalleOrdenAcopio = {
  id: number;
  familia_producto: string;
  nombre_producto: string;
  codigo_producto: string;
  cantidad: number;
  unidad: string;
  cantidadEnviada: number;
  enviado: boolean;
  trazabilidad: boolean;
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
      }
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

  const { centroCosto, fecha, estado } = useSalidaStore();

  const [cantidadesTemporales, setCantidadesTemporales] = useState<
    Record<number, number>
  >({});
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState<
    string | null
  >(null);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [modalCambiarProductoAbierto, setModalCambiarProductoAbierto] =
    useState(false);

  const { loading, error, data } = useQuery(GET_ORDEN_ACOPIO, {
    variables: { id: id_acopio_num },
  });

  useEffect(() => {
    if (data) {
      const detalles = data.ordenAcopio.detalles.map((detalle: any) => ({
        ...detalle,
        cantidadEnviada: 0,
        enviado: false,
        trazabilidad: false,
      }));

      setCantidadesTemporales(
        detalles.reduce(
          (acc: Record<number, number>, item: DetalleOrdenAcopio) => {
            acc[item.id] = 0;
            return acc;
          },
          {}
        )
      );
    }
  }, [data]);

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

  const handleGuardarCantidad = (id: number) => {
    if (cantidadesTemporales[id] <= 0) {
      alert("La cantidad debe ser mayor a 0");
      return;
    }

    const detalleIndex = detalles.findIndex((detalle) => detalle.id === id);
    if (detalleIndex !== -1) {
      detalles[detalleIndex].cantidadEnviada = cantidadesTemporales[id];
      detalles[detalleIndex].enviado = true;
    }
  };

  return (
    <div className="p-4 sm:p-10">
      <CambiarProducto
        isOpen={modalCambiarProductoAbierto}
        onClose={() => setModalCambiarProductoAbierto(false)}
        codigoProducto={productoSeleccionadoId || ""}
      />
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <div className="text-xl sm:text-2xl font-semibold">
          Detalle de Acopio N°{id_acopio}
        </div>
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
                  Cantidad
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
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {detalle.enviado ? (
                      <span>{detalle.cantidadEnviada}</span>
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
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {!detalle.enviado && (
                      <button
                        onClick={() => handleGuardarCantidad(detalle.id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded"
                      >
                        Guardar
                      </button>
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
