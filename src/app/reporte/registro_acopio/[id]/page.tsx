"use client";

import React, { use, useState, useEffect } from "react";
import { GET_ENVIO_DETALLE_ORDEN_ACOPIO_BY_ID_ORDEN } from "@/graphql/query";
import { useQuery } from "@apollo/client";
import Alert from "@/components/Alert";

type Producto = {
  nombre_producto: string;
  codigo: string;
  familia: string;
  unidad_medida: string;
};
type Usuario = {
  id: number;
  rut: string;
  nombre: string;
};

type DetalleOrdenAcopio = {
  id: number;
  id_orden_acopio: number;
  producto: Producto;
  cantidad: number;
  enviado: boolean;
};

type Envio = {
  id: number;
  detalleOrdenAcopio: DetalleOrdenAcopio;
  usuario: Usuario;
  producto: Producto;
  codigo_producto_enviado: string;
  cantidad_enviada: number;
  guiaSalida?: {
    numero_folio: string;
  };
};

export default function RegistroAcopioIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: id_acopio } = use(params);
  const id_acopio_num = parseFloat(id_acopio);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  const { loading, error, data } = useQuery(
    GET_ENVIO_DETALLE_ORDEN_ACOPIO_BY_ID_ORDEN,
    {
      variables: { id_orden_acopio: id_acopio_num },
    }
  );

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

  const detalleEnvio: Envio[] = data?.envioDetalleOrdenAcopioByIdOrden ?? [];

  return (
    <div className="p-4 sm:p-10">
      {showAlert && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <div className="text-xl sm:text-2xl font-semibold">
          Detalles de Salida de la Orden de Acopio N°{id_acopio}
        </div>
        <div className="flex flex-col sm:flex-row justify-start mt-4 space-x-3">
          <div className="bg-orange-100 font-semibold px-4 py-2 rounded">
            Diferencia entre Producto Solicitado vs Producto Enviado
          </div>
          <div className="bg-gray-100 font-semibold px-4 py-2 rounded">
            Diferencia en Cantidad Solicitada vs Cantidad Enviada
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-auto text-center w-full border-collapse border border-gray-200 mt-4 text-sm sm:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Código Producto Solicitado
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Nombre Producto Solicitado
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Cantidad Solicitada
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Código Producto Enviado
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Nombre Producto Enviado
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Cantidad Enviada
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Encargado de Envio
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Guia Salida
                </th>
              </tr>
            </thead>
            <tbody>
              {detalleEnvio.map((detalle) => {
                const codigoDiferente =
                  detalle.detalleOrdenAcopio.producto.codigo !==
                  detalle.codigo_producto_enviado;

                const cantidadDiferente =
                  detalle.detalleOrdenAcopio.cantidad !==
                  detalle.cantidad_enviada;

                // Prioridad: código diferente (naranja) sobre cantidad diferente (gris)
                const rowClass = codigoDiferente
                  ? "bg-orange-100"
                  : cantidadDiferente
                  ? "bg-gray-100"
                  : "";

                return (
                  <tr key={detalle.id} className={rowClass}>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.detalleOrdenAcopio.producto.codigo}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.detalleOrdenAcopio.producto.nombre_producto}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.detalleOrdenAcopio.cantidad}{" "}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.codigo_producto_enviado}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.producto.nombre_producto}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.usuario.nombre}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.cantidad_enviada}{" "}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.guiaSalida ? (
                        detalle.guiaSalida.numero_folio
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
