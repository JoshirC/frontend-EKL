"use client";

import React, { useEffect, useState, use } from "react";
import { useSalidaStore } from "@/store/salidaStore";
import CambiarProducto from "@/components/salida_acopio/cambiarProducto";

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

export default function AcopioSalidaIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: id_acopio } = use(params);
  const [detalleOrdenAcopio, setDetalleOrdenAcopio] = useState<
    DetalleOrdenAcopio[]
  >([]);
  const { centroCosto, fecha, estado } = useSalidaStore();

  // Estado para manejar los valores temporales de cantidad enviada
  const [cantidadesTemporales, setCantidadesTemporales] = useState<
    Record<number, number>
  >({});

  useEffect(() => {
    const fetchDetalleOrden = async () => {
      try {
        const response = await fetch(`/api/detalleOrdenAcopio.json`);
        const data = await response.json();
        const detalleOrdenAcopioId = data.filter(
          (detalle: DetalleOrdenAcopio) =>
            detalle.idAcopio === Number(id_acopio)
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
    fetchDetalleOrden();
  }, [id_acopio]);

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
  const [modalCambiarProductoAbierto, setModalCambiarProductoAbierto] =
    useState(false);
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState<
    string | null
  >(null);

  const abrirModalCambiarProducto = (codigoProducto: string) => {
    setProductoSeleccionadoId(codigoProducto);
    setModalCambiarProductoAbierto(true);
  };

  const cerrarModalCambiarProducto = () => {
    setModalCambiarProductoAbierto(false);
    setProductoSeleccionadoId(null);
  };

  return (
    <div className="p-10">
      <CambiarProducto
        isOpen={modalCambiarProductoAbierto}
        onClose={cerrarModalCambiarProducto}
        codigoProducto={productoSeleccionadoId || ""}
      />
      <div className="bg-white p-6 rounded shadow">
        {estado === "Confirmacion" ? (
          <div className="text-2xl font-semibold">
            Confirmación de Acopio: {id_acopio}
          </div>
        ) : (
          <div className="text-2xl font-semibold">
            Detalle de Acopio: {id_acopio}
          </div>
        )}
        <div className="flex justify-around items-center my-4 space-x-6 font-bold">
          <div className="bg-gray-200 p-4 text-black rounded w-full text-center">
            {centroCosto}
          </div>
          <div className="bg-gray-200 p-4 text-black rounded w-full text-center">
            {fecha}
          </div>
          <div className="bg-gray-200 p-4 text-black rounded w-full text-center">
            {estado}
          </div>
        </div>
        <table className="table-auto w-full border-collapse border border-gray-200 mt-2">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Familia</th>
              <th className="border border-gray-300 px-4 py-2">Código</th>
              <th className="border border-gray-300 px-4 py-2">Descripción</th>
              <th className="border border-gray-300 px-4 py-2">Unidad</th>
              <th className="border border-gray-300 px-4 py-2">
                Cantidad Solicitada
              </th>
              <th className="border border-gray-300 px-4 py-2">
                Cantidad Enviada
              </th>
              <th className="border border-gray-300 py-2">Acciones</th>
              {detalleOrdenAcopio.some((detalle) => detalle.Trazabilidad) && (
                <th className="border border-gray-300 px-4 py-2">
                  Trazabilidad
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {detalleOrdenAcopio.map((detalle) => (
              <tr key={detalle.idDetalleOrdenAcopio}>
                <td className="border border-gray-300 px-4 py-2">
                  {detalle.FamiliaProducto}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {detalle.CodigoProducto}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {detalle.DescripcionProducto}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {detalle.UnidadMedida}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {detalle.Cantidad}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="flex justify-between items-center space-x-2">
                    {detalle.Enviado ? (
                      <span className="p-2">{detalle.CantidadEnviada}</span>
                    ) : (
                      <input
                        type="number"
                        placeholder={String(
                          cantidadesTemporales[detalle.idDetalleOrdenAcopio] ||
                            0
                        )}
                        onChange={(e) =>
                          handleCambioCantidad(
                            detalle.idDetalleOrdenAcopio,
                            Number(e.target.value)
                          )
                        }
                        className="w-full border border-gray-300 rounded p-2"
                        min="1"
                        max={detalle.Cantidad}
                      />
                    )}
                    {!detalle.Enviado && (
                      <button
                        onClick={() =>
                          handleGuardarCantidad(detalle.idDetalleOrdenAcopio)
                        }
                        className="bg-blue-400 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded transition duration-200"
                      >
                        Guardar
                      </button>
                    )}
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {estado === "Confirmacion" && detalle.Enviado === true ? (
                    <button
                      className="bg-blue-400 hover:bg-blue-500 w-full text-white font-semibold py-2 px-4 rounded transition duration-200"
                      onClick={() => (detalle.Enviado = !detalle.Enviado)}
                    >
                      Modificar
                    </button>
                  ) : detalle.Enviado ? (
                    <div></div>
                  ) : (
                    <button
                      className="bg-orange-400 hover:bg-orange-500 w-full text-white font-semibold py-2 px-4 rounded transition duration-200"
                      onClick={() =>
                        abrirModalCambiarProducto(detalle.CodigoProducto)
                      }
                    >
                      Cambiar
                    </button>
                  )}
                </td>
                {detalle.Trazabilidad && (
                  <td className="border border-gray-300 px-4 py-2">
                    <button className="bg-amber-400 hover:bg-amber-500 w-full text-white font-semibold py-2 px-4 rounded transition duration-200">
                      Seleccionar Lote
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {estado === "Confirmacion" && (
          <div className="flex justify-start items-center">
            <button className="bg-orange-400 hover:bg-orange-500 text-white font-semibold py-2 px-4 rounded transition duration-200 mt-4">
              Confirmar Orden
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
