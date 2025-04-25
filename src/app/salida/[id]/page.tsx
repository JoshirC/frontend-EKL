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
import { useSalidaStore } from "@/store/salidaStore";
import CambiarProducto from "@/components/salida_acopio/cambiarProducto";
import DropdownAcciones from "@/components/salida_acopio/DropdownAcciones";

/**
 * Tipo que define la estructura de un detalle de orden de acopio
 */
type DetalleOrdenAcopio = {
  idDetalleOrdenAcopio: number;
  idAcopio: number;
  FamiliaProducto: string;
  CodigoProducto: string;
  DescripcionProducto: string;
  UnidadMedida: string;
  Cantidad: number;
  CantidadEnviada: number;
  Enviado: boolean;
  Trazabilidad: boolean;
};

/**
 * Componente principal de la página de detalle de salida/acopio
 *
 * @param params - Objeto que contiene el ID del acopio
 * @returns JSX.Element
 */
export default function AcopioSalidaIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Desempaquetar el ID del acopio de los parámetros
  const { id: id_acopio } = use(params);

  // Estado para almacenar los detalles de la orden de acopio
  const [detalleOrdenAcopio, setDetalleOrdenAcopio] = useState<
    DetalleOrdenAcopio[]
  >([]);

  // Obtener datos del store de salida
  const { centroCosto, fecha, estado } = useSalidaStore();

  // Estado para manejar los valores temporales de cantidad enviada
  const [cantidadesTemporales, setCantidadesTemporales] = useState<
    Record<number, number>
  >({});

  // Estado para el producto seleccionado en el modal
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState<
    string | null
  >(null);

  // Estado para controlar qué dropdown está abierto
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  // Estado para controlar la visibilidad del modal de cambiar producto
  const [modalCambiarProductoAbierto, setModalCambiarProductoAbierto] =
    useState(false);

  /**
   * Maneja el clic en el dropdown de acciones
   * @param id - ID del detalle de orden de acopio
   */
  const handleDropdownClick = (id: number) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  /**
   * Abre el modal para cambiar un producto
   * @param codigoProducto - Código del producto a cambiar
   */
  const abrirModalCambiarProducto = (codigoProducto: string) => {
    setProductoSeleccionadoId(codigoProducto);
    setModalCambiarProductoAbierto(true);
  };

  /**
   * Cierra el modal de cambiar producto
   */
  const cerrarModalCambiarProducto = () => {
    setModalCambiarProductoAbierto(false);
    setProductoSeleccionadoId(null);
  };

  /**
   * Maneja el cambio de cantidad en el input
   * @param id - ID del detalle de orden de acopio
   * @param valor - Nuevo valor de cantidad
   */
  const handleCambioCantidad = (id: number, valor: number) => {
    setCantidadesTemporales((prev) => ({
      ...prev,
      [id]: valor,
    }));
  };

  /**
   * Guarda la cantidad modificada para un producto
   * @param id - ID del detalle de orden de acopio
   */
  const handleGuardarCantidad = (id: number) => {
    if (cantidadesTemporales[id] <= 0) {
      alert("La cantidad debe ser mayor a 0");
      return;
    }

    setDetalleOrdenAcopio((prev) =>
      prev.map((item) =>
        item.idDetalleOrdenAcopio === id
          ? {
              ...item,
              CantidadEnviada: cantidadesTemporales[id],
              Enviado: true,
            }
          : item
      )
    );
  };

  /**
   * Obtiene los detalles de la orden de acopio del servidor
   */
  const fetchDetalleOrden = async () => {
    try {
      const response = await fetch(`/api/detalleOrdenAcopio.json`);
      const data = await response.json();
      const detalleOrdenAcopioId = data.filter(
        (detalle: DetalleOrdenAcopio) => detalle.idAcopio === Number(id_acopio)
      );
      setDetalleOrdenAcopio(detalleOrdenAcopioId);

      // Inicializar cantidades temporales
      const iniciales: Record<number, number> = detalleOrdenAcopioId.reduce(
        (acc: Record<number, number>, item: DetalleOrdenAcopio) => {
          acc[item.idDetalleOrdenAcopio] = item.CantidadEnviada;
          return acc;
        },
        {}
      );
      setCantidadesTemporales(iniciales);
    } catch (error) {
      console.error("Error al cargar el JSON:", error);
    }
  };

  // Cargar los detalles de la orden al montar el componente
  useEffect(() => {
    fetchDetalleOrden();
  }, [id_acopio]);

  return (
    <div className="p-4 sm:p-10">
      <CambiarProducto
        isOpen={modalCambiarProductoAbierto}
        onClose={cerrarModalCambiarProducto}
        codigoProducto={productoSeleccionadoId || ""}
      />
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        {estado === "Confirmacion" ? (
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
            Centro de Costo - {centroCosto}
          </div>
          <div className="bg-gray-200 p-3 sm:p-4 text-black rounded w-full text-center">
            Fecha - {fecha}
          </div>
          <div className="bg-gray-200 p-3 sm:p-4 text-black rounded w-full text-center">
            Estado - {estado}
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
                {detalleOrdenAcopio.some((detalle) => detalle.Trazabilidad) && (
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Trazabilidad
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {detalleOrdenAcopio.map((detalle) => (
                <React.Fragment key={detalle.idDetalleOrdenAcopio}>
                  <tr>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.FamiliaProducto}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.CodigoProducto}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.DescripcionProducto}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.UnidadMedida}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.Cantidad}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      <div className="flex justify-between items-center space-x-2">
                        {detalle.Enviado ? (
                          <span className="p-2">{detalle.CantidadEnviada}</span>
                        ) : (
                          <input
                            type="number"
                            placeholder={String(
                              cantidadesTemporales[
                                detalle.idDetalleOrdenAcopio
                              ] || 0
                            )}
                            onChange={(e) =>
                              handleCambioCantidad(
                                detalle.idDetalleOrdenAcopio,
                                Number(e.target.value)
                              )
                            }
                            className="w-24 sm:w-full border border-gray-300 rounded p-2"
                            min="1"
                            max={detalle.Cantidad}
                          />
                        )}
                        {!detalle.Enviado && (
                          <button
                            onClick={() =>
                              handleGuardarCantidad(
                                detalle.idDetalleOrdenAcopio
                              )
                            }
                            className="bg-blue-400 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded transition duration-200"
                          >
                            Guardar
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.Enviado === true ? (
                        <button
                          className="bg-blue-400 hover:bg-blue-500 w-full text-white font-semibold py-2 px-4 rounded transition duration-200"
                          onClick={() => {
                            detalle.Enviado = !detalle.Enviado;
                            fetchDetalleOrden();
                          }}
                        >
                          Editar Cantidad
                        </button>
                      ) : detalle.Enviado ? (
                        <div></div>
                      ) : (
                        <div>
                          <button
                            onClick={() => {
                              handleDropdownClick(detalle.idDetalleOrdenAcopio);
                            }}
                            className="bg-orange-400 hover:bg-orange-500 w-full text-white font-semibold py-2 px-2 rounded transition duration-200"
                          >
                            Cambiar Producto
                          </button>
                        </div>
                      )}
                    </td>
                    {detalle.Trazabilidad && (
                      <td className="border border-gray-300 px-2 sm:px-4 py-2">
                        <button className="bg-amber-400 hover:bg-amber-500 w-full text-white font-semibold py-2 px-4 rounded transition duration-200">
                          Seleccionar Lote
                        </button>
                      </td>
                    )}
                  </tr>
                  {dropdownOpen === detalle.idDetalleOrdenAcopio && (
                    <DropdownAcciones
                      codigoProducto={detalle.CodigoProducto}
                      descripcion={detalle.DescripcionProducto}
                      isOpen={dropdownOpen === detalle.idDetalleOrdenAcopio}
                      onClose={() => setDropdownOpen(null)}
                    />
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {estado === "Confirmacion" ? (
          <div className="flex justify-start items-center">
            <button className="bg-orange-400 hover:bg-orange-500 text-white font-semibold py-2 px-4 rounded transition duration-200 mt-4">
              Confirmar Orden
            </button>
          </div>
        ) : (
          <div className="flex justify-start items-center">
            <button className="bg-orange-400 hover:bg-orange-500 text-white font-semibold py-2 px-4 rounded transition duration-200 mt-4">
              Terminar Acopio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
