"use client";
import React, { useState, use } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { CONSOLIDADO_CL_BY_ID } from "@/graphql/query";
import { ConsolidadoCLPorIdResponse } from "@/types/graphql";
import {
  CAMBIAR_ESTADO_ORDENES_ACOPIO_CONSOLIDADO,
  ENVIAR_CORREO_CONSOLIDADO_CL,
} from "@/graphql/mutations";
import { ordenarProductos } from "@/utils/ordenarProductosConsolidados";
import Cargando from "@/components/cargando";
import Alert from "@/components/Alert";
interface cl_page_Props {
  params: Promise<{ tipo: string; id: string }>;
}

export default function ClPage({ params }: cl_page_Props) {
  const [cargando, setCargando] = useState(false);
  const [mensajeCargando, setMensajeCargando] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [showAlert, setShowAlert] = useState(false);
  const [centroSeleccionado, setCentroSeleccionado] = useState<string>("");

  const { id } = use(params);
  const { loading, error, data } = useQuery(CONSOLIDADO_CL_BY_ID, {
    variables: { id: parseInt(id, 10) },
  });
  const [enviarCorreoConsolidadoCL] = useMutation(
    ENVIAR_CORREO_CONSOLIDADO_CL,
    {
      onCompleted: () => {
        setCargando(false);
        setAlertType("exitoso");
        setAlertMessage("Correo enviado exitosamente");
        setShowAlert(true);
      },
      onError: (error) => {
        setCargando(false);
        setAlertMessage(error.message);
        setAlertType("error");
        setShowAlert(true);
      },
    }
  );
  const [cambiarEstadoOrdenesAcopio] = useMutation(
    CAMBIAR_ESTADO_ORDENES_ACOPIO_CONSOLIDADO,
    {
      onCompleted: () => {
        setCargando(false);
        setAlertType("exitoso");
        setAlertMessage("Consolidado listo para Acopiar");
        setShowAlert(true);
        setTimeout(() => {
          window.location.href = "/adquisiciones/consolidado";
        }, 1000);
      },
      onError: (error) => {
        setCargando(false);
        setAlertMessage(error.message);
        setAlertType("error");
        setShowAlert(true);
      },
    }
  );

  const handleCambiarEstado = () => {
    if (id != null) {
      cambiarEstadoOrdenesAcopio({
        variables: { id: parseInt(id, 10), nuevoEstado: "Cerrado" },
      });
      setMensajeCargando("Enviando a Acopio, por favor espere...");
      setCargando(true);
    }
  };
  const handleEnviarCorreo = () => {
    if (id != null) {
      enviarCorreoConsolidadoCL({
        variables: { id_consolidado: parseFloat(id) },
      });
      setCargando(true);
      setMensajeCargando("Enviando correo, por favor espere...");
    }
  };
  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const consolidado: ConsolidadoCLPorIdResponse | null =
    data?.consolidadoSolicitudPorId;

  // Lista de centros disponibles
  const centrosDisponibles = consolidado?.centros?.map((c) => c.centro) ?? [];

  // Si no hay centro seleccionado aún, elegir el primero
  const centroActivo =
    centroSeleccionado ||
    (centrosDisponibles.length > 0 ? centrosDisponibles[0] : "");

  const centroData = consolidado?.centros.find(
    (c) => c.centro === centroActivo
  );
  const productosOrdenados = centroData
    ? ordenarProductos(centroData.productos)
    : [];
  return (
    <div className="p-4 sm:p-10">
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="text-xl sm:text-2xl font-semibold">
            Consolidado N°{id} de Solicitud de Compra Local
          </div>
          <div className="space-x-2">
            <button
              className="bg-orange-400 hover:bg-orange-500 text-white font-bold px-4 py-2 rounded"
              onClick={handleEnviarCorreo}
            >
              Enviar por Correo
            </button>
            <button
              onClick={handleCambiarEstado}
              className="bg-blue-400 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded"
            >
              Completar Compra
            </button>
          </div>
        </div>
        {showAlert && (
          <Alert
            type={alertType}
            message={alertMessage}
            onClose={() => setShowAlert(false)}
          />
        )}
        {cargando && (
          <Cargando
            isOpen={cargando}
            mensaje={mensajeCargando}
            onClose={() => setCargando(false)}
          />
        )}
        {/* Info del consolidado */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="bg-gray-100 border-l-4 border-gray-500 p-4 rounded-lg shadow-sm">
            <p className="text-sm font-medium">Estado</p>
            <p className="font-semibold text-gray-800">
              {consolidado?.estado || "N/A"}
            </p>
          </div>
          <div className="bg-gray-100 border-l-4 border-gray-500 p-4 rounded-lg shadow-sm">
            <p className="text-sm font-medium">Fecha Inicio</p>
            <p className="font-semibold text-gray-800">
              {consolidado?.fecha_inicio || "N/A"}
            </p>
          </div>
          <div className="bg-gray-100 border-l-4 border-gray-500 p-4 rounded-lg shadow-sm">
            <p className="text-sm font-medium">Fecha Término</p>
            <p className="font-semibold text-gray-800">
              {consolidado?.fecha_termino || "N/A"}
            </p>
          </div>
        </div>

        {/* Botones de Centros de Costo */}
        <h2 className="text-lg font-semibold mt-4 mb-2">Centros de Costo</h2>
        <div className="flex flex-wrap gap-2">
          {centrosDisponibles.map((centro) => (
            <button
              key={centro}
              onClick={() => setCentroSeleccionado(centro)}
              className={`px-4 py-2 rounded border text-sm font-medium transition ${
                centroActivo === centro
                  ? "bg-orange-400 text-white"
                  : "bg-gray-100 hover:bg-orange-400 hover:text-white text-gray-700 border-gray-300"
              }`}
            >
              {centro}
            </button>
          ))}
        </div>

        {/* Tabla de detalles */}
        <h2 className="text-lg font-semibold mt-4 mb-2">
          Listado de Productos
        </h2>
        <div className="overflow-x-auto mt-4">
          <table className="table-auto text-center w-full border-collapse border border-gray-200 text-sm sm:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 border border-gray-300 text-left">
                  FAMILIA
                </th>
                <th className="px-4 py-2 border border-gray-300 text-left">
                  COD. PRODUCTO
                </th>
                <th className="px-4 py-2 border border-gray-300 text-left">
                  DESCRIPCIÓN
                </th>
                <th className="px-4 py-2 border border-gray-300 text-left">
                  UNIDAD
                </th>
                <th className="px-4 py-2 border border-gray-300">LU</th>
                <th className="px-4 py-2 border border-gray-300">MA</th>
                <th className="px-4 py-2 border border-gray-300">MI</th>
                <th className="px-4 py-2 border border-gray-300">JU</th>
                <th className="px-4 py-2 border border-gray-300">VI</th>
                <th className="px-4 py-2 border border-gray-300">SA</th>
                <th className="px-4 py-2 border border-gray-300">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {productosOrdenados.length > 0 ? (
                productosOrdenados.map((prod) => (
                  <tr
                    key={prod.codigo_producto}
                    className="hover:bg-gray-100 transition-colors"
                  >
                    <td className="px-4 py-2 border border-gray-300 text-left">
                      {prod.familia}
                    </td>
                    <td className="px-4 py-2 border border-gray-300 text-left">
                      {prod.codigo_producto}
                    </td>
                    <td className="px-4 py-2 border border-gray-300 text-left">
                      {prod.descripcion_producto}
                    </td>
                    <td className="px-4 py-2 border border-gray-300 text-left">
                      {prod.unidad}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {prod.Lu ? prod.Lu : ""}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {prod.Ma ? prod.Ma : ""}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {prod.Mi ? prod.Mi : ""}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {prod.Ju ? prod.Ju : ""}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {prod.Vi ? prod.Vi : ""}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {prod.Sa ? prod.Sa : ""}
                    </td>
                    <td className="px-4 py-2 border border-gray-300 text-orange-500">
                      {prod.total}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={12}
                    className="px-4 py-2 border border-gray-300 text-center text-gray-500"
                  >
                    Selecciona un centro de costo para ver los productos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
