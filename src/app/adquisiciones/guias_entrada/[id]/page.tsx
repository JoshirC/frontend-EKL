"use client";
import React, { useState, useEffect } from "react";
import { GET_GUIA_ENTRADA_BY_ID } from "@/graphql/query";
import { useQuery } from "@apollo/client";
type Producto = {
  codigo: string;
  nombre_producto: string;
  familia: string;
  unidad_medida: string;
};

type GuiaEntradaDetalle = {
  id: number;
  cantidad_ingresada: number;
  precio_unitario: number;
  producto: Producto;
};

type GuiaEntrada = {
  id: number;
  codigo_bodega: string;
  numero_folio: number;
  fecha_generacion: string;
  codigo_proveedor: string;
  codigo_centro_costo: string;
  observacion: string;
  numero_factura: number;
  fecha_factura: string;
  numero_orden_compra: string;
  estado: string;
  guiaEntradaDetalle: GuiaEntradaDetalle[];
};
export default function DetalleGuiaEntradaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const id_numero = parseInt(id, 10);
  const { loading, error, data } = useQuery(GET_GUIA_ENTRADA_BY_ID, {
    variables: { id: id_numero },
  });
  if (loading)
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow animate-pulse">
          <p className="text-gray-700">Cargando guía de entrada...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow border-l-4 border-red-500">
          <p className="text-red-600 font-medium">
            Error al cargar guía de entrada:
          </p>
          <p className="text-gray-700 mt-2">{error.message}</p>
        </div>
      </div>
    );

  const guiaEntrada: GuiaEntrada = data?.guiaEntrada || {};
  return (
    <div className="p-4 sm:p-10">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-4">
          Detalle de Guía de Entrada N°{id_numero}
        </h1>
        {/* Tabla de productos */}
        <div className="overflow-x-auto">
          <table className="table-auto text-center w-full border-collapse border border-gray-200 mt-2 text-sm sm:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Código Producto
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Familia
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Producto
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Cantidad Ingresada
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Precio Unitario
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {guiaEntrada.guiaEntradaDetalle.map((detalle) => (
                <tr key={detalle.id}>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {detalle.producto.codigo}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {detalle.producto.familia}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {detalle.producto.nombre_producto}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {detalle.cantidad_ingresada}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    $
                    {detalle.precio_unitario.toLocaleString("es-CL", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    $
                    {(
                      detalle.cantidad_ingresada * detalle.precio_unitario
                    ).toLocaleString("es-CL", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
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
