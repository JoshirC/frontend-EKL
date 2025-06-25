"use client";
import React, { useEffect, useMemo, useState } from "react";
import { GET_GUIA_ENTRADA_BY_ESTADO } from "@/graphql/query";
import { UPDATE_ESTADO_GUIA_ENTRADAS } from "@/graphql/mutations";
import { useQuery, useMutation } from "@apollo/client";
import * as XLSX from "xlsx";
import Alert from "@/components/Alert";
type Producto = {
  codigo: string;
  nombre_producto: string;
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
  numero_factura: number;
  fecha_factura: string;
  numero_orden_compra: string;
  estado: string;
  guiaEntradaDetalle: GuiaEntradaDetalle[];
};
const CargaSoftlandPage: React.FC = () => {
  const exportarAExcel = () => {
    const datos = guiasEntrada.flatMap((guia) =>
      guia.guiaEntradaDetalle.map((detalle) => ({
        "N° Folio": guia.numero_folio,
        "N° Orden Compra": guia.numero_orden_compra,
        "N° Factura": guia.numero_factura,
        "Código Bodega": guia.codigo_bodega,
        "Código Producto": detalle.producto?.codigo ?? "N/A",
        "Nombre Producto": detalle.producto?.nombre_producto ?? "N/A",
        "Cantidad Ingresada": detalle.cantidad_ingresada,
        "Precio Unitario": detalle.precio_unitario?.toFixed(2),
      }))
    );

    const worksheet = XLSX.utils.json_to_sheet(datos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guias de Entrada");

    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = fecha.getFullYear();
    const fechaActual = `${dia}-${mes}-${anio}`;
    XLSX.writeFile(workbook, `carga-masiva-guia-entrada-${fechaActual}.xlsx`);
    const listaIds = guiasEntrada.map((guia) => guia.id);
    handleActualizarEstado(listaIds, "Cargada");
  };
  // Estado para almacenar el mensaje de alerta
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  const [botonCargando, setBotonCargando] = useState(false);
  const { loading, error, data } = useQuery(GET_GUIA_ENTRADA_BY_ESTADO, {
    variables: { estado: "Subir" },
  });
  const [updateEstadoGuiaEntrada] = useMutation(UPDATE_ESTADO_GUIA_ENTRADAS, {
    refetchQueries: [
      { query: GET_GUIA_ENTRADA_BY_ESTADO, variables: { estado: "Subir" } },
    ],
  });
  const handleActualizarEstado = async (listId: number[], estado: string) => {
    try {
      await updateEstadoGuiaEntrada({
        variables: { listId, estado },
      });
      setShowAlert(true);
      setAlertType("exitoso");
      setAlertMessage("Archivo Generado exitosamente");
      setTimeout(() => {
        window.location.reload();
      }, 3000); // Ocultar alerta después de 3 segundos
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      alert("Error al actualizar el estado");
    }
  };
  if (loading)
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>Cargando guías de entrada...</p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>{error.message}</p>
        </div>
      </div>
    );

  const guiasEntrada: GuiaEntrada[] = data?.guiaEntradaByEstado || [];
  return (
    <div className="p-4 sm:p-10">
      {showAlert && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
          cerrar={true}
        />
      )}
      {/* Contenedor principal */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Título de la página */}
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl font-semibold mb-4">
            Carga Softland Guias de Entrada
          </h1>
          <button
            className={`${
              botonCargando
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-orange-400 hover:bg-orange-500"
            } text-white font-semibold p-3 sm:p-4 rounded transition duration-300 w-full sm:w-auto whitespace-nowrap`}
            onClick={() => {
              exportarAExcel();
              setBotonCargando(true);
            }}
            disabled={botonCargando}
          >
            Exportar a Excel
          </button>
        </div>
        {/* Tabla de datos */}
        <div className="overflow-x-auto mt-6">
          <table className="table-auto w-full text-center border-collapse border border-gray-200 mt-2 text-sm sm:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  N° Folio
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  N° Orden Compra
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  N° Factura
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Código Bodega
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Código Producto
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Nombre Producto
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Cantidad Ingresada
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Precio Unitario
                </th>
              </tr>
            </thead>
            <tbody>
              {guiasEntrada.flatMap((guia) =>
                guia.guiaEntradaDetalle.map((detalle) => (
                  <tr key={`${guia.id}-${detalle.id}`}>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {guia.numero_folio}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {guia.numero_orden_compra}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {guia.numero_factura}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {guia.codigo_bodega}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.producto.codigo}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.producto.nombre_producto}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.cantidad_ingresada}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.precio_unitario.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CargaSoftlandPage;
